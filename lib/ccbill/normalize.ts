/**
 * CCBill webhook payload normalizer.
 *
 * CCBill sends postbacks as application/x-www-form-urlencoded POST bodies.
 * Field names vary across CCBill products and versions, so we check multiple
 * known aliases for each logical field.
 */

export interface NormalizedCCBillEvent {
  eventType: string | null;
  email: string | null;
  subscriptionId: string | null;
  transactionId: string | null;
  customerId: string | null;
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
}

function pick(params: URLSearchParams, ...keys: string[]): string | null {
  for (const key of keys) {
    const val = params.get(key);
    if (val !== null && val.trim() !== "") return val.trim();
  }
  return null;
}

function toFloat(raw: string | null): number | null {
  if (raw === null) return null;
  const n = parseFloat(raw.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? null : n;
}

export function normalizeCCBillPayload(
  params: URLSearchParams,
  requestHeaders: Record<string, string | null>
): NormalizedCCBillEvent {
  const headerIp =
    requestHeaders["x-forwarded-for"]?.split(",")[0]?.trim() ??
    requestHeaders["x-real-ip"] ??
    null;

  const payloadIp = pick(params, "ipAddress", "ip_address", "clientIp", "client_ip");

  return {
    eventType: pick(
      params,
      "eventType",
      "event_type",
      "transactionType",
      "transaction_type",
      "type"
    ),
    email: pick(params, "email", "customerEmail", "customer_email"),
    subscriptionId: pick(
      params,
      "subscriptionId",
      "subscription_id",
      "subscriptionID",
      "subId",
      "sub_id"
    ),
    transactionId: pick(
      params,
      "transactionId",
      "transaction_id",
      "transactionID",
      "txnId",
      "txn_id"
    ),
    customerId: pick(
      params,
      "customerId",
      "customer_id",
      "customerID",
      "clientAccnum",
      "client_accnum"
    ),
    amount: toFloat(
      pick(params, "amount", "chargeAmount", "charge_amount", "price")
    ),
    currency: pick(params, "currency", "currencyCode", "currency_code"),
    initialPrice: toFloat(
      pick(params, "initialPrice", "initial_price", "initialAmount", "initial_amount")
    ),
    recurringPrice: toFloat(
      pick(params, "recurringPrice", "recurring_price", "recurringAmount", "recurring_amount")
    ),
    formName: pick(params, "formName", "form_name", "flexId", "flex_id"),
    status: pick(params, "status", "transactionStatus", "transaction_status"),
    reason: pick(
      params,
      "reason",
      "declineReason",
      "decline_reason",
      "failureReason",
      "failure_reason",
      "cancelReason",
      "cancel_reason"
    ),
    timestamp: pick(
      params,
      "timestamp",
      "transactionTime",
      "transaction_time",
      "eventTime",
      "event_time",
      "date"
    ),
    ipAddress: headerIp ?? payloadIp,
    country: pick(params, "country", "customerCountry", "customer_country"),
    referrer: pick(params, "referrer", "referral", "ref"),
    campaign: pick(params, "campaign", "campaignId", "campaign_id"),
    affiliate: pick(
      params,
      "affiliate",
      "affiliateId",
      "affiliate_id",
      "aff",
      "affId",
      "aff_id"
    ),
    subAccount: pick(
      params,
      "subAccount",
      "subaccount",
      "sub_account",
      "subAcc",
      "sub_acc",
      "clientSubacc",
      "client_subacc"
    ),
    trackingId: pick(
      params,
      "trackingId",
      "tracking_id",
      "trackId",
      "track_id",
      "tid",
      "utm_content"
    ),
  };
}
