# Aura8 Email Verification Gate

Gate 1 of Aura8's two-layer access system. Confirms a user controls a real email
and has agreed to the age attestation before viewing protected content.

---

## Files

| File | Role |
|------|------|
| `app/components/age-gate.tsx` | Client UI: form, sent state, expiry timer, resend, email change |
| `app/components/content-gate.tsx` | Wrapper: reads cookie via API, shows AgeGate or children |
| `app/api/aura8/auth/send-verification-email/route.ts` | Sends email, enforces rate limit, returns `expiresAt` |
| `app/api/aura8/auth/email-verify/route.ts` | Validates token, sets cookies, tracks attempts |
| `app/api/aura8/auth/check-verified/route.ts` | Cookie ping — reads `aura8_verified` |
| `lib/aura8/email-gate.ts` | Pure helpers: rate-limit, expiry, config, error codes |
| `scripts/create-aura8-email-tokens.sql` | Creates `aura8_email_tokens` table |
| `scripts/migrate-email-tokens.sql` | Adds `verify_attempts` column |

---

## Environment Variables

| Variable | Default | Effect |
|----------|---------|--------|
| `EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES` | `15` | Link validity window |
| `EMAIL_RESEND_COOLDOWN_SECONDS` | `60` | Min seconds between resends per email |
| `EMAIL_VERIFY_MAX_ATTEMPTS` | `10` | Max failed lookups before token lock |
| `SENDGRID_API_KEY` | — | Required to send emails |
| `NEXT_PUBLIC_SITE_URL` | `https://aura8.fun` | Base URL in verification link |

---

## User Flows

**Happy path:** Enter email + checkboxes → send → "Check your email" screen with expiry countdown → click link → verified ✓

**Resend:** After 60 s cooldown the resend link activates. Click → old token deleted, new email sent, both countdowns reset.

**Link expired:** Countdown hits 00:00 → "⏱ Your link has expired" state shown automatically with SEND NEW LINK button.

**Email change:** Click "wrong email?" → inline input appears → enter new email → send → email updated, no page reload.

**Invalid link:** Verify page gets `TOKEN_NOT_FOUND` or `TOKEN_EXPIRED` → specific message with CTA to request new link.

---

## Rate Limiting

Uses existing `created_at` column — no schema change required.

On each send request the server checks `now - last_created_at < 60 s`. If limited:
```json
{ "errorCode": "RATE_LIMITED", "retryAfter": "<ISO>", "secondsRemaining": 47 }
```
Client drives a live countdown from `retryAfter` (no polling). Configure via `EMAIL_RESEND_COOLDOWN_SECONDS`.

---

## Token Expiry

- `EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES` controls the window (default 15 min)
- Send route returns `expiresAt` ISO → client drives live `mm:ss` countdown
- When countdown hits 00:00 → expired UI shown automatically
- Verify route returns `TOKEN_EXPIRED` → token deleted → user must resend

---

## Attempt Tracking

Requires `verify_attempts` column — run `scripts/migrate-email-tokens.sql`.

Each failed verify increments the counter. At `EMAIL_VERIFY_MAX_ATTEMPTS` (default 10) the token is deleted and the user must request a new link. Graceful degradation if column is absent.

---

## Error Codes

### `POST /api/aura8/auth/send-verification-email`

| Code | HTTP | Meaning |
|------|------|---------|
| `INVALID_EMAIL` | 400 | Bad email format |
| `RATE_LIMITED` | 429 | Within cooldown; `retryAfter` in response |
| `SEND_FAILED` | 502 | SendGrid error |
| `SERVER_ERROR` | 500 | Unexpected |

### `POST /api/aura8/auth/email-verify`

| Code | HTTP | Meaning | UI action |
|------|------|---------|-----------|
| `TOKEN_NOT_FOUND` | 400 | Invalid or already used | Request new link |
| `TOKEN_EXPIRED` | 400 | Past `expires_at` | Expired state + resend |
| `TOKEN_LOCKED` | 400 | Max attempts hit | Request fresh link |
| `SERVER_ERROR` | 500 | Unexpected | Generic retry |

---

## Cookies Set on Success

| Cookie | Value | Notes |
|--------|-------|-------|
| `aura8_verified` | `"true"` | httpOnly, 1 yr — gates ContentGate |
| `aura8_email` | email string | httpOnly, 1 yr — used by `lib/aura8/access.ts` |

---

## Setup Checklist

```
[ ] Run scripts/create-aura8-email-tokens.sql in Supabase SQL Editor
[ ] Run scripts/migrate-email-tokens.sql (adds verify_attempts)
[ ] Set SENDGRID_API_KEY in Vercel env vars
[ ] Set NEXT_PUBLIC_SITE_URL=https://aura8.fun
[ ] Tune EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES (default 15)
[ ] Tune EMAIL_RESEND_COOLDOWN_SECONDS (default 60)
[ ] Tune EMAIL_VERIFY_MAX_ATTEMPTS (default 10)
```
