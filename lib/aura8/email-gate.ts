/**
 * lib/aura8/email-gate.ts
 *
 * Server-only helpers for the email verification gate.
 *
 * Covers:
 *   - Rate-limit logic: 1 send per EMAIL_RESEND_COOLDOWN_SECONDS (default 60)
 *   - Token expiry config: EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES (default 15)
 *   - Verify attempt tracking: EMAIL_VERIFY_MAX_ATTEMPTS (default 10)
 *   - Typed error codes shared between route handlers and the client component
 *
 * ─── Environment Variables ────────────────────────────────────────────────────
 *
 *   EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES  default: 15
 *     How long a verification link stays valid.
 *
 *   EMAIL_RESEND_COOLDOWN_SECONDS            default: 60
 *     Minimum seconds between resend requests per email address.
 *
 *   EMAIL_VERIFY_MAX_ATTEMPTS                default: 10
 *     Max failed lookups before a token is locked (brute-force guard).
 *     Requires verify_attempts column — see scripts/migrate-email-tokens.sql.
 *
 * Never import this in client components.
 */

// ---------------------------------------------------------------------------
// Config readers
// ---------------------------------------------------------------------------

/** Token validity window in milliseconds. */
export function tokenExpiryMs(): number {
  const m = parseInt(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES ?? "15", 10);
  return (isNaN(m) || m < 1 ? 15 : m) * 60 * 1000;
}

/** Token validity in minutes — for display in emails and UI. */
export function tokenExpiryMinutes(): number {
  return tokenExpiryMs() / 60_000;
}

/** Resend cooldown in milliseconds. */
export function resendCooldownMs(): number {
  const s = parseInt(process.env.EMAIL_RESEND_COOLDOWN_SECONDS ?? "60", 10);
  return (isNaN(s) || s < 10 ? 60 : s) * 1000;
}

/** Resend cooldown in seconds — for display on the button. */
export function resendCooldownSeconds(): number {
  return resendCooldownMs() / 1000;
}

/** Max token lookup attempts before the token is locked. */
export function maxVerifyAttempts(): number {
  const n = parseInt(process.env.EMAIL_VERIFY_MAX_ATTEMPTS ?? "10", 10);
  return isNaN(n) || n < 1 ? 10 : n;
}

// ---------------------------------------------------------------------------
// Rate-limit check (uses existing created_at column — no migration needed)
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  limited: boolean;
  /**
   * ISO timestamp of when the cooldown ends.
   * Sent to the client so it can run a live countdown without polling.
   */
  retryAfter: string | null;
  secondsRemaining: number;
}

/**
 * Returns whether an email address is currently rate-limited for resends.
 *
 * Pass the `created_at` of the most recent token row for this email.
 * Uses the existing column — no schema changes required.
 */
export function checkResendRateLimit(lastSentAt: string | null): RateLimitResult {
  if (!lastSentAt) return { limited: false, retryAfter: null, secondsRemaining: 0 };

  const elapsed = Date.now() - new Date(lastSentAt).getTime();
  const cooldown = resendCooldownMs();

  if (elapsed >= cooldown) return { limited: false, retryAfter: null, secondsRemaining: 0 };

  const remainingMs = cooldown - elapsed;
  return {
    limited: true,
    retryAfter: new Date(Date.now() + remainingMs).toISOString(),
    secondsRemaining: Math.ceil(remainingMs / 1000),
  };
}

// ---------------------------------------------------------------------------
// Token expiry check
// ---------------------------------------------------------------------------

export interface ExpiryResult {
  expired: boolean;
  secondsRemaining: number;
  /** ISO expiry timestamp — send to client for live countdown. */
  expiresAt: string;
}

/**
 * Returns whether a token has expired and how many seconds remain.
 * @param expiresAtIso  The expires_at value from the aura8_email_tokens row.
 */
export function checkTokenExpiry(expiresAtIso: string): ExpiryResult {
  const remaining = new Date(expiresAtIso).getTime() - Date.now();
  if (remaining <= 0) {
    return { expired: true, secondsRemaining: 0, expiresAt: expiresAtIso };
  }
  return { expired: false, secondsRemaining: Math.ceil(remaining / 1000), expiresAt: expiresAtIso };
}

// ---------------------------------------------------------------------------
// Typed error codes
// ---------------------------------------------------------------------------

/**
 * Error codes from /api/aura8/auth/email-verify.
 * The client switches on errorCode to show specific messages and actions.
 */
export type VerifyErrorCode =
  | "TOKEN_NOT_FOUND"  // invalid / already used
  | "TOKEN_EXPIRED"    // past expires_at
  | "TOKEN_LOCKED"     // too many failed attempts
  | "SERVER_ERROR";    // unexpected failure

/**
 * Error codes from /api/aura8/auth/send-verification-email.
 */
export type SendErrorCode =
  | "RATE_LIMITED"   // within cooldown window
  | "INVALID_EMAIL"  // bad format
  | "SEND_FAILED"    // SendGrid error
  | "SERVER_ERROR";  // unexpected failure
