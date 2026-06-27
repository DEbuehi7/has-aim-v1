# Aura8 Access Control

This document explains how subscriber status is determined and how to connect paid-access enforcement to protected pages.

---

## Gate Layers

Aura8 has two independent access gates that stack on top of each other:

```
Request
  │
  ▼
┌─────────────────────────────────────────┐
│  Gate 1: Email Verification             │  ← LIVE (always enforced)
│  Cookie: aura8_verified = "true"        │
│  Cookie: aura8_email = "<email>"        │
└─────────────────────────────────────────┘
  │ pass
  ▼
┌─────────────────────────────────────────┐
│  Gate 2: Paid Subscription              │  ← WIRED, not yet enforced
│  aura8_subscribers.status = "active"    │  ← flip AURA8_PAID_GATE_ENABLED=true
└─────────────────────────────────────────┘
  │ pass
  ▼
Protected content
```

---

## How Subscriber Status Is Determined

### Source of truth
`aura8_subscribers.status` — written by the CCBill webhook handler at `/api/ccbill/webhook`.

### Status values

| Status | Meaning | Has access? |
|--------|---------|-------------|
| `active` | Paid and current | ✅ Yes |
| `cancelled` | Subscriber cancelled | ❌ No |
| `expired` | Subscription period ended | ❌ No |
| `declined` | Payment declined / failed | ❌ No |
| `refunded` | Charge refunded | ❌ No |
| `chargeback` | Chargeback filed | ❌ No |
| `pending` | Payment initiated, not confirmed | ❌ No |
| `unknown` | Row exists, status unrecognized | ❌ No |
| `not_found` | No row in aura8_subscribers | ❌ No |

Only `active` grants access. All other statuses are treated as no-access.

### Lookup flow

```
email (from aura8_email cookie)
  │
  ▼
lib/aura8/subscriber-status.ts → getSubscriberStatus(email)
  │
  ▼
SELECT * FROM aura8_subscribers WHERE email = $1
  │
  ├── row found  → normalize status → return SubscriberStatusResult
  └── no row     → return { accessStatus: "not_found", hasAccess: false }
```

---

## Files

| File | Purpose |
|------|---------|
| `lib/aura8/subscriber-status.ts` | DB lookup — `getSubscriberStatus(email)`, `getSubscriberStatusById(id)` |
| `lib/aura8/access.ts` | Guard helpers — `checkAccess()`, `requireEmailVerified()`, `requirePaidAccess()` |
| `lib/ccbill/map-status.ts` | Maps CCBill event types → canonical status strings |
| `app/api/ccbill/webhook/route.ts` | Writes status to `aura8_subscribers` on every CCBill postback |

---

## Environment Variables

| Variable | Default | Effect |
|----------|---------|--------|
| `AURA8_PAID_GATE_ENABLED` | `false` | Set to `"true"` to enforce paid subscription checks |

Add to `.env.local` and Vercel project settings.

---

## How to Connect Paid Access to a Protected Page

### Step 1 — Convert the page to a Server Component

The guard helpers use `cookies()` and `redirect()` from Next.js, which only work in Server Components or Route Handlers.

```tsx
// app/aura8/members/page.tsx
// Remove "use client" if present

import { requirePaidAccess } from "@/lib/aura8/access";

export default async function MembersPage() {
  // This checks email verification AND paid subscription.
  // Redirects to /aura8 if not email-verified.
  // Redirects to /aura8/subscribe if not an active subscriber
  // (only when AURA8_PAID_GATE_ENABLED=true).
  const access = await requirePaidAccess();

  return (
    <div>
      {/* Paid content here */}
      <p>Welcome, {access.email}</p>
    </div>
  );
}
```

### Step 2 — Enable the paid gate when ready

```bash
# In Vercel dashboard → Settings → Environment Variables:
AURA8_PAID_GATE_ENABLED = true
```

No code changes needed. The gate is already wired — flipping this env var is the only switch.

### Step 3 — Create the subscribe page

When a non-subscriber hits a paid page, they are redirected to `/aura8/subscribe`. Create that page with your CCBill FlexForms embed or a "Subscribe" CTA.

---

## Usage Patterns

### Pattern A — Hard gate (redirect non-subscribers)

```tsx
// app/aura8/content/page.tsx
import { requirePaidAccess } from "@/lib/aura8/access";

export default async function ContentPage() {
  await requirePaidAccess(); // redirects if not active subscriber
  return <PaidContent />;
}
```

### Pattern B — Soft gate (show paywall inline)

```tsx
// app/aura8/preview/page.tsx
import { checkAccess } from "@/lib/aura8/access";
import { shouldShowResubscribeCTA } from "@/lib/aura8/access";

export default async function PreviewPage() {
  const access = await checkAccess();

  if (!access.emailVerified) {
    return <EmailGate />;
  }

  if (!access.hasActiveSub) {
    const status = access.subscriberResult?.accessStatus ?? "not_found";
    return <Paywall showResubscribe={shouldShowResubscribeCTA(status)} />;
  }

  return <PaidContent />;
}
```

### Pattern C — API route guard

```ts
// app/api/aura8/protected/route.ts
import { checkAccess } from "@/lib/aura8/access";
import { NextResponse } from "next/server";

export async function GET() {
  const access = await checkAccess();

  if (!access.emailVerified) {
    return NextResponse.json({ error: "Email verification required" }, { status: 401 });
  }

  if (!access.hasActiveSub) {
    return NextResponse.json({ error: "Active subscription required" }, { status: 403 });
  }

  return NextResponse.json({ data: "..." });
}
```

### Pattern D — Email-only gate (no paid check)

```tsx
import { requireEmailVerified } from "@/lib/aura8/access";

export default async function FreePage() {
  await requireEmailVerified(); // only checks email gate, ignores subscription
  return <FreeContent />;
}
```

---

## The `aura8_email` Cookie

The access helpers read the `aura8_email` cookie to know which subscriber to look up. This cookie must be set by the email verification flow alongside `aura8_verified`.

**Check your verify route** (`app/api/aura8/auth/email-verify/route.ts`) to confirm it sets both cookies:

```ts
// Required cookies set on successful verification:
response.cookies.set("aura8_verified", "true", { httpOnly: true, ... });
response.cookies.set("aura8_email", email, { httpOnly: true, ... });
```

If `aura8_email` is not set, `checkAccess()` will return `hasActiveSub: false` and `subscriberResult: null` even for active subscribers. The email gate will still pass (since `aura8_verified` is checked independently).

---

## Rollout Plan

1. **Now**: CCBill webhook is live, writing to `aura8_subscribers`. Email gate unchanged.
2. **Next**: Add `aura8_email` cookie to the verify route if not already present.
3. **Then**: Create `/aura8/subscribe` page with CCBill FlexForms embed.
4. **Finally**: Set `AURA8_PAID_GATE_ENABLED=true` in Vercel and add `requirePaidAccess()` to protected pages.

---

## Monitoring

Query unprocessed or errored webhook events:

```sql
-- Events that failed subscriber upsert
SELECT id, event_type, email, processing_error, created_at
FROM ccbill_webhook_events
WHERE processed = false
ORDER BY created_at DESC
LIMIT 50;

-- Active subscribers
SELECT email, subscription_id, last_payment_at, affiliate, campaign
FROM aura8_subscribers
WHERE status = 'active'
ORDER BY last_payment_at DESC;

-- Subscribers by status breakdown
SELECT status, count(*) FROM aura8_subscribers GROUP BY status;
```
