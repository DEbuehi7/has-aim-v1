# Railway Deployment Guide — Aura8 / has-aim-v1

**Goal:** Migrate from Vercel to Railway and get the Aura8 Compliance Portal live for CCBill review.

---

## Prerequisites

- [Railway CLI](https://docs.railway.app/develop/cli) installed (`npm install -g @railway/cli`)
- GitHub repository access to `DEbuehi7/has-aim-v1`
- Railway account at [railway.app](https://railway.app)
- All environment variables from your Vercel project (see Step 1)

---

## Step 1 — Export Vercel Environment Variables

Open the Vercel dashboard for the project and copy the following variables.  
You can also use the Vercel CLI:

```bash
# Install Vercel CLI if you haven't already
npm install -g vercel

# Pull env vars to a local file (do NOT commit this file)
vercel env pull .env.vercel
```

Variables you need:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel project → Settings → Environment Variables |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel project → Settings → Environment Variables |
| `DATABASE_URL` | Vercel project → Settings → Environment Variables |
| `CCBILL_WEBHOOK_SECRET` | Vercel project → Settings → Environment Variables |
| `COMPLIANCE_SESSION_SECRET` | Vercel project → Settings → Environment Variables |
| `COMPLIANCE_SESSION_DURATION_MINUTES` | Vercel project → Settings → Environment Variables |
| `ADMIN_DEBUG_SECRET` | Vercel project → Settings → Environment Variables |
| `NEXT_PUBLIC_SITE_URL` | Vercel project → Settings → Environment Variables |
| `SENDGRID_API_KEY` | Vercel project → Settings → Environment Variables |

See `.env.example` for the complete list.

---

## Step 2 — Create a Railway Project

### Option A — Railway Dashboard (recommended for first deploy)

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Authorise Railway to access `DEbuehi7/has-aim-v1`
4. Select the `main` branch

Railway will auto-detect Next.js via Nixpacks and start building.

### Option B — Railway CLI

```bash
# Log in
railway login

# Create a new project and link it to this repo
railway init

# Deploy from the current directory
railway up
```

---

## Step 3 — Set Environment Variables in Railway

After creating the project, add every variable from Step 1:

### Via Dashboard

1. Open your Railway project
2. Click the **"Variables"** tab
3. Click **"Add Variable"** for each one  
   — or click **"RAW Editor"** and paste all variables at once.

### Via CLI

```bash
railway variables set NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_key_here
railway variables set CCBILL_WEBHOOK_SECRET=your_secret
railway variables set COMPLIANCE_SESSION_SECRET=your_64_char_hex
railway variables set COMPLIANCE_SESSION_DURATION_MINUTES=30
railway variables set ADMIN_DEBUG_SECRET=your_admin_secret
railway variables set NEXT_PUBLIC_SITE_URL=https://aura8.fun
# … repeat for remaining variables
```

> **Important:** After setting all variables, Railway will automatically trigger a new deployment.

---

## Step 4 — Configure Supabase Connection Pooling

Railway runs on a single region. To avoid Supabase direct-connection limits, use **PgBouncer** (the Supabase connection pooler):

1. Open your Supabase project → **Settings → Database**
2. Scroll to **"Connection Pooling"**
3. Copy the **Transaction Mode** connection string (port `6543`)
4. Set it as `DATABASE_URL` in Railway:

```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

> **Note:** Append `?pgbouncer=true` if your Postgres client requires it.

---

## Step 5 — Configure Custom Domain (optional)

To point `aura8.fun` to Railway:

1. In Railway: Project → **Settings → Domains**
2. Click **"Add Custom Domain"**
3. Enter `aura8.fun` (and `www.aura8.fun`)
4. Railway will show DNS records — add them to your domain registrar
5. Wait for SSL to provision (usually < 5 minutes)

Until the domain propagates, use the Railway-provided URL (e.g. `has-aim-v1-production.up.railway.app`).

---

## Step 6 — Verify the Deployment

```bash
# Health check
curl https://<your-railway-url>/api/health
# Expected: {"status":"ok"}

# Root page
curl -I https://<your-railway-url>/
# Expected: HTTP/2 200

# Compliance login page
curl -I https://<your-railway-url>/aura8/compliance-login
# Expected: HTTP/2 200
```

See `VERIFICATION_CHECKLIST.md` for the full smoke-test list.

---

## Step 7 — Run the Supabase Migration (if not already done)

```sql
-- Run in Supabase SQL Editor
-- See: scripts/create-compliance-static-login.sql

-- Verify tables exist:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('compliance_accounts', 'compliance_audit_log');
```

---

## Step 8 — Create the CCBill Compliance Account

Generate a bcrypt hash for the auditor password:

```bash
node -e "
const bcrypt = require('bcryptjs');
const password = 'REPLACE_WITH_STRONG_PASSWORD';
bcrypt.hash(password, 10, (err, hash) => {
  console.log('Password:', password);
  console.log('Hash:', hash);
});
"
```

Then insert the account in Supabase SQL Editor:

```sql
INSERT INTO public.compliance_accounts (
  email, username, password_hash,
  account_type, role, organization, permissions, active
) VALUES (
  'compliance@ccbill.com',
  'ccbill_compliance_auditor',
  '$2a$10$[PASTE_YOUR_HASH_HERE]',
  'compliance_auditor',
  'read_only_auditor',
  'CCBill',
  '["view_all_content","view_subscriber_data","view_payment_logs","view_age_verification_logs","view_admin_debug_page","view_audit_trail"]'::jsonb,
  true
);
```

---

## Step 9 — Rollback Plan

If the Railway deployment fails, the previous Vercel deployment remains untouched.

To roll back on Railway:

```bash
# Via CLI — redeploy a previous deployment
railway deployments list
railway deployments rollback <deployment-id>
```

Or in the Railway dashboard: **Deployments → select an earlier build → Redeploy**.

---

## Versioning Strategy

| Tag | Meaning |
|---|---|
| `v0.x.x` | MVP — compliance login + CCBill webhook live |
| `v1.x.x` | Yoti age-gate integration |
| `v2.x.x` | Full aggregator + autonomous compliance |

```bash
# Tag and push a release
git tag v0.1.0 -m "v0.1.0: Railway launch + compliance login"
git push origin v0.1.0
```

---

## Useful Railway CLI Commands

```bash
railway status          # View current deployment status
railway logs            # Stream live logs
railway open            # Open the app in your browser
railway variables       # List all environment variables
railway shell           # Open a shell in the deployed container
```
