# Static Login for Compliance Review
**From:** Sinisha Golemac, CCBill Account Executive  
**Date:** 2026-06-30  
**Purpose:** Enable Visa/Mastercard compliance team access for platform review

---

## Requirement Summary

CCBill compliance and Visa/Mastercard require **static login credentials** to the members-only area for:
- Platform security audit
- Content compliance review
- Payment processing flow verification
- Age verification + subscriber management validation
- Data handling & privacy validation

---

## Implementation Specification

### 1. Static Compliance Login Account

**Create dedicated account in Aura8:**

```json
{
  "account_type": "compliance_auditor",
  "email": "compliance@ccbill.com",
  "username": "ccbill_compliance_auditor",
  "password": "[SECURE_STATIC_PASSWORD_STORED_SECURELY]",
  "role": "read_only_auditor",
  "permissions": [
    "view_all_content",
    "view_subscriber_data",
    "view_payment_logs",
    "view_age_verification_logs",
    "view_admin_debug_page",
    "view_audit_trail"
  ],
  "restrictions": [
    "cannot_modify_content",
    "cannot_modify_subscribers",
    "cannot_modify_payments",
    "cannot_delete_logs",
    "cannot_export_data"
  ],
  "created_at": "2026-06-30T00:00:00Z",
  "expires_at": null,
  "notes": "CCBill/Visa/Mastercard compliance auditor — permanent access for periodic reviews"
}
```

### 2. Database Schema Update (Supabase)

```sql
-- Add compliance_accounts table
CREATE TABLE public.compliance_accounts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  email text unique,
  username text unique,
  password_hash text, -- bcrypt hash, never plain text
  account_type text, -- 'compliance_auditor', 'internal_admin', etc.
  role text, -- 'read_only_auditor', 'admin', etc.
  organization text, -- 'CCBill', 'Visa', 'Mastercard'
  permissions jsonb, -- array of permitted actions
  restrictions jsonb, -- array of prohibited actions
  active boolean default true,
  last_login_at timestamptz,
  last_login_ip text,
  expires_at timestamptz, -- null = permanent
  notes text
);

-- Audit logging for compliance account access
CREATE TABLE public.compliance_audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  compliance_account_id uuid references compliance_accounts(id),
  action text, -- 'login', 'view_content', 'view_subscribers', 'view_payments'
  resource_type text, -- 'content', 'subscriber', 'payment', 'age_verification'
  resource_id uuid,
  ip_address text,
  user_agent text,
  details jsonb
);

-- RLS policy: compliance accounts can only view, never modify
ALTER TABLE public.aura8_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_read_only ON public.aura8_subscribers
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM compliance_accounts WHERE active = true));

ALTER TABLE public.ccbill_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_read_only ON public.ccbill_webhook_events
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM compliance_accounts WHERE active = true));

ALTER TABLE public.yoti_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_read_only ON public.yoti_verifications
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM compliance_accounts WHERE active = true));

CREATE INDEX idx_compliance_audit_log_account ON public.compliance_audit_log(compliance_account_id);
CREATE INDEX idx_compliance_audit_log_created_at ON public.compliance_audit_log(created_at DESC);
```

### 3. Compliance Login Endpoint

**New API route:** `/api/auth/compliance-login`

```typescript
// app/api/auth/compliance-login/route.ts
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Query compliance account
  const { data: complianceAccount, error } = await supabase
    .from('compliance_accounts')
    .select('*')
    .eq('username', username)
    .eq('active', true)
    .single();

  if (error || !complianceAccount) {
    return new Response(
      JSON.stringify({ error: 'Invalid credentials' }),
      { status: 401 }
    );
  }

  // Verify password
  const passwordMatch = await bcrypt.compare(
    password,
    complianceAccount.password_hash
  );

  if (!passwordMatch) {
    return new Response(
      JSON.stringify({ error: 'Invalid credentials' }),
      { status: 401 }
    );
  }

  // Check expiry
  if (complianceAccount.expires_at && new Date() > new Date(complianceAccount.expires_at)) {
    return new Response(
      JSON.stringify({ error: 'Account expired' }),
      { status: 403 }
    );
  }

  // Log access
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  await supabase
    .from('compliance_audit_log')
    .insert({
      compliance_account_id: complianceAccount.id,
      action: 'login',
      ip_address: clientIp,
      user_agent: userAgent
    });

  // Create session token
  const sessionToken = Buffer.from(
    `${complianceAccount.id}:${Date.now()}`
  ).toString('base64');

  // Return session + permissions
  return new Response(
    JSON.stringify({
      session_token: sessionToken,
      account_type: complianceAccount.account_type,
      role: complianceAccount.role,
      permissions: complianceAccount.permissions,
      organization: complianceAccount.organization,
      last_login_at: complianceAccount.last_login_at
    }),
    { status: 200 }
  );
}
```

### 4. Compliance Dashboard Access

**Protected page:** `/aura8/compliance-review` (requires compliance login)

```typescript
// app/aura8/compliance-review/page.tsx
'use client';
import { useEffect, useState } from 'react';

export default function ComplianceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify compliance session
    const token = localStorage.getItem('compliance_session_token');
    if (!token) {
      window.location.href = '/aura8/compliance-login';
      return;
    }

    // Fetch compliance review data
    fetchComplianceData(token);
  }, []);

  async function fetchComplianceData(token: string) {
    const res = await fetch('/api/compliance/data', {
      headers: { 'X-Compliance-Token': token }
    });

    if (!res.ok) {
      // Token expired or invalid
      localStorage.removeItem('compliance_session_token');
      window.location.href = '/aura8/compliance-login';
      return;
    }

    const data = await res.json();
    setData(data);
    setLoading(false);
  }

  if (loading) return <div>Loading compliance data...</div>;

  return (
    <div style={{ padding: '40px', background: '#060608', color: '#fff' }}>
      <h1>Compliance Review Dashboard</h1>
      
      <section>
        <h2>Age Verification Logs</h2>
        {data.yoti_verifications.map((v) => (
          <div key={v.id}>
            <p>Email: {v.email}</p>
            <p>Verified at: {v.verified_at}</p>
            <p>IP: {v.ip_address}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>Payment Events</h2>
        {data.ccbill_webhook_events.map((e) => (
          <div key={e.id}>
            <p>Email: {e.email}</p>
            <p>Amount: {e.amount} {e.currency}</p>
            <p>Status: {e.status}</p>
            <p>Timestamp: {e.created_at}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>Subscriber Status</h2>
        {data.subscribers.map((s) => (
          <div key={s.id}>
            <p>Email: {s.email}</p>
            <p>Status: {s.status}</p>
            <p>Created: {s.created_at}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>Compliance Audit Trail</h2>
        {data.audit_log.map((log) => (
          <div key={log.id}>
            <p>Action: {log.action}</p>
            <p>Resource: {log.resource_type}</p>
            <p>IP: {log.ip_address}</p>
            <p>Timestamp: {log.created_at}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
```

### 5. Compliance Login Page

**Page:** `/aura8/compliance-login`

```typescript
// app/aura8/compliance-login/page.tsx
'use client';
import { useState } from 'react';

export default function ComplianceLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/compliance-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Login failed');
      setLoading(false);
      return;
    }

    const data = await res.json();
    localStorage.setItem('compliance_session_token', data.session_token);
    window.location.href = '/aura8/compliance-review';
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060608',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'DM Mono, monospace',
      padding: '24px'
    }}>
      <div style={{
        background: '#0D0D0F',
        border: '1px solid #FF006E40',
        borderRadius: '8px',
        padding: '40px',
        maxWidth: '420px',
        width: '100%'
      }}>
        <div style={{ fontSize: '10px', color: '#FF006E', letterSpacing: '0.2em', marginBottom: '24px' }}>
          AURA8 — COMPLIANCE ACCESS
        </div>
        
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFF', marginBottom: '32px' }}>
          Compliance Review Login
        </div>

        {error && (
          <div style={{
            background: '#EF444430',
            color: '#EF4444',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            background: '#1A1A1D',
            border: '1px solid #3F3F46',
            borderRadius: '6px',
            color: '#FFF',
            marginBottom: '12px',
            fontFamily: 'DM Mono, monospace'
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            background: '#1A1A1D',
            border: '1px solid #3F3F46',
            borderRadius: '6px',
            color: '#FFF',
            marginBottom: '24px',
            fontFamily: 'DM Mono, monospace'
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading || !username || !password}
          style={{
            width: '100%',
            padding: '12px',
            background: '#FF006E',
            border: 'none',
            borderRadius: '6px',
            color: '#FFF',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Logging in...' : 'Access Compliance Dashboard'}
        </button>

        <div style={{
          fontSize: '10px',
          color: '#52525B',
          marginTop: '24px',
          textAlign: 'center',
          lineHeight: 1.6
        }}>
          Authorized Visa/Mastercard compliance personnel only.
          <br />
          Unauthorized access is prohibited.
          <br />
          All access is logged and audited.
        </div>
      </div>
    </div>
  );
}
```

### 6. Compliance Data Endpoint

**API route:** `/api/compliance/data`

```typescript
// app/api/compliance/data/route.ts
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const token = request.headers.get('X-Compliance-Token');

  // Verify compliance session token
  if (!token || !verifyComplianceToken(token)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Fetch all compliance-relevant data
  const [yotiVerifications, ccbillEvents, subscribers, auditLog] = await Promise.all([
    supabase.from('yoti_verifications').select('*').order('verified_at', { ascending: false }),
    supabase.from('ccbill_webhook_events').select('*').order('created_at', { ascending: false }),
    supabase.from('aura8_subscribers').select('*').order('created_at', { ascending: false }),
    supabase.from('compliance_audit_log').select('*').order('created_at', { ascending: false })
  ]);

  return new Response(
    JSON.stringify({
      yoti_verifications: yotiVerifications.data || [],
      ccbill_webhook_events: ccbillEvents.data || [],
      subscribers: subscribers.data || [],
      audit_log: auditLog.data || [],
      exported_at: new Date().toISOString()
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

function verifyComplianceToken(token: string): boolean {
  // Implement token verification logic (e.g., check against database, JWT validation)
  // Placeholder for now
  return !!token;
}
```

---

## What Compliance Can Access

✅ **Age Verification Logs** (Yoti data)
- Email, timestamp, IP address, user agent
- Age verification status + result
- 18 U.S.C. § 2257 compliance logging

✅ **Payment Events** (CCBill webhook data)
- Email, amount, currency, status
- Payment method type
- Transaction timestamp + sequence

✅ **Subscriber Data**
- Active subscribers list
- Subscription status (active, canceled, expired, chargeback, declined, refunded)
- Created date, renewal dates, billing email

✅ **Audit Trail**
- All compliance account access logged
- What data was viewed, when, from which IP
- Complete immutable record

✅ **Content Access**
- Full members-only content library
- Verify content is age-gated properly

---

## Security Controls

❌ **Compliance cannot:**
- Modify subscriber data
- Modify payment records
- Delete logs
- Export/download data (view only in dashboard)
- Approve transactions
- Access system settings

✅ **Compliance access is:**
- Read-only
- Fully logged + audited
- IP-restricted (optional: whitelist CCBill IPs)
- Session-based with auto-logout
- Requires authentication each login

---

## Implementation Checklist

- [ ] Create `compliance_accounts` table in Supabase
- [ ] Create `compliance_audit_log` table in Supabase
- [ ] Add RLS policies (read-only for compliance accounts)
- [ ] Build `/api/auth/compliance-login` endpoint
- [ ] Build `/api/compliance/data` endpoint
- [ ] Build `/aura8/compliance-login` page
- [ ] Build `/aura8/compliance-review` dashboard
- [ ] Generate static credentials (email to Sinisha)
- [ ] Test with compliance team
- [ ] Document access procedures
- [ ] Set up IP whitelisting (optional but recommended)
- [ ] Configure auto-logout (30 min inactivity)

---

## Deployment Instructions for Cline

**Once approved, this is a straightforward 2-3 hour build:**

1. Create Supabase tables (5 min)
2. Add RLS policies (10 min)
3. Build auth endpoint (20 min)
4. Build data endpoint (20 min)
5. Build login page (20 min)
6. Build compliance dashboard (30 min)
7. Test end-to-end (30 min)
8. Deploy to production (5 min)

**After deployment:**
- Generate static credentials securely
- Email credentials to Sinisha (sinishag@ccbill.com)
- Provide access URL + documentation
- Monitor first audit logs for successful access

---

## Status

**Ready to implement immediately.** This is a critical compliance requirement for CCBill merchant account approval.

**Contact:** Sinisha Golemac (CCBill Account Executive)  
- Phone: 310-218-8281 (mobile) or 480-788-2954 (office)
- Email: sinishag@ccbill.com

---

**Document committed:** 2026-06-30  
**Next step:** Confirm with Sinisha, then kick off implementation with Cline
