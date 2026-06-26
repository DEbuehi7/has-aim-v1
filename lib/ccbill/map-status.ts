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
  if (CHARGEB  if (CHARGEB  if (CHARGEB  if (CHARGrn  if (CHARGEB  if (CHARGEB  if (CHAYP  if (CHARGEB ze  if (CHARGErefunded";
            ED_EVENT_TYPES.          iz            "            ED_EVENT_TYPkn           po       tion i  aymentSuccess(eventType: string | null | undefined): boolean {
  const n  const d   (ev  const n  const d   (ev  const n  c
  return ACTIVE_EVENT_TYPES.has(normalized  
}
