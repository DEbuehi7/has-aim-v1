/**
 * lib/aura8/subscriber-status.ts
 *
 * Server-only helper — looks up a subscriber in aura8_subscribers by email
 * and returns a normalized access status.
 *
 * Never import this in client components.
 */

import { getAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Every possible value that can be stored in aura8_subscribers.status,
 * plus two synthetic values produced by this helper:
 *   - "not_found"  → no row exists for this email
 *   - "unknown"    → row exists but status is null / unrecognized
 */
export type SubscriberAccessStatus =
  | "active"
  | "cancelled"
  | "expired"
  | "declined"
  | "refunded"
  | "chargeback"
  | "pending"
  | "unknown"
  | "not_found";

export interface SubscriberRecord {
  id: string;
  email: string | null;
  subscription_id: string | null;
  customer_id: string | null;
  status: string | null;
  plan: string | null;
  affiliate: string | null;
  subaccount: string | null;
  campaign: string | null;
  tracking_id: string | null;
  last_payment_at: string | null;
  expires_at: string | null;
  age_verified: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SubscriberStatusResult {
  /** Normalized access status */
  accessStatus: SubscriberAccessStatus;
  /** Full subscriber row, or null if not found */
  subscriber: SubscriberRecord | null;
  /** True only when accessStatus === "active" */
  hasAccess: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_STATUSES = new Set<SubscriberAccessStatus>([
  "active",
  "cancelled",
  "expired",
  "declined",
  "refunded",
  "chargeback",
  "pending",
  "unknown",
]);

function normalizeStatus(raw: string | null): SubscriberAccessStatus {
  if (!raw) return "unknown";
  const lower = raw.toLowerCase() as SubscriberAccessStatus;
  return VALID_STATUSES.has(lower) ? lower : "unknown";
}

// ---------------------------------------------------------------------------
// Main lookup
// ---------------------------------------------------------------------------

/**
 * Look up a subscriber by email address.
 *
 * @param email - The subscriber's email (case-insensitive)
 * @returns SubscriberStatusResult
 *
 * @example
 * const { hasAccess, accessStatus } = await getSubscriberStatus("user@example.com");
 * if (!hasAccess) redirect("/aura8/subscribe");
 */
export async function getSubscriberStatus(
  email: string
): Promise<SubscriberStatusResult> {
  const normalizedEmail = email.toLowerCase().trim();

  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("aura8_subscribers")
    .select(
      "id, email, subscription_id, customer_id, status, plan, affiliate, subaccount, campaign, tracking_id, last_payment_at, expires_at, age_verified, metadata, created_at, updated_at"
    )
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error("[subscriber-status] Supabase error:", error.message);
    // Fail open — return unknown rather than blocking the user on a DB error.
    // Change this to "not_found" if you prefer fail-closed behavior.
    return { accessStatus: "unknown", subscriber: null, hasAccess: false };
  }

  if (!data) {
    return { accessStatus: "not_found", subscriber: null, hasAccess: false };
  }

  const accessStatus = normalizeStatus(data.status);

  return {
    accessStatus,
    subscriber: data as SubscriberRecord,
    hasAccess: accessStatus === "active",
  };
}

/**
 * Look up a subscriber by CCBill subscription_id.
 * Useful when email is not available (e.g. some CCBill event types).
 */
export async function getSubscriberStatusById(
  subscriptionId: string
): Promise<SubscriberStatusResult> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("aura8_subscribers")
    .select(
      "id, email, subscription_id, customer_id, status, plan, affiliate, subaccount, campaign, tracking_id, last_payment_at, expires_at, age_verified, metadata, created_at, updated_at"
    )
    .eq("subscription_id", subscriptionId)
    .maybeSingle();

  if (error) {
    console.error("[subscriber-status] Supabase error:", error.message);
    return { accessStatus: "unknown", subscriber: null, hasAccess: false };
  }

  if (!data) {
    return { accessStatus: "not_found", subscriber: null, hasAccess: false };
  }

  const accessStatus = normalizeStatus(data.status);

  return {
    accessStatus,
    subscriber: data as SubscriberRecord,
    hasAccess: accessStatus === "active",
  };
}
