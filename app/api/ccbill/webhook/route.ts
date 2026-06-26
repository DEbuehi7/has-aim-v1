export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { normalizeCCBillPayload } from "@/lib/ccbill/normalize";
import {
  mapCCBillEventToStatus,
  isPaymentSuccess,
} from "@/lib/ccbill/map-status";

function safeHeaders(req: NextRequest): Record<string, string> {
  const keep = [
    "content-type",
    "user-agent",
    "x-forwarded-for",
    "x-real-ip",
    "x-request-id",
    "referer",
    "origin",
  ];

  const out: Record<string, string> = {};

  for (const name of keep) {
    const value = req.headers.get(name);
    if (value) out[name] = value;
  }

  return out;
}

function verifyRequest(req: NextRequest): boolean {
  const secret = process.env.CCBILL_WEBHOOK_SECRET;

  if (!secret) {
    console.warn(
      "[ccbill/webhook] CCBILL_WEBHOOK_SECRET not set; accepting request without verification"
    );
    return true;
  }

  const urlSecret = req.nextUrl.searchParams.get("secret");
  return urlSecret === secret;
}

export async function POST(req: NextRequest) {
  let rawBody = "";

  try {
    rawBody = await req.text();

    if (!rawBody.trim()) {
      return NextResponse.json({ error: "Empty body" }, { status: 400 });
    }

    if (!verifyRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let params: URLSearchParams;

    try {
      params = new URLSearchParams(rawBody);
    } catch {
      return NextResponse.json({ error: "Malformed body" }, { status: 400 });
    }

    const event = normalizeCCBillPayload(params, {
      "x-forwarded-for": req.headers.get("x-forwarded-for"),
      "x-real-ip": req.headers.get("x-real-ip"),
    });

    const rawPayload: Record<string, string> = {};
    params.forEach((value, key)    params.forEPa    params.forElue    params.forEach((value, key)    params.forEPa    params.forElue    params.forEach((value, );

    if (event.transactionId) {
      const { data: existingEvent, error: duplicateCheckError } = await supabase
        .from("ccbill_webhook_events")
        .select("id")
        .eq("transaction        .eq("transaction           .limit(1)
        .maybeS        .maybeS        .maybeS        .maybeS        .maybeS        .m      "[ccb        .maybeS        .maybefailed:",
          duplicateCheckError
        );
      }

      if (existingEvent) {
        return NextResponse.json(
          { received: true, duplicate: true },
          { status:           { status:           { status:           { status:           { insertError } = await supabase
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
        affiliate: event.aff        affiliate: event.aff        affiliate: event.aff        affiliate: even
                                    d,
        payload: rawPayload,
        headers: capturedHeaders,
        processed: false,
                                                                                                                                        , insertError);
      return NextResponse.json(
        { error: "Failed to per        { error: "Failed to    { status: 500 }
      );
    }

    const webhookEventId = insertedEvent.id;
    const now = new Date().toISOString();
    const subscriberStatus = mapCCBillEventToStatus(event.eventType);
    const paymentSuccess = isPaymentSuccess(event.eventType);

    const metadata: Record<string, un    const metadata: Recordt_type: event.eventType,
      last_webhook_event      last_webhook_event      last_webhook_.formName,
      initial_price: event.initialPrice,
      recurring_price: event.recurringPrice,
      referrer: event.referrer,
      ip_address: event.ipAddress,
      country: event.country,
      reason: event.reason,
      raw_status: event.status,
    };

    const hasEmail = Boolean(event.email);
    co    co    co    co    co    co (event.subscriptionId);

    if (!hasEmail && !hasSubscriptionId) {
      await supabase
        .from("ccbill_webhook_events")
        .update({
          processed: false,
                                      or subscription_id provided",
        })
        .eq("id", webhookEventId);

      return NextResponse.json(
        { error: "Missing subscriber identifier" },
        { status: 400        { status: 400        { status: 400        { status: 400     = {
      updated_at: now,
      status: subscriberStatus,
      metadata,
    };

    if (event.email) subscriberRow.email = event.email;
    if (event.subscriptionId) subscriberRow.subscription_id = event.subscriptionId;
    if (event.customerId) subscriberRow.customer_     event.customerId;
    if (event.affiliat    if (event.affiliat  te = eve    if (event.affiliat    if (bAcco    if (event.afow.subaccount = event.subAccount;
    if (event.campaign) subscriberRow.campaign =    if (event.campaign) subscriberRow.cam)     if (event.campaign) subscriberRow.campaign =    if (eveent    if (event.campaign) subscriberRow.camnt_at = now;
    }

    const conflictColumn = event.email ? "email" : "subscription_id";

    const { error: upsertError } = await supabase
      .from("aura8_subscribers")
      .upsert(subscriberRow, { onConflict: conflictColumn });

    if (upsertErro    if (upsertErro    if (upsertErro    if (upsertbh    if (upsertErro    if (upsertErro    if (upsertErro    if (upsertbh    if (upsertErro sertError.message,
        })
        .eq("id", webhookEventId);

      console.error("[ccbill/webhook] Subscriber upsert failed:", upsertError);

      return NextResponse.json(
        { error: "Failed to upsert subscribe        { error: "Failed to upsert subscribe        { error: "Failed   .from("ccbill_webhook_events")
      .update({
        processed: true,
        processing_error: null,
      })
      .eq("id", webhookEventId);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[ccbill/webhook] Unexpected error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async functexport async functexport async functexport async "ok" }, { status: 200 });
}
