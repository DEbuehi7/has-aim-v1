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
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeEventType(value: string | null): string {
  return (value ?? "unknown").trim().toLowerCase();
}

export function normalizeCCBillPayload(
  params: URLSearchParams,
  headers?: Record<string, string | null>
): NormalizedCCBillEvent {
  const forwardedFor = headers?.["x-forwarded-for"] ?? null;
  const realIp = headers?.["x-real-ip"] ?? null;

  return {
    email: firstNonEmpty(params, ["email", "customer_email"]),
    subscriptionId: firstNonEmpty(params, [
      "subscriptionId",
      "subscription_id",
      "subscription_id_1",
    ]),
    transactionId: firstNonEmpty(params, [
      "transactionId",
      "transaction_id",
      "transid",
    ]),
    customerId: firstNonEmpty(params, ["customerId", "customer_id", "clientAccnum"]),
    eventType: normalizeEventType(
      firstNonEmpty(params, ["eventType", "event_type", "transactionType", "type"])
    ),
    amount: parseNumber(firstNonEmpty(params, ["amount"])),
    currency: firstNonEmpty(params, ["currency"]),
    initialPrice: parseNumber(firstNonEmpty(params, ["initialPrice", "initial_price"])),
    recurringPrice: parseNumber(
      firstNonEmpty(params, ["recurringPrice", "recurring_price"])
    ),
    formName: firstNonEmpty(params, ["formName", "form_name"]),
    status: firstNonEmpty(params, ["status"]),
    reason: firstNonEmpty(params, ["reason", "reason_text"]),
    timestamp: firstNonEmpty(params, ["timestamp", "event_time"]),
    ipAddress: firstNonEmpty(params, ["ipAddress", "ip_address"]) ?? forwardedFor ?? realIp,
    country: firstNonEmpty(params, ["country"]),
    referrer: firstNonEmpty(params, ["referrer", "referer"]),
    campaign: firstNonEmpty(params, ["campaign", "utm_campaign"]),
    affiliate: firstNonEmpty(params, ["affiliate", "affiliate_id"]),
    subAccount: firstNonEmpty(params, ["subAccount", "subaccount", "sub_account"]),
    trackingId: firstNonEmpty(params, ["trackingId", "tracking_id", "utm_id"]),
  };
}
