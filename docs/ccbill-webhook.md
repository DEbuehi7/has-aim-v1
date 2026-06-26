# CCBill Webhook Integration — Aura8

This document covers the CCBill postback ingestion system added to the Aura8 product.

---

## Overview

CCBill sends HTTP POST requests (postbacks) to a configured URL whenever a billing event occurs — new sale, rebill, cancellation, chargeback, etc. This integration:

1. Receives those postbacks at `/api/ccbill/webhook`
2. Optionally validates the request using a shared secret
3. Normalizes the form-encoded payload into typed fields
4. Stores the raw event in `ccbill_webhook_events` (append-only audit log)
5. Upserts the subscriber's current state in `aura8_subscribers`
6. Captures affiliate / subaccount / tracking parameters for analytics

---

## Files Changed / Added

| File | Purpose |
|------|---------|
| `app/api/ccbill/webhook/route.ts` | Main webhook route handler |
| `lib/ccbill/normalize.ts` | Parses CCBill form-encoded payload into typed fields |
| `lib/ccbill/map-status.ts` | Maps CCBill event types to canonical subscriber statuses |
| `lib/supabase/admin.ts` | Shared Supabase service-role client (server-only) |
| `scripts/create-ccbill-tables.sql` | SQL to create required Supabase tables |
| `docs/ccbill-webhook.md` | This file |

No existing files were modified.

---

## Environment Variables

Add these to `.env.local` (local dev) and to your Vercel project environment variables (production).

### Required

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Already set — your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Already set — service role key for server-side DB access |

### CCBill-specific (add these)

| Variable | Description | Example |
|----------|-------------|---------|
| `CCBILL_WEBHOOK_SECRET` | A random secret appended to the postback URL as `?secret=…` to prevent unauthorized calls. Generate with `openssl rand -hex 32`. | `a3f9...` |
| `CCBILL_ACCOUNT_NUM` | Your CCBill merchant account number (for reference / future use) | `123456` |
| `CCBILL_SUBACC` | Your CCBill sub-account number (for reference / future use) | `0000` |
| `CCBILL_FORM_NAME` | The CCBill FlexForms form name / ID (for reference / future use) | `cc-form-a` |

`CCBILL_WEBHOOK_SECRET` is strongly recommended in production. Without it, any party that knows your webhook URL can inject fake events.

---

## Webhook Route

```
POST https://aura8.fun/api/ccbill/webhook?secret=<CCBILL_WEBHOOK_SECRET>
GET  https://aura8.fun/api/ccbill/webhook   ← connectivity check, returns 200
```

### Configure in CCBill Admin

1. Log in to CCBill Merchant Admin → **Account Info** → **Approval / Denial Postback URLs** (or **FlexForms** → your form → **Postback Settings**).
2. Set the **Approval Postback URL** to:
   ```
   https://aura8.fun/api/ccbill/webhook?secret=YOUR_SECRET
   ```
3. Set the **Denial Postback URL** to the same URL (the handler normalizes both).
4. Enable all event types you want to track (NewSaleSuccess, Cancellation, RebillSuccess, etc.).

### HTTP Responses

| Status | Meaning |
|--------|---------|
| `200 OK` | Event received and processed (or logged with error) |
| `400 Bad Request` | Empty or unparseable body |
| `401 Unauthorized` | Secret mismatch (only when `CCBILL_WEBHOOK_SECRET` is set) |
| `500 Internal Server Error` | Unexpected failure — CCBill will retry |

---

## Supabase Tables

Run `scripts/create-ccbill-tables.sql` in the **Supabase SQL Editor** before going live.

### `ccbill_webhook_events`

Append-only audit log. Every postback is stored here regardless of outcome.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `created_at` | timestamptz | When the postback was received |
| `source` | text | Always `'ccbill'` |
| `event_type` | text | e.g. `NewSaleSuccess`, `Cancellation` |
| `email` | text | Customer email if provided |
| `subscription_id` | text | CCBill subscription ID |
| `transaction_id` | text | CCBill transaction ID |
| `customer_id` | text | CCBill customer / account number |
| `status` | text | Raw status from CCBill |
| `amount` | numeric | Charge amount |
| `currency` | text | Currency code |
| `affiliate` | text | Affiliate ID |
| `subaccount` | text | Sub-account / sub-affiliate |
| `campaign` | text | Campaign ID |
| `tracking_id` | text | Tracking / TID parameter |
| `payload` | jsonb | Full raw form-encoded payload |
| `headers` | jsonb | Safe subset of request headers |
| `processed` | boolean | `true` after successful subscriber upsert |
| `processing_error` | text | Error message if upsert failed |

### `aura8_subscribers`

Canonical subscriber state. Upserted on every relevant event.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `created_at` | timestamptz | First seen |
| `updated_at` | timestamptz | Last updated (auto-trigger) |
| `email` | text | Unique — primary upsert key |
| `subscription_id` | text | Unique — fallback upsert key |
| `customer_id` | text | CCBill customer number |
| `status` | text | `active`, `cancelled`, `expired`, `declined`, `refunded`, `chargeback`, `pending`, `unknown` |
| `plan` | text | Plan name (set manually or from payload) |
| `affiliate` | text | Affiliate ID captured at signup |
| `subaccount` | text | Sub-account captured at signup |
| `campaign` | text | Campaign ID |
| `tracking_id` | text | Tracking parameter |
| `last_payment_at` | timestamptz | Set on `NewSaleSuccess` / `RebillSuccess` |
| `expires_at` | timestamptz | Estimated expiry (set when period is known) |
| `metadata` | jsonb | Flexible bag: form_name, ip, country, referrer, etc. |
| `age_verified` | boolean | Set by the email verification gate |

---

## Affiliate / Tracking Parameter Capture

CCBill supports passing custom parameters through their billing forms. The webhook handler captures these automatically:

| Logical Field | CCBill param aliases checked |
|---------------|------------------------------|
| `affiliate` | `affiliate`, `affiliateId`, `affiliate_id`, `aff`, `affId`, `aff_id` |
| `subAccount` | `subAccount`, `subaccount`, `sub_account`, `clientSubacc`, `client_subacc` |
| `campaign` | `campaign`, `campaignId`, `campaign_id` |
| `trackingId` | `trackingId`, `tracking_id`, `tid`, `utm_content` |

To pass affiliate data through CCBill FlexForms, append them to the form URL:
```
https://billing.ccbill.com/jpost/signup.cgi?clientAccnum=123456&clientSubacc=0000&formName=cc-form-a&affiliate=AFFID&tid=TRACKINGID
```

CCBill will echo these back in the postback payload.

---

## Canonical Subscriber Statuses

| Status | Trigger events |
|--------|---------------|
| `active` | `NewSaleSuccess`, `RebillSuccess`, `RenewalSuccess`, `UpgradeSuccess` |
| `cancelled` | Any event containing `Cancel` |
| `expired` | Any event containing `Expir` |
| `declined` | `NewSaleFailure`, `RebillFailure`, any event containing `Decline` or `Fail` |
| `refunded` | Any event containing `Refund` or `Void` |
| `chargeback` | Any event containing `Chargeback` |
| `pending` | `NewSale` (without Success/Failure suffix) |
| `unknown` | Unrecognized event type |

---

## Security

### Current approach
- **Path-based secret**: Set `CCBILL_WEBHOOK_SECRET` and append `?secret=<value>` to the postback URL in CCBill admin. The handler validates this on every request.
- **Service role key**: Never exposed to the client. Only used server-side in the route handler.
- **No secrets logged**: The handler logs a redacted email prefix and non-sensitive fields only.

### Future improvement (when CCBill supports it)
CCBill does not currently provide universal HMAC request signing. A `TODO` comment in `route.ts` marks where to add HMAC verification once available. In the meantime, additionally consider:
- Restricting the webhook URL to [CCBill's IP ranges](https://www.ccbill.com/cs/wiki/tiki-index.php?page=Postback+IP+Addresses) at the Vercel/WAF level.

---

## Local Testing

### 1. Start the dev server
```bash
npm run dev
```

### 2. Expose locally with ngrok (or similar)
```bash
ngrok http 3000
```

### 3. Send a test postback
```bash
curl -X POST "http://localhost:3000/api/ccbill/webhook" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "eventType=NewSaleSuccess&email=test%40example.com&subscriptionId=SUB123&transactionId=TXN456&amount=9.99&currency=USD&affiliate=AFF001&campaign=summer2025"
```

Expected response:
```json
{"received": true}
```

### 4. With secret validation enabled
```bash
curl -X POST "http://localhost:3000/api/ccbill/webhook?secret=YOUR_SECRET" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "eventType=NewSaleSuccess&email=test%40example.com&subscriptionId=SUB123&amount=9.99"
```

### 5. Verify in Supabase
Check the `ccbill_webhook_events` table for the raw event and `aura8_subscribers` for the upserted subscriber row.

---

## Production Checklist

- [ ] Run `scripts/create-ccbill-tables.sql` in Supabase SQL Editor
- [ ] Generate a webhook secret: `openssl rand -hex 32`
- [ ] Add `CCBILL_WEBHOOK_SECRET` to Vercel environment variables
- [ ] Add `CCBILL_ACCOUNT_NUM`, `CCBILL_SUBACC`, `CCBILL_FORM_NAME` to Vercel env vars (for reference)
- [ ] Configure CCBill postback URL: `https://aura8.fun/api/ccbill/webhook?secret=<YOUR_SECRET>`
- [ ] Enable all desired event types in CCBill admin
- [ ] Deploy and verify with a test transaction
- [ ] Monitor `ccbill_webhook_events.processed = false` rows for any processing errors
