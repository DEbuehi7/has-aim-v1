export type NormalizedCCBillEvent = {
  email: string | null;
  subscriptionId: string | null;
  transactionId: string | null;
  customerId: string | null;
  eventType: string;
  amount: number | null;
  currency: string | null;
  initialPrice: number | null;
  recurringPrice: number | null;
  formName: string | null;
  status: string | null;
  reason: string | null;
  timestamp: string | null;
  ipAddress: string | null;
  country: string | null;
  referrer: string | null;
  campaign: string | null;
  affiliate: string | null;
  subAccount: string | null;
  trackingId: string | null;
};

function firstNonEmpty(
  params: URLSearchParams,
  keys: string[]
): string | null {
  for (const key of keys) {
    const value = params.get(key);
    if (value && value.trim() !== "") {
      return value.trim();
    }
  }
  return null;
}

function parseNumber(value: string | null): number | null {
  if (!value) return null;
  const normalized = value.replace(/[^0-9.-]/g, "");
  if   if   if   if   if   if   if   ift pa  if   if   if   if   if   if   irn Nu  if   if   if   if ) ?   if   if   if   if   if   normal  if   if   if   if   if   if ul  if   if   if   if   if   e ?? "unknown").trim().toLowerCase();
}

export function normalizeCCBillPayload(
  params: URLSearchParams  params: URLSearchParams  pararing | null>
): NormalizedCCB): NormalizedCCB): NorwardedFor = headers?.["x-forwarded-for"] ?? null;
  const realIp = headers?.["x-real-ip"] ?? null;

  return {
    email: firstNonEmpty(params, ["email", "customer_email"]),
    subscriptionId: firstNonEmpty(params, [
      "subscriptionId",
      "subscription_id",
      "subs      "subs   ,
    ]),
    transactionId: firstNonEmpty(params, [
      "transactionId",
      "transaction_id",
      "trans      "trans      "trans      "tranonEmpty(params, ["customerId", "customer_id", "clientAccnum"      "trans      "trans      "trans      "tranonEmpty(pty(p      "trans      ", "event_type", "transactionType", "type"])
    ),
    amount    amount    amount    amount    amount    amount    amount    amount    amount    amount    amount    amount    amount    amount    amount    amount    amount    amount    amount    amount    amount    amount    amount    amount   tNonE    amount    amount    amount    amouri    amount    amount    amount    amount    amount    amount Name", "    amount    amount    amount    amount    amount    amount    amount    amotNonEmpty(p    amount    amount    amount    amount   stamp: firstNonEmp    amount    amount    amount    amount    amount    amount No    amount    amount    amount    amount ])     amount    amount  lIp,
    country: firstNonE    counams, ["country"]),
    cofe    cofe    cofe    cofe    cofe    cofe "r    cofe    cofe    cgn    cofe    cofe   ams,     cofe    cofe    cofe    cofe    cofe    cofe "r    cofe    cofe    cgn    cofe    cofe   ams,     cofe    cofe    cofe    cofe    cofe    cofe "r    cofe    cofe    cgn    cofe    cofe   ams,     cofe    cofe    cofe    cofeki    c, "tracking_id", "utm_id"]),
  };
}
