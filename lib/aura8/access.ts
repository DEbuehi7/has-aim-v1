/**
 * lib/aura8/access.ts
 *
 * Server-only access guard helpers for Aura8 protected routes and pages.
 *
 * Current gate layers (in order):
 *   1. Email verification gate  — checks aura8_verified cookie (already live)
 *   2. Paid subscription gate   — checks aura8_subscribers.status (wired here,
 *                                  NOT yet enforced — see PAID_GATE_ENABLED flag)
 *
 * To enable paid enforcement, set AURA8_PAID_GATE_ENABLED=true in env vars
 * and call requirePaidAccess() from any Server Component or Route Handler
 * that should be subscriber-only.
 *
 * Never import this in client components.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getSubscriberStatus,
  SubscriberAccessStatus,
  SubscriberStatusResult,
} from "@/lib/aura8/subscriber-status";

// ---------------------------------------------------------------------------
// Feature flag
// ---------------------------------------------------------------------------

/**
 * Set AURA8_PAID_GATE_ENABLED=true in your environment to start enforcing
 * paid subscription checks. While false, requirePaidAccess() is a no-op
 * so existing free/email-gated users are not blocked.
 */
function isPaidGateEnabled(): boolean {
  return process.env.AURA8_PAID_GATE_ENABLED === "true";
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AccessCheckResult {
  /** Whether the user passed the email verification gate */
  emailVerified: boolean;
  /** Email from cookie, or null if not present */
  email: string | null;
  /** Subscriber status from aura8_subscribers, or null if gate not checked */
  subscriberResult: SubscriberStatusResult | null;
  /** True if the user has an active paid subscription */
  hasActiveSub: boolean;
  /** True if the user passes all currently-enforced gates */
  allowed: boolean;
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

/**
 * Read the aura8_verified cookie (set by the email verification flow).
 * Returns { verified, email }.
 */
async function readVerificationCookie(): Promise<{
  verified: boolean;
  email: string | null;
}> {
  try {
    const cookieStore = await cookies();
    const verified = cookieStore.get("aura8_verified")?.value === "true";
    // The email cookie is set alongside aura8_verified by the verify route.
    // If it is not present we cannot do a subscriber lookup.
    const email = cookieStore.get("aura8_email")?.value ?? null;
    return { verified, email };
  } catch {
    return { verified: false, email: null };
  }
}

// ---------------------------------------------------------------------------
// Core access check
// ---------------------------------------------------------------------------

/**
 * Check all access gates for the current request.
 *
 * Does NOT redirect — returns a result object so the caller can decide
 * what to do (redirect, show a paywall, log, etc.).
 *
 * @example
 * // In a Server Component:
 * const access = await checkAccess();
 * if (!access.emailVerified) redirect("/aura8");
 * if (!access.hasActiveSub) redirect("/aura8/subscribe");
 */
export async function checkAccess(): Promise<AccessCheckResult> {
  const { verified, email } = await readVerificationCookie();

  // ── Gate 1: Email verification (always enforced) ─────────────────────────
  if (!verified) {
    return {
      emailVerified: false,
      email: null,
      subscriberResult: null,
      hasActiveSub: false,
      allowed: false,
    };
  }

  // ── Gate 2: Paid subscription (only when feature flag is on) ─────────────
  // TODO: When you are ready to enforce paid access, set
  //       AURA8_PAID_GATE_ENABLED=true in your Vercel environment variables.
  //       No code changes needed — the gate is already wired.

  let subscriberResult: SubscriberStatusResult | null = null;
  let hasActiveSub = false;

  if (email) {
    subscriberResult = await getSubscriberStatus(email);
    hasActiveSub = subscriberResult.hasAccess;
  }

  const paidGateEnabled = isPaidGateEnabled();

  // If paid gate is disabled, allow all email-verified users through.
  // If paid gate is enabled, only active subscribers pass.
  const allowed = paidGateEnabled ? hasActiveSub : true;

  return {
    emailVerified: true,
    email,
    subscriberResult,
    hasActiveSub,
    allowed,
  };
}

// ---------------------------------------------------------------------------
// Guard helpers (redirect-based, for Server Components / Route Handlers)
// ---------------------------------------------------------------------------

/**
 * Require email verification. Redirects to /aura8 if not verified.
 * This mirrors the existing client-side gate but runs server-side.
 *
 * @example
 * // At the top of a Server Component page:
 * await requireEmailVerified();
 */
export async function requireEmailVerified(): Promise<AccessCheckResult> {
  const result = await checkAccess();
  if (!result.emailVerified) {
    redirect("/aura8");
  }
  return result;
}

/**
 * Require an active paid subscription.
 *
 * Behavior depends on AURA8_PAID_GATE_ENABLED:
 *   - false (default): no-op, returns access result without redirecting
 *   - true: redirects to /aura8/subscribe if subscription is not active
 *
 * Always also enforces email verification first.
 *
 * @param subscribeRedirect - Where to send non-subscribers (default: /aura8/subscribe)
 *
 * @example
 * // In a paid-only Server Component page:
 * await requirePaidAccess();
 * // ... render paid content
 */
export async function requirePaidAccess(
  subscribeRedirect = "/aura8/subscribe"
): Promise<AccessCheckResult> {
  const result = await checkAccess();

  // Always enforce email gate first
  if (!result.emailVerified) {
    redirect("/aura8");
  }

  // TODO: Paid gate enforcement point.
  // When AURA8_PAID_GATE_ENABLED=true, non-subscribers are redirected here.
  // Until then, this is a no-op and all email-verified users pass through.
  if (isPaidGateEnabled() && !result.hasActiveSub) {
    redirect(subscribeRedirect);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Status display helpers
// ---------------------------------------------------------------------------

/**
 * Human-readable label for each access status.
 * Useful for rendering status badges in admin views or account pages.
 */
export function accessStatusLabel(status: SubscriberAccessStatus): string {
  const labels: Record<SubscriberAccessStatus, string> = {
    active: "Active Subscriber",
    cancelled: "Cancelled",
    expired: "Expired",
    declined: "Payment Declined",
    refunded: "Refunded",
    chargeback: "Chargeback",
    pending: "Pending",
    unknown: "Unknown",
    not_found: "No Subscription",
  };
  return labels[status] ?? "Unknown";
}

/**
 * Returns true for statuses that should be shown a "resubscribe" CTA.
 */
export function shouldShowResubscribeCTA(
  status: SubscriberAccessStatus
): boolean {
  return ["cancelled", "expired", "declined", "not_found"].includes(status);
}

/**
 * Returns true for statuses that indicate a payment dispute — may need
 * special handling (e.g. content lockout, support escalation).
 */
export function isDisputeStatus(status: SubscriberAccessStatus): boolean {
  return status === "chargeback" || status === "refunded";
}
