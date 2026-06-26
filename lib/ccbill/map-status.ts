const ACTIVE_EVENT_TYPES = new Set([
  "activation",
  "activate",
  "sale",
  "initial",
  "newsale",
  "rebill",
  "renewal",
  "subscription_payment",
  "payment",
  "success",
]);

const CANCELED_EVENT_TYPES = new Set([
  "cancel",
  "cancellation",
  "void",
]);

const EXPIRED_EVENT_TYPES = new Set([
  "expire",
  "expired",
  "expiration",
]);

const CHARGEBACK_EVENT_TYPES = new Set([
  "chargeback",
  "charge_back",
  "retrieval",
]);

const REFUND_EVENT_TYPES = new Set([
  "refund",
  "refunded",
]);

const DECLINED_EVENT_TYPES = new Set([
  "decline",
  "declined",
  "deny",
  "denied",
  "failure",
  "failed",
]);

export function mapCCBillEventToStatus(eventType: string | null | undefined): string {
  const normalized = (eventType ?? "unknown").trim().toLowerCase();

  if (ACTIVE_EVENT_TYPES.has(normalized)) return "active";
  if (CANCELED_EVENT_TYPES.has(normalized)) return "canceled";
  if (EXPIRED_EVENT_TYPES.has(normalized)) return "expired";
  if (CHARGEBACK_EVENT_TYPES.has(normalized)) return "chargeback";
  if (REFUND_EVENT_TYPES.has(normalized)) return "refunded";
  if (DECLINED_EVENT_TYPES.has(normalized)) return "declined";

  return "unknown";
}

export function isPaymentSuccess(eventType: string | null | undefined): boolean {
  const normalized = (eventType ?? "").trim().toLowerCase();
  return ACTIVE_EVENT_TYPES.has(normalized);
}
