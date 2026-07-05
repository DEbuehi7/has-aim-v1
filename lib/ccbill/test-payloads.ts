/**
 * lib/ccbill/test-payloads.ts
 *
 * Ready-made CCBill postback payload templates for all seven event types.
 * Field names match what normalizeCCBillPayload() expects.
 *
 * Usage:
 *   import { TEST_PAYLOADS, buildTestBody } from "@/lib/ccbill/test-payloads";
 *   const body = buildTestBody("sale", { email: "you@example.com" });
 */

export type TestEventKey =
  | "sale"        // NewSaleSuccess  → active
  | "rebill"      // RebillSuccess   → active
  | "cancel"      // Cancellation    → cancelled
  | "expire"      // Expiration      → expired
  | "decline"     // NewSaleFailure  → declined
  | "chargeback"  // Chargeback      → chargeback
  | "refund";     // Refund          → refunded

export interface TestPayloadTemplate {
  label: string;
  expectedStatus: string;
  description: string;
  fields: Record<string, string>;
}

const now = () => new Date().toISOString();
const txn = (p: string) => `${p}-${Date.now()}`;

export const TEST_PAYLOADS: Record<TestEventKey, TestPayloadTemplate> = {
  sale: {
    label: "New Sale Success",
    expectedStatus: "active",
    description: "Successful first-time subscription. Sets subscriber status to active, updates last_payment_at.",
    fields: {
      eventType: "NewSaleSuccess", email: "test-sale@example.com",
      subscriptionId: "SUB-TEST-001", transactionId: txn("TXN-SALE"),
      customerId: "CUST-TEST-001", amount: "9.99", currency: "USD",
      initialPrice: "9.99", recurringPrice: "9.99", formName: "cc-form-test",
      affiliate: "AFF-TEST", subAccount: "0000", campaign: "test-campaign",
      trackingId: "TID-TEST-001", country: "US", timestamp: now(),
    },
  },
  rebill: {
    label: "Rebill Success",
    expectedStatus: "active",
    description: "Successful recurring payment. Keeps subscriber status active, updates last_payment_at.",
    fields: {
      eventType: "RebillSuccess", email: "test-rebill@example.com",
      subscriptionId: "SUB-TEST-002", transactionId: txn("TXN-REBILL"),
      customerId: "CUST-TEST-002", amount: "9.99", currency: "USD",
      recurringPrice: "9.99", formName: "cc-form-test",
      affiliate: "AFF-TEST", subAccount: "0000", timestamp: now(),
    },
  },
  cancel: {
    label: "Cancellation",
    expectedStatus: "cancelled",
    description: "Subscriber cancelled. Sets status to cancelled.",
    fields: {
      eventType: "Cancellation", email: "test-cancel@example.com",
      subscriptionId: "SUB-TEST-003", transactionId: txn("TXN-CANCEL"),
      customerId: "CUST-TEST-003", reason: "Customer Request",
      formName: "cc-form-test", timestamp: now(),
    },
  },
  expire: {
    label: "Expiration",
    expectedStatus: "expired",
    description: "Subscription expired without renewal. Sets status to expired.",
    fields: {
      eventType: "Expiration", email: "test-expire@example.com",
      subscriptionId: "SUB-TEST-004", transactionId: txn("TXN-EXPIRE"),
      customerId: "CUST-TEST-004", reason: "Subscription Expired",
      formName: "cc-form-test", timestamp: now(),
    },
  },
  decline: {
    label: "New Sale Failure (Decline)",
    expectedStatus: "declined",
    description: "Failed payment attempt. Sets status to declined.",
    fields: {
      eventType: "NewSaleFailure", email: "test-decline@example.com",
      subscriptionId: "SUB-TEST-005", transactionId: txn("TXN-DECLINE"),
      customerId: "CUST-TEST-005", amount: "9.99", currency: "USD",
      reason: "Insufficient Funds", formName: "cc-form-test", timestamp: now(),
    },
  },
  chargeback: {
    label: "Chargeback",
    expectedStatus: "chargeback",
    description: "Chargeback filed. Sets status to chargeback.",
    fields: {
      eventType: "Chargeback", email: "test-chargeback@example.com",
      subscriptionId: "SUB-TEST-006", transactionId: txn("TXN-CHARGEBACK"),
      customerId: "CUST-TEST-006", amount: "9.99", currency: "USD",
      reason: "Customer Dispute", formName: "cc-form-test", timestamp: now(),
    },
  },
  refund: {
    label: "Refund",
    expectedStatus: "refunded",
    description: "Full refund issued. Sets status to refunded.",
    fields: {
      eventType: "Refund", email: "test-refund@example.com",
      subscriptionId: "SUB-TEST-007", transactionId: txn("TXN-REFUND"),
      customerId: "CUST-TEST-007", amount: "9.99", currency: "USD",
      reason: "Customer Request", formName: "cc-form-test", timestamp: now(),
    },
  },
};

/**
 * Build a URL-encoded body string from a template + optional field overrides.
 * The resulting string can be POSTed as application/x-www-form-urlencoded.
 */
export function buildTestBody(
  key: TestEventKey,
  overrides: Record<string, string> = {}
): string {
  const merged = { ...TEST_PAYLOADS[key].fields, ...overrides };
  return new URLSearchParams(merged).toString();
}

/** Dropdown options for the admin UI. */
export function getTestEventOptions(): Array<{
  key: TestEventKey;
  label: string;
  expectedStatus: string;
  description: string;
}> {
  return (Object.keys(TEST_PAYLOADS) as TestEventKey[]).map((key) => ({
    key,
    label: TEST_PAYLOADS[key].label,
    expectedStatus: TEST_PAYLOADS[key].expectedStatus,
    description: TEST_PAYLOADS[key].description,
  }));
}
