# Compliance Static Login Deployment & Testing Guide

## 1) Apply Supabase migration

Run:

- `/home/runner/work/has-aim-v1/has-aim-v1/scripts/create-compliance-static-login.sql`

## 2) Configure environment variables

Set:

- `COMPLIANCE_SESSION_SECRET` (required, long random secret)
- `COMPLIANCE_SESSION_DURATION_MINUTES` (optional, default `30`)
- `COMPLIANCE_IP_WHITELIST` (optional, comma-separated IPs)

## 3) Create compliance account (example)

Generate bcrypt hash and insert account:

```sql
insert into public.compliance_accounts (
  email,
  username,
  password_hash,
  organization,
  permissions,
  restrictions
) values (
  'compliance@ccbill.com',
  'ccbill_compliance_auditor',
  '$2a$10$REPLACE_WITH_BCRYPT_HASH',
  'CCBill',
  '["view_all_content","view_subscriber_data","view_payment_logs","view_age_verification_logs","view_audit_trail"]'::jsonb,
  '["cannot_modify_content","cannot_modify_subscribers","cannot_modify_payments","cannot_delete_logs","cannot_export_data"]'::jsonb
);
```

## 4) Endpoints and pages

- Login API: `POST /api/auth/compliance-login`
- Data API: `GET /api/compliance/data` with `X-Compliance-Token`
- Login page: `/aura8/compliance-login`
- Dashboard: `/aura8/compliance-review`

## 5) Testing checklist

- Login valid credentials returns `200` and `session_token`
- Login invalid credentials returns `401`
- Expired/inactive account returns `403`
- Dashboard loads all datasets:
  - `yoti_verifications`
  - `ccbill_webhook_events`
  - `aura8_subscribers`
  - `compliance_audit_log`
- Every login and dashboard data read creates `compliance_audit_log` records
- Removing/expiring token redirects back to `/aura8/compliance-login`
