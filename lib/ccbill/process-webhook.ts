/**
 * lib/ccbill/process-webhook.ts
 *
 * Shared CCBill webhook processing used by both:
 *   - /api/ccbill/webhook       (real CCBill postbacks)
 *   - /api/ccbill/webhook/test  (admin test injection)
 *
 * Never import this in client components.
 */

import { getAdminClient } from "@/lib/supabase/admin";
import { normalizeCCBillPayload } from "@/lib/ccbill/normalize";
import { mapCCBillEventToStatus, isPaymentSuccess } from "@/lib/ccbill/map-status";

export interface ProcessWebhookInput {
  /** Raw URL-encoded body string — exactly what CCBill sends. */
  rawBody: string;
  /** Safe headers to store alongside the raw event row. */
  capturedHeaders: Record<string, string>;
  /**
   * Written to ccbill_webhook_events.source.
   * "ccbill" for real events, "test" for injected test events.
   */
  source?: string;
}

export interface ProcessWebhookResult {
  success: boolean;
  eventType: string | null;
  subscriberStatus: string;
  webhookEventId: string | null;
  email: string | null;
  summary: string;
  warnings: string[];
  error: string | null;
}

/**
 * Parse, normalize, persist, and upsert a CCBill postback payload.
 * Never throws — errors are captured in the returned result.
 */
export async function processWebhook(
  input: ProcessWebhookInput
): Promise<ProcessWebhookResult> {
  const warnings: string[] = [];
  const source = input.source ?? "ccbill";

  // Parse
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(input.rawBody);
  } catch (err) {
    return {
      success: false, eventType: null, subscriberStatus: "unknown",
      webhookEventId: null, email: null,
      summary: "Failed to parse body",
      warnings, error: String(err),
    };
  }

  // Normalize
  const event = normalizeCCBillPayload(params, input.capturedHeaders);
  const rawPayload: Record<string, string> = {};
  params.forEach((v, k) => { rawPayload[k] = v; });

  console.log(`[ccbill/${source}] Processing:`, {
    eventType: event.eventType,
    email: event.email ? `${event.email.slice(0, 3)}***` : null,
    subscriptionId: event.subscriptionId,
  });

  // Persist raw event
  const supabase = getAdminClient();
  const now = new Date().toISOString();

  const { data: insertedEvent, error: insertError } = await supabase
    .from("ccbill_webhook_events")
    .insert({
      source,
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
      headers: input.capturedHeaders,
      processed: false,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error(`[ccbill/${source}] Insert error:`, insertError);
    warnings.push(`Event insert failed: ${insertError.message}`);
  }

  const webhookEventId = insertedEvent?.id ?? null;

  // Determine subscriber status
  const subscriberStatus = mapCCBillEventToStatus(event.eventType);
  const paymentSuccess = isPaymentSuccess(event.eventType);
  const hasEmail = !!event.email;
  const hasSubId = !!event.subscriptionId;

  // Upsert subscriber
  if (!hasEmail && !hasSubId) {
    warnings.push("No email or subscriptionId — subscriber upsert skipped");
  } else {
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

    const row: Record<string, unknown> = { updated_at: now, status: subscriberStatus, metadata };
    if (event.email)          row.email           = event.email;
    if (event.subscriptionId) row.subscription_id = event.subscriptionId;
    if (event.customerId)     row.customer_id     = event.customerId;
    if (event.affiliate)      row.affiliate       = event.affiliate;
    if (event.subAccount)     row.subaccount      = event.subAccount;
    if (event.campaign)       row.campaign        = event.campaign;
    if (event.trackingId)     row.tracking_id     = event.trackingId;
    if (paymentSuccess)       row.last_payment_at = now;

    const { error: upsertError } = await supabase
      .from("aura8_subscribers")
      .upsert(row, { onConflict: hasEmail ? "email" : "subscription_id" });

    if (upsertError) {
      console.error(`[ccbill/${source}] Subscriber upsert error:`, upsertError);
      warnings.push(`Subscriber upsert failed: ${upsertError.message}`);
      if (webhookEventId) {
        await supabase.from("ccbill_webhook_events")
          .update({ processing_error: upsertError.message }).eq("id", webhookEventId);
      }
    } else if (webhookEventId) {
      await supabase.from("ccbill_webhook_events")
        .update({ processed: true }).eq("id", webhookEventId);
    }
  }

  const success = warnings.length === 0;
  return {
    success,
    eventType: event.eventType,
    subscriberStatus,
    webhookEventId,
    email: event.email,
    summary: success
      ? `${event.eventType ?? "unknown"} → status "${subscriberStatus}"`
      : `${event.eventType ?? "unknown"} → ${warnings.length} warning(s)`,
    warnings,
    error: null,
  };
}
