# Aura8 — Deployment Verification Checklist

Use this checklist to confirm the app is ready for CCBill compliance review on Railway.

Replace `<BASE_URL>` with your actual Railway URL (e.g. `https://has-aim-v1-production.up.railway.app`)  
or `https://aura8.fun` once DNS is pointed.

---

## 1. Health & Availability

- [ ] **Health endpoint responds with 200**
  ```
  curl https://<BASE_URL>/api/health
  # Expected: {"status":"ok"}
  ```

- [ ] **Root page returns 200** (not a redirect loop or 404)
  ```
  curl -I https://<BASE_URL>/
  # Expected: HTTP/2 200
  ```

- [ ] **Root page shows "Aura8 Compliance Portal — Login to continue"**
  (visible in browser at `<BASE_URL>`)

---

## 2. Compliance Login Page

- [ ] **Login page loads at `/aura8/compliance-login`**
  ```
  curl -I https://<BASE_URL>/aura8/compliance-login
  # Expected: HTTP/2 200
  ```

- [ ] **Login form is visible** (email + password fields, Sign in button)

- [ ] **Valid credentials redirect to `/aura8/compliance-review`**

- [ ] **Invalid password returns error** "Invalid credentials"

- [ ] **Invalid username returns error** "Invalid credentials"

- [ ] **Page loads in < 2 seconds** (measure with browser DevTools → Network)

---

## 3. CCBill Webhook

- [ ] **Webhook endpoint accepts POST requests**
  ```
  curl -X POST "https://<BASE_URL>/api/ccbill/webhook?secret=<CCBILL_WEBHOOK_SECRET>" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "eventType=NewSaleSuccess&subscriptionId=TEST123"
  # Expected: HTTP 200
  ```

- [ ] **Webhook GET (ping) returns 200**
  ```
  curl https://<BASE_URL>/api/ccbill/webhook
  # Expected: {"status":"ok"}
  ```

- [ ] **Events appear in Supabase `ccbill_webhook_events` table** after POST

---

## 4. Admin Debug Page

- [ ] **Admin page is protected** (returns 404 without correct secret)
  ```
  curl -I https://<BASE_URL>/admin/ccbill
  # Expected: HTTP/2 404
  ```

- [ ] **Admin page loads with correct secret**
  ```
  curl -I "https://<BASE_URL>/admin/ccbill?secret=<ADMIN_DEBUG_SECRET>"
  # Expected: HTTP/2 200
  ```

---

## 5. Supabase Connectivity

- [ ] **Database tables exist** (run in Supabase SQL Editor):
  ```sql
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'compliance_accounts',
    'compliance_audit_log',
    'aura8_subscribers',
    'ccbill_webhook_events'
  );
  ```
  Expected: 4 rows returned.

- [ ] **Compliance account exists for CCBill auditor**:
  ```sql
  SELECT id, username, active, organization
  FROM public.compliance_accounts
  WHERE username = 'ccbill_compliance_auditor';
  ```
  Expected: 1 row, `active = true`.

---

## 6. Compliance Dashboard (post-login)

- [ ] **Dashboard loads after login** at `/aura8/compliance-review`

- [ ] **Age Verifications tab** — shows Yoti verification logs

- [ ] **Payment Events tab** — shows CCBill webhook history

- [ ] **Subscribers tab** — shows subscriber status

- [ ] **Audit Trail tab** — shows login event for CCBill auditor

- [ ] **Logout button works**

- [ ] **Session expires after 30 minutes** (auto-logout)

---

## 7. No 404 Errors

- [ ] `/` → 200
- [ ] `/aura8/compliance-login` → 200
- [ ] `/api/health` → 200
- [ ] `/api/ccbill/webhook` → 200

---

## 8. Performance

- [ ] **Root page TTFB < 2 seconds** (static render)
- [ ] **Login page TTFB < 2 seconds** (client-side hydration acceptable)

---

## 9. Send Credentials to CCBill

Once all boxes above are checked, email Sinisha Golemac:

- **Email:** sinishag@ccbill.com
- **Subject:** Aura8 Compliance Dashboard Access Ready
- **URL:** `https://<BASE_URL>/aura8/compliance-login`
- **Credentials:** `ccbill_compliance_auditor` / `<password>`

See `docs/COMPLIANCE-STATIC-LOGIN-DEPLOYMENT.md` → Step 6 for the full email template.

---

*Last updated: 2026-07-03*
