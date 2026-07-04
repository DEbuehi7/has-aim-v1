/**
 * lib/aura8/get-subscriber.ts
 *
 * Server-only convenience facade over lib/aura8/subscriber-status.ts.
 *
 * Three named helpers for pages and API routes:
 *
 *   isSubscribed(email)            → boolean (true only when status === "active")
 *   hasActiveOrExpiredSoon(email)  → { isActive, expiringWithinDays, subscriber }
 *   getSubscriberDetails(email)    → full SubscriberStatusResult
 *
 * All three handle errors gracefully — DB failures return safe defaults
 * rather than throwing, so protected pages never hard-crash on a DB hiccup.
 *
 * ─── COMBINING WITH THE EMAIL GATE ───────────────────────────────────────────
 *
 *   import { requireEmailVerified } from "@/lib/aura8/access";
 *   import { isSubscribed } from "@/lib/aura8/get-subscriber";
 *   import { redirect } from "next/navigation";
 *
 *   export default async function MembersPage() {
 *     // Gate 1: email verification (always enforced — do not remove)
 *     const access = await requireEmailVerified();
 *     // Gate 2: paid subscription check
 *     const subscribed = await isSubscribed(access.email ?? "");
 *     if (!subscribed) redirect("/aura8/subscribe");
 *     return <PaidContent />;
 *   }
 *
 * ─── RECOMMENDED ONE-LINER ────────────────────────────────────────────────────
 *
 *   Both gates combined — flip AURA8_PAID_GATE_ENABLED=true to enforce:
 *
 *   import { requirePaidAccess } from "@/lib/aura8/access";
 *   export default async function MembersPage() {
 *     await requirePaidAccess(); // redirects non-verified + non-subscribers
 *     return <PaidContent />;
 *   }
 *
 * ─── FUTURE ENFORCEMENT POINTS ───────────────────────────────────────────────
 *
 *   app/aura8/members/page.tsx       → requirePaidAccess()
 *   app/aura8/content/page.tsx       → requirePaidAccess()
 *   app/aura8/downloads/page.tsx     → requirePaidAccess()
 *   app/dashboard/page.tsx           → requirePaidAccess() (when dashboard is paid)
 *   app/api/aura8/companion/route.ts → checkAccess() → 403 if !hasActiveSub
 *
 * Never import this in client components — it calls Supabase server-side.
 */

import {
  getSubscriberStatus,
  SubscriberStatusResult,
  SubscriberRecord,
} from "@/lib/aura8/subscriber-status";

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

/** Days before expiry at which renewal warnings fire. Default: 5. */
function renewalWarningDays(): number {
  const raw = process.env.AURA8_RENEWAL_WARNING_DAYS;
  const parsed = parseInt(raw ?? "", 10);
  return isNaN(parsed) || parsed < 1 ? 5 : parsed;
}

// ---------------------------------------------------------------------------
// isSubscribed
// ---------------------------------------------------------------------------

/**
 * Returns true only if the subscriber's status is "active".
 *
 * Returns false for all other statuses (cancelled, expired, declined,
 * refunded, chargeback, pending, unknown, not_found) and on DB errors.
 *
 * @param email - Subscriber email. Empty / null → false immediately.
 *
 * @example
 * const subscribed = await isSubscribed("user@example.com");
 * if (!subscribed) redirect("/aura8/subscribe");
 */
export async function isSubscribed(email: string | null | undefined): Promise<boolean> {
  if (!email || email.trim() === "") return false;
  try {
    const result = await getSubscriberStatus(email);
    return result.hasAccess;
  } catch (err) {
    console.error("[get-subscriber] isSubscribed error:", err);
    return false; // fail open — do not block on unexpected DB errors
  }
}

// ---------------------------------------------------------------------------
// hasActiveOrExpiredSoon
// ---------------------------------------------------------------------------

/**
 * Returns whether the subscriber is active and whether their subscription
 * is approaching expiry within the renewal warning window.
 *
 * Use to render renewal-warning banners without blocking access.
 *
 * Behaviour:
 *   active + expires_at within N days  → isActive: true, expiringWithinDays: N
 *   active + expires_at far / null     → isActive: true, expiringWithinDays: null
 *   any non-active status              → isActive: false, expiringWithinDays: null
 *
 * @example
 * const { isActive, expiringWithinDays } = await hasActiveOrExpiredSoon(email);
 * if (isActive && expiringWithinDays !== null && expiringWithinDays <= 3) {
 *   // show renewal warning banner
 * }
 */
export async function hasActiveOrExpiredSoon(
  email: string | null | undefined
): Promise<{
  /** True when accessStatus === "active" */
  isActive: boolean;
  /**
   * Days until expiry if within the warning window, otherwise null.
   * Also null when expires_at is not stored (CCBill manages rebills).
   */
  expiringWithinDays: number | null;
  /** Full subscriber row for additional rendering logic */
  subscriber: SubscriberRecord | null;
}> {
  if (!email || email.trim() === "") {
    return { isActive: false, expiringWithinDays: null, subscriber: null };
  }

  try {
    const result = await getSubscriberStatus(email);

    if (!result.hasAccess) {
      return { isActive: false, expiringWithinDays: null, subscriber: result.subscriber };
    }

    let expiringWithinDays: number | null = null;

    if (result.subscriber?.expires_at) {
      const expiresAt = new Date(result.subscriber.expires_at);
      const now = new Date();
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysLeft = Math.floor((expiresAt.getTime() - now.getTime()) / msPerDay);
      if (daysLeft <= renewalWarningDays()) {
        expiringWithinDays = daysLeft;
      }
    }

    return { isActive: true, expiringWithinDays, subscriber: result.subscriber };
  } catch (err) {
    console.error("[get-subscriber] hasActiveOrExpiredSoon error:", err);
    return { isActive: false, expiringWithinDays: null, subscriber: null };
  }
}

// ---------------------------------------------------------------------------
// getSubscriberDetails
// ---------------------------------------------------------------------------

/**
 * Returns the full SubscriberStatusResult for a given email address.
 *
 * Use this when you need more than a boolean — e.g. to render plan name,
 * last payment date, subscription ID, or affiliate data on an account page.
 *
 * On error or missing email returns:
 *   { accessStatus: "not_found" | "unknown", subscriber: null, hasAccess: false }
 *
 * @example
 * const { accessStatus, subscriber, hasAccess } = await getSubscriberDetails(email);
 * if (subscriber) {
 *   // render subscriber.plan, subscriber.last_payment_at, subscriber.expires_at
 * }
 */
export async function getSubscriberDetails(
  email: string | null | undefined
): Promise<SubscriberStatusResult> {
  if (!email || email.trim() === "") {
    return { accessStatus: "not_found", subscriber: null, hasAccess: false };
  }

  try {
    return await getSubscriberStatus(email);
  } catch (err) {
    console.error("[get-subscriber] getSubscriberDetails error:", err);
    // "unknown" signals: row may exist, but we couldn't confirm — show a
    // neutral "something went wrong" state rather than crashing the page.
    return { accessStatus: "unknown", subscriber: null, hasAccess: false };
  }
}
