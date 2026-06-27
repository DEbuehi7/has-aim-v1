/**
 * CCBill Webhook / Postback Ingestion Route
 *
 * Route: POST /api/ccbill/webhook
 *
 * CCBill sends postbacks as application/x-www-form-urlencoded.
 * This handler:
 *   1. Optionally verifies a shared secret (CCBILL_WEBHOOK_SECRET) if configured
 *   2. Parses and normalizes the payload
 *   3. Inserts a raw event record into ccbill_webhook_events
 *   4. Upserts subscriber state into aura8_subscribers
 *   5. Returns 200 OK so CCBill does not retry
 *
 * Security notes:
 *   - This route is server-only (no "use client" directive)
 *   - Secrets are read from env vars only, never logged
 *   - IP is captured from X-Forwarded-For (Vercel sets this)
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { normalizeCCBillPayload } from "@/lib/ccbill/normalize";
import {
  mapCCBillEventToStatus,
  isPaymentSuccess,
} from "@/lib/ccbill/map-status";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract a safe subset of request headers for storage.
 * We capture diagnostic headers but deliberately exclude Authorization
 * and Cookie headers to avoid storing sensitive data.
 */
function safeHeaders(req: NextRequest): Record<string, string> {
  const keep = [
    "content-type",
    "user-agent",
    "x-forwarded-for",
    "x-real-ip",
    "x-ccbill-signature",
    "x-request-id",
    "referer",
    "origin",
  ];
  const out: Record<string, string> = {};
  for (const name of keep) {
    const val = req.headers.get(name);
    if (val) out[name] = val;
  }
  return out;
}

/**
 * TODO: Implement CCBill signature verification when CCBill provides HMAC
 * or digest-based signing for your account.
 *
 * CCBill's current postback system does not universally provide request
 * signing. The recommended mitigations are:
 *   1. Restrict the webhook URL to CCBill IP ranges at the network/WAF level
 *   2. Use a secret path component (e.g. ?secret=<CCBILL_WEBHOOK_SECRET>)
 *      and validate it here
 *   3. When CCBill adds HMAC signing, implement it in this function
 *
 * Returns true if the request passes validation, false otherwise.
 */
function verifyRequest(req: NextRequest): boolean {
  const secret = process.env.CCBILL_WEBHOOK_SECRET;

  if (!secret) {
    // No secret configured — accept all requests.
    // WARNING: Set CCBILL_WEBHOOK_SECRET in production to enable path-based
    // validation, or restrict access at the network level.
    console.warn(
      "[ccbill/webhook] CCBILL_WEBHOOK_SECRET not set — skipping verification"
    );
    return true;
  }

  // Path-based secret: CCBill can append a custom query param.
  // Configure CCBill postback URL as:
  //   https://aura8.fun/api/ccbill/webhook?secret=<CCBILL_WEBHOOK_SECRET>
  const urlSecret = req.nextUrl.searchParams.get("secret");
  if (urlSecret === secret) return true;

  // TODO: Add HMAC verification here when CCBill supports it:
  // const signature = req.headers.get("x-ccbill-signature");
  // const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  // return crypto.timingSafeEqual(Buffer.from(signature ?? ""), Buffer.from(expected));

  console.warn("[ccbill/webhook] Request failed secret verification");
  return false;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // -- 1. Read raw body ----------------------------------------------------
    const rawBody = await req.text();

    if (!rawBody || rawBody.trim() === "") {
      console.warn("[ccbill/webhook] Empty body received");
      return NextResponse.json({ error: "Empty body" }, { status: 400 });
    }

    // -- 2. Verify request ---------------------------------------------------
    if (!verifyRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // -- 3. Parse form-encoded body ------------------------------------------
    let params: URLSearchParams;
    try {
      params = new URLSearchParams(rawBody);
    } catch {
      console.error("[ccbill/webhook] Failed to parse body as URLSearchParams");
      return NextResponse.json({ error: "Malformed body" }, { status: 400 });
    }

    // -- 4. Normalize payload ------------------------------------------------
    const headerMap: Record<string, string | null> = {
      "x-forwarded-for": req.headers.get("x-forwarded-for"),
      "x-real-ip": req.headers.get("x-real-ip"),
    };
    const event = normalizeCCBillPayload(params, headerMap);

    // Build a plain-object copy of all params for raw storage
    const rawPayload: Record<string, string> = {};
    params.forEach((value, key) => {
      rawPayload[key] = value;
    });

    const capturedHeaders = safeHeaders(req);

    console.log("[ccbill/webhook] Received event:", {
      eventType: event.eventType,
      email: event.email ? `${event.email.slice(0, 3)}***` : null,
      subscriptionId: event.subscriptionId,
      transactionId: event.transactionId,
      amount: event.amount,
    });

    // -- 5. Persist raw event ------------------------------------------------
    const supabase = getAdminClient();

    const { data: insertedEvent, error: insertError } = await supabase
      .from("ccbill_webhook_events")
      .insert({
        source: "ccbill",
        event_type: event.eventType,
        email: event.email,
        subscription_id: event.subscriptionId,
        transaction_id: event.transactionId,
        customer_id: event.customerId,
        status: event.status,
        amount: event.amount,
        currency: event.currency,
        affiliate: event.affiliate,
        subaccount: event.subAccount,
        campaign: event.campaign,
        tracking_id: event.trackingId,
        payload: rawPayload,
        headers: capturedHeaders,
        processed: false,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[ccbill/webhook] Failed to insert event:", insertError);
      // Still attempt subscriber upsert — don't block on logging failure
    }

    const webhookEventId = insertedEvent?.id ?? null;

    // -- 6. Upsert subscriber ------------------------------------------------
    const subscriberStatus = mapCCBillEventToStatus(event.eventType);
    const paymentSuccess = isPaymentSuccess(event.eventType);
    const now = new Date().toISOString();

    // Build metadata for analytics — include anything useful that doesn't
    // fit neatly into a dedicated column
    const metadata: Record<string, unknown> = {
      last_event_type: event.eventType,
      last_webhook_event_id: webhookEventId,
      form_name: event.formName,
      initial_price: event.initialPrice,
      recurring_price: event.recurringPrice,
      referrer: event.referrer,
      ip_address: event.ipAddress,
      country: event.country,
      reason: event.reason,
    };

    // Determine upsert key: prefer email, fall back to subscription_id
    const hasEmail = !!event.email;
    const hasSubscriptionId = !!event.subscriptionId;

    if (!hasEmail && !hasSubscriptionId) {
      console.warn(
        "[ccbill/webhook] No email or subscriptionId — cannot upsert subscriber"
      );
    } else {
      const subscriberRow: Record<string, unknown> = {
        updated_at: now,
        status: subscriberStatus,
        metadata,
      };

      // Only set fields that are present in this event
      if (event.email) subscriberRow.email = event.email;
      if (event.subscriptionId) subscriberRow.subscription_id = event.subscriptionId;
      if (event.customerId) subscriberRow.customer_id = event.customerId;
      if (event.affiliate) subscriberRow.affiliate = event.affiliate;
      if (event.subAccount) subscriberRow.subaccount = event.subAccount;
      if (event.campaign) subscriberRow.campaign = event.campaign;
      if (event.trackingId) subscriberRow.tracking_id = event.trackingId;

      if (paymentSuccess) {
        subscriberRow.last_payment_at = now;
        // CCBill rebill periods are typically 30 days; set a soft expiry
        // if we can infer it. Leave null if we cannot — do not guess.
        // TODO: Parse initialPeriod / recurringPeriod from payload when available
      }

      // Upsert on email if available, otherwise on subscription_id
      const conflictColumn = hasEmail ? "email" : "subscription_id";

      const { error: upsertError } = await supabase
        .from("aura8_subscribers")
        .upsert(subscriberRow, { onConflict: conflictColumn });

      if (upsertError) {
        console.error("[ccbill/webhook] Subscriber upsert error:", upsertError);

        // Mark the raw event as having a processing error
        if (webhookEventId) {
          await supabase
            .from("ccbill_webhook_events")
            .update({ processing_error: upsertError.message })
            .eq("id", webhookEventId);
        }
      } else {
        // Mark event as processed
        if (webhookEventId) {
          await supabase
            .from("ccbill_webhook_events")
            .update({ processed: true })
            .eq("id", webhookEventId);
        }
      }
    }

    // -- 7. Return 200 so CCBill does not retry ------------------------------
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[ccbill/webhook] Unexpected error:", err);
    // Return 500 — CCBill will retry, which is acceptable for unexpected failures
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * CCBill occasionally sends GET requests to verify the endpoint is reachable.
 * Return 200 so the endpoint passes their connectivity check.
 */
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
