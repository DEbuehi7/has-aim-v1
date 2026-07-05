# CCBill Webhook Testing Guide

Inject test events without a live CCBill account.

---

## How It Works

`POST /api/ccbill/webhook/test` runs the **exact same `processWebhook()` pipeline** as the real webhook. Same DB writes, same subscriber upserts. Test events have `source = "test"` in `ccbill_webhook_events`.

---

## Setup

```bash
# .env.local (same secret used by /admin/ccbill)
ADMIN_DEBUG_SECRET=your-local-secret-here
npm run dev
```

---

## Files

| File | Purpose |
|------|---------|
| `app/api/ccbill/webhook/test/route.ts` | Test injection endpoint |
| `app/admin/ccbill/test/page.tsx` | Browser form UI |
| `lib/ccbill/test-payloads.ts` | Templates for 7 event types |
| `lib/ccbill/process-webhook.ts` | Shared processing (real + test) |

---

## Event Templates

| Key | CCBill Event | Expected Status |
|-----|-------------|----------------|
| `sale` | `NewSaleSuccess` | `active` |
| `rebill` | `RebillSuccess` | `active` |
| `cancel` | `Cancellation` | `cancelled` |
| `expire` | `Expiration` | `expired` |
| `decline` | `NewSaleFailure` | `declined` |
| `chargeback` | `Chargeback` | `chargeback` |
| `refund` | `Refund` | `refunded` |

---

## cURL Commands

Replace `YOUR_SECRET` with `ADMIN_DEBUG_SECRET`. Append `| jq .` for pretty output (`brew install jq`).

**New Sale (activate subscriber):**
```bash
curl -s -X POST "http://localhost:3000/api/ccbill/webhook/test?secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"eventKey":"sale","overrides":{"email":"test@example.com","subscriptionId":"SUB-001"}}' | jq .
```

**Rebill:** `"eventKey":"rebill"` · **Cancel:** `"eventKey":"cancel"` · **Expire:** `"eventKey":"expire"`

**Decline:**
```bash
curl -s -X POST "http://localhost:3000/api/ccbill/webhook/test?secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"eventKey":"decline","overrides":{"email":"test@example.com"}}' | jq .
```

**Chargeback:** `"eventKey":"chargeback"` · **Refund:** `"eventKey":"refund"`

**Raw (no template):**
```bash
curl -s -X POST "http://localhost:3000/api/ccbill/webhook/test?secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"raw":{"eventType":"RenewalSuccess","email":"test@example.com","subscriptionId":"SUB-001"}}' | jq .
```

**Full lifecycle (sale → cancel):**
```bash
S=YOUR_SECRET; E=lifecycle@example.com
curl -s -X POST "http://localhost:3000/api/ccbill/webhook/test?secret=$S" \
  -H "Content-Type: application/json" \
  -d "{\"eventKey\":\"sale\",\"overrides\":{\"email\":\"$E\"}}" | jq .subscriberStatus
# → "active"
curl -s -X POST "http://localhost:3000/api/ccbill/webhook/test?secret=$S" \
  -H "Content-Type: application/json" \
  -d "{\"eventKey\":\"cancel\",\"overrides\":{\"email\":\"$E\"}}" | jq .subscriberStatus
# → "cancelled"
```

---

## Browser UI

```
http://localhost:3000/admin/ccbill/test?secret=YOUR_SECRET
```

Pick event type, enter email, click INJECT. Result panel shows subscriber status, event row ID, and a direct link to the admin debug page.

---

## Verifying Results

Open `http://localhost:3000/admin/ccbill?secret=YOUR_SECRET` after each inject:

| Section | What to check |
|---------|--------------|
| Unprocessed / Errored | Should be empty |
| Recent Webhook Events | New row: correct `event_type`, `source=test`, `OK=✓` |
| Recent Subscribers | Row for test email: `status` = expected value |

---

## Validation Errors

| Scenario | HTTP | Message |
|----------|------|---------|
| Wrong/missing secret | 404 | `Not found` |
| Unknown `eventKey` | 400 | `Unknown eventKey "..."` |
| Missing `eventType` in raw | 400 | Describes the field requirement |
| Missing email + subscriptionId | 400 | Describes the field requirement |
| Invalid JSON | 400 | `Request body must be valid JSON` |

---

## Cleaning Up Test Data

```sql
-- List all test-injected events
SELECT id, event_type, email, created_at
FROM ccbill_webhook_events WHERE source = 'test' ORDER BY created_at DESC;

-- Remove test events before go-live
DELETE FROM ccbill_webhook_events WHERE source = 'test';
```

> **Warning:** Test events write to `aura8_subscribers` — the same table real CCBill events use. Always use disposable test emails like `test-sale@example.com` to avoid overwriting real subscriber statuses.
