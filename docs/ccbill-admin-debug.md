# CCBill Admin Debug Page

Internal page for inspecting CCBill webhook events and Aura8 subscriber state.

---

## Route

```
/admin/ccbill
```

## What It Shows

| Section | Data |
|---------|------|
| Unprocessed / Errored Events | Webhook events where `processed = false` or `processing_error` is set |
| Recent Webhook Events | Latest 25 rows from `ccbill_webhook_events` |
| Recent Subscribers | Latest 25 rows from `aura8_subscribers` |

All data is fetched server-side using the Supabase service role key. Nothing is exposed to the browser beyond rendered HTML.

---

## Files

| File | Purpose |
|------|---------|
| `app/admin/ccbill/page.tsx` | Server Component — renders the debug page |
| `lib/aura8/admin-data.ts` | Data fetching — queries both Supabase tables in parallel |

---

## Current Protection

The page is protected by a **server-side secret check** using the `ADMIN_DEBUG_SECRET` environment variable.

### How it works

- The page calls `notFound()` (returns HTTP 404) if the secret is missing or wrong
- The secret is never sent to the browser or logged
- Fail-closed: if `ADMIN_DEBUG_SECRET` is not set, the page is always blocked

### Access methods

**Query param (browser-friendly):**
```
https://aura8.fun/admin/ccbill?secret=YOUR_SECRET
```

**Request header (curl / API clients):**
```bash
curl -H "x-admin-secret: YOUR_SECRET" https://aura8.fun/admin/ccbill
```

---

## Required Env Var

| Variable | Description |
|----------|-------------|
| `ADMIN_DEBUG_SECRET` | A random secret required to access the admin page |

Generate a strong value:
```bash
openssl rand -hex 32
```

Add to:
- `.env.local` for local development
- Vercel dashboard → Settings → Environment Variables → Production

The page also uses the existing `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` (already set).

---

## Upgrade Path (when ready)

This secret-param approach is a temporary measure. Upgrade to one of these when the team grows:

### Option A — Vercel Password Protection (no code)
Vercel dashboard → Settings → Password Protection → enable for `/admin/*`

### Option B — Next.js Middleware session check
```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const token = req.cookies.get("admin_token")?.value;
    if (token !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
```

### Option C — IP Allowlist
Vercel → Settings → Firewall → block `/admin/*` except from your IP

---

## Local Testing

Add to `.env.local`:
```
ADMIN_DEBUG_SECRET=your-local-secret-here
```

```bash
npm run dev
# Visit: http://localhost:3000/admin/ccbill?secret=your-local-secret-here
```

The page will show empty tables until CCBill webhook events start arriving. You can seed test data with:

```bash
curl -X POST "http://localhost:3000/api/ccbill/webhook" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "eventType=NewSaleSuccess&email=test%40example.com&subscriptionId=SUB123&transactionId=TXN456&amount=9.99&currency=USD&affiliate=AFF001"
```

Then refresh `/admin/ccbill` to see the event and subscriber row.

---

## Columns Reference

### Webhook Events (`ccbill_webhook_events`)

| Column | Description |
|--------|-------------|
| Created | When the postback was received |
| Event Type | e.g. `NewSaleSuccess`, `Cancellation` |
| Email | Customer email |
| Sub ID | CCBill subscription ID |
| Txn ID | CCBill transaction ID |
| Status | Raw status from CCBill payload |
| Amount | Charge amount |
| Affiliate | Affiliate ID |
| Subacc | Sub-account |
| Campaign | Campaign ID |
| OK | Whether subscriber upsert succeeded |
| Error | Processing error message if any |

### Subscribers (`aura8_subscribers`)

| Column | Description |
|--------|-------------|
| Updated | Last time the row was updated |
| Email | Subscriber email (unique key) |
| Sub ID | CCBill subscription ID |
| Customer ID | CCBill customer/account number |
| Status | `active`, `cancelled`, `expired`, `declined`, etc. |
| Affiliate | Affiliate ID captured at signup |
| Subacc | Sub-account |
| Campaign | Campaign ID |
| Tracking | Tracking / TID parameter |
| Last Payment | Timestamp of last successful payment |
