# Compliance Static Login: Deployment Guide

**Purpose:** Deploy static compliance access for CCBill/Visa/Mastercard audits  
**Status:** Ready for production  
**Last Updated:** 2026-07-01

---

## Pre-Deployment Checklist

- [ ] Supabase project created and credentials available
- [ ] Environment variables configured in Vercel
- [ ] bcryptjs installed (already in package.json)
- [ ] Code merged to `main` branch
- [ ] Ready to generate static credentials

---

## Step 1: Environment Variables (Vercel)

Set these variables in your Vercel project settings:

```env
# Compliance session management
COMPLIANCE_SESSION_SECRET=your_32_char_random_secret_here
COMPLIANCE_SESSION_DURATION_MINUTES=30

# Optional: IP whitelist (comma-separated)
COMPLIANCE_IP_WHITELIST=203.0.113.0,198.51.100.0

# Required: Supabase credentials (should already be set)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Generating `COMPLIANCE_SESSION_SECRET`

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (64-character hex string) to Vercel environment variables.

---

## Step 2: Run Supabase Migration

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `scripts/create-compliance-static-login.sql`
5. Click **RUN**
6. Verify the following tables were created:
   - `public.compliance_accounts`
   - `public.compliance_audit_log`
7. Verify RLS policies were added to:
   - `public.aura8_subscribers`
   - `public.ccbill_webhook_events`
   - `public.yoti_verifications`

---

## Step 3: Verify Deployment

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build locally (optional)
npm run build

# Push to Vercel (auto-deploys)
git push origin main
```

Verify at: https://aura8.fun/aura8/compliance-login (should show login form)

---

## Step 4: Generate Static Compliance Credentials

### Using Node.js (CLI)

```javascript
const bcrypt = require('bcryptjs');

const password = 'GenerateSecurePassword123!@#'; // Use a strong, unique password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Username: ccbill_compliance_auditor');
  console.log('Password: ' + password);
  console.log('Password Hash: ' + hash);
});
```

### Or use an online bcrypt tool

- Go to: https://bcrypt-generator.com/
- Paste your password (generate a strong one: `crypto.randomBytes(24).toString('base64')`)
- Copy the resulting hash

---

## Step 5: Create Compliance Account in Supabase

1. Open Supabase **SQL Editor**
2. Create a new query
3. Run this SQL (replace hash):

```sql
INSERT INTO public.compliance_accounts (
  email,
  username,
  password_hash,
  account_type,
  role,
  organization,
  permissions,
  active
) VALUES (
  'compliance@ccbill.com',
  'ccbill_compliance_auditor',
  '$2a$10$[YOUR_BCRYPT_HASH_HERE]',
  'compliance_auditor',
  'read_only_auditor',
  'CCBill',
  '["view_all_content", "view_subscriber_data", "view_payment_logs", "view_age_verification_logs", "view_admin_debug_page", "view_audit_trail"]'::jsonb,
  true
);
```

4. Verify the account was created:

```sql
SELECT id, username, active, organization FROM public.compliance_accounts;
```

---

## Step 6: Deliver Credentials to CCBill

Send this email to **Sinisha Golemac** (sinishag@ccbill.com):

---

**Subject:** Aura8 Compliance Dashboard Access Ready – Static Login

Hi Sinisha,

The static compliance access system for Aura8 is now live and ready for your team's review.

**Access URL:**
https://aura8.fun/aura8/compliance-login

**Static Login Credentials:**
- **Username:** ccbill_compliance_auditor
- **Password:** [PASSWORD_HERE]

**Dashboard Features:**
✅ Age Verification Logs (Yoti integration)
✅ Payment Events (CCBill webhook history)
✅ Subscriber Status (active, canceled, chargeback, etc.)
✅ Complete Audit Trail (all access logged with IP + timestamp)

**Security Notes:**
- Read-only access only (no modifications, deletions, exports)
- All access is logged and audited
- Session duration: 30 minutes (auto-logout on inactivity)
- Session-based authentication (no persistent tokens)
- All credentials stored securely with bcrypt hashing

**Testing:**
1. Visit: https://aura8.fun/aura8/compliance-login
2. Enter credentials above
3. Review all 4 compliance tabs
4. Verify audit trail shows your login
5. Log out or wait 30 minutes for auto-logout

Your team can access 24/7 for Visa/Mastercard compliance review.

Ready to approve merchant account at your earliest convenience.

Best regards,
[Your Name]

---

## Testing Checklist

- [ ] Login page loads at `/aura8/compliance-login`
- [ ] Login form displays correctly (no styling issues)
- [ ] Valid credentials → redirect to `/aura8/compliance-review` ✅
- [ ] Invalid password → error message "Invalid credentials" ✅
- [ ] Invalid username → error message "Invalid credentials" ✅
- [ ] Dashboard loads with 4 tabs: Verifications, Payments, Subscribers, Audit ✅
- [ ] Verifications tab displays yoti_verifications table ✅
- [ ] Payments tab displays ccbill_webhook_events table ✅
- [ ] Subscribers tab displays aura8_subscribers table ✅
- [ ] Audit tab displays compliance_audit_log entries ✅
- [ ] Login event appears in audit trail ✅
- [ ] Dashboard access event appears in audit trail ✅
- [ ] Logout button works ✅
- [ ] After 30 min inactivity → auto-logout ✅
- [ ] Token invalid after expiry → redirect to login ✅

---

## Troubleshooting

### "Login page shows 404"
- Verify deployment: `git log --oneline` should show compliance commits
- Check Vercel build log for errors
- Ensure `main` branch was merged with `copilot/implement-static-login-system`

### "Password hash error in SQL"
- Ensure bcrypt hash is copied completely (should be ~60 characters)
- Hash format: `$2a$10$[...60 chars total]`
- Re-generate hash if unsure

### "No data in compliance dashboard"
- Verify Supabase migration ran successfully
- Check that tables exist: `yoti_verifications`, `ccbill_webhook_events`, `aura8_subscribers`
- Check if any data exists in those tables

### "Session token verification fails"
- Ensure `COMPLIANCE_SESSION_SECRET` is set in Vercel
- Secret must be exactly 32 bytes (64 hex characters)
- Re-deploy after changing environment variable

---

## Production Checklist

- [ ] Environment variables configured in Vercel
- [ ] Supabase migration applied
- [ ] Static compliance credentials generated
- [ ] Compliance account created in Supabase
- [ ] Credentials delivered to CCBill (Sinisha)
- [ ] IP whitelist configured (optional)
- [ ] Auto-logout timer tested
- [ ] Audit logging verified
- [ ] 30-min session timeout tested
- [ ] Deployment verified at production URL

---

## Monitoring

Check compliance access logs periodically:

```sql
-- Recent compliance logins
SELECT
  ca.organization,
  ca.username,
  cal.action,
  cal.ip_address,
  cal.created_at
FROM public.compliance_audit_log cal
JOIN public.compliance_accounts ca ON cal.compliance_account_id = ca.id
ORDER BY cal.created_at DESC
LIMIT 50;
```

---

## Support

**CCBill Contact:**
- Name: Sinisha Golemac
- Title: Account Executive
- Email: sinishag@ccbill.com
- Mobile: 310-218-8281
- Office: 480-788-2954

**Compliance Dashboard URL:** https://aura8.fun/aura8/compliance-login
