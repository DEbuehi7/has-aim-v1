# AIM OS · HAS Sentinel

**AIM OS** (AI Media Operating System) is a multi-product platform built by [Smiling Bubbles Inc.](https://aim2030app.com) for real estate intelligence, AI companion experiences, and media operations. This Next.js monorepo hosts several sub-products under one roof:

| Sub-product | Route | Description |
|---|---|---|
| **HAS Sentinel** | `/dashboard` | Housing Autonomy System — distress-scored LA property leads with skip-trace, call, and deal pipeline |
| **Pure** | `/pure` | AI chat assistant with live access to HAS Sentinel data |
| **Aura8** | `/aura8` | AI companion platform (18+, age-verified via Veriff) |
| **AIMedia Pulse** | `/pulse` | Planetary content engine for AI-generated media |
| **Deals** | `/deals` | Deal pipeline tracker (LOI → Contract → Close) |
| **Contacts** | `/contacts` | Owner/tenant contact management with BatchData enrichment |

---

## Getting Started

### 1. Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10
- A **Supabase** project (PostgreSQL database)
- API keys for the external services listed below

### 2. Clone & install

```bash
git clone https://github.com/DEbuehi7/has-aim-v1.git
cd has-aim-v1
npm install
```

### 3. Configure environment variables

Copy the template below into a new file called `.env.local` in the project root and fill in your values. **This file is git-ignored — never commit secrets.**

```bash
# .env.local

# ── Supabase ──────────────────────────────────────────────────
# Found in: Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>   # server-side only

# ── PostgreSQL (Drizzle ORM migrations) ───────────────────────
# Found in: Supabase Dashboard → Project Settings → Database → Connection string
DATABASE_URL=postgresql://postgres:<password>@db.<your-project>.supabase.co:5432/postgres

# ── Anthropic (Claude AI) ─────────────────────────────────────
# https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-...

# ── BatchData (skip-trace & property data) ────────────────────
# https://app.batchdata.com → API Keys
BATCHDATA_API_TOKEN=<your-token>

# ── RentCast (rental comps) ───────────────────────────────────
# https://app.rentcast.io/app/api-access
RENTCAST_API_KEY=<your-key>

# ── Veriff (age / identity verification — Aura8 only) ─────────
# https://station.veriff.com → Integrations
VERIFF_API_KEY=<your-api-key>
VERIFF_API_SECRET=<your-shared-secret>

# ── Twilio (SMS outreach) ─────────────────────────────────────
# https://console.twilio.com → Account Info
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=<your-auth-token>
TWILIO_PHONE_NUMBER=+1...
```

> **Minimum to run locally:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `ANTHROPIC_API_KEY`. The dashboard and Pure chat will work; skip-trace and SMS features require their respective keys.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/dashboard` (HAS Sentinel).

---

## Project Structure

```
has-aim-v1/
├── app/
│   ├── api/                  # Next.js Route Handlers (API endpoints)
│   │   ├── alerts/           # Anomaly alert feed
│   │   ├── aura8/            # Aura8: companion chat, age-verify, Veriff webhooks
│   │   ├── batchdata/        # BatchData skip-trace enrichment
│   │   ├── contacts/         # Contact CRUD
│   │   ├── deals/            # Deal pipeline CRUD
│   │   ├── has/              # HAS core: property search, skip-trace, RentCast, reports
│   │   ├── pulse/            # AIMedia Pulse planetary engine
│   │   ├── pure/             # Pure AI: property listings + health check
│   │   ├── pure-chat/        # Pure AI chat (Claude + live Supabase context)
│   │   ├── skip-trace/       # MCP-powered skip-trace via BatchData + Claude
│   │   └── sms-webhook/      # Twilio inbound SMS handler
│   ├── components/
│   │   ├── Nav.tsx           # Global navigation bar
│   │   └── PureChat.tsx      # Floating Pure AI chat widget
│   ├── dashboard/            # HAS Sentinel lead dashboard
│   ├── aura8/                # Aura8 companion app (landing, demo, legal pages)
│   ├── contacts/             # Contacts list + detail view
│   ├── deals/                # Deal pipeline view
│   ├── pulse/                # AIMedia Pulse UI
│   └── pure/                 # Pure AI property search UI
├── src/db/
│   ├── schema.ts             # Drizzle ORM table definitions (all products)
│   └── index.ts              # Drizzle client (postgres.js)
├── drizzle/                  # Auto-generated SQL migration files
├── scripts/
│   ├── ladbs-scraper.js      # LADBS permit/violation scraper
│   ├── rescore-leads.js      # Re-runs DSA v2 scoring on all properties
│   └── sms-outreach.js       # Bulk SMS outreach via Twilio
├── lib/
│   └── pure-filter.ts        # Pure AI property filtering logic
├── drizzle.config.ts         # Drizzle Kit config (points to src/db/schema.ts)
└── next.config.ts            # Next.js config (host-based redirects for aura8.fun)
```

---

## Database & Migrations

This project uses **Drizzle ORM** with a Supabase (PostgreSQL) backend. The schema lives in `src/db/schema.ts` and is organized by product prefix:

| Prefix | Tables | Description |
|---|---|---|
| `has_` | `properties`, `owners`, `units`, `tenants`, `deals`, `contacts`, `maintenance`, `compliance_log` | Housing Autonomy System |
| `aimedia_` | `planets`, `characters`, `motion_jobs`, `render_jobs` | AIMedia Pulse engine |
| `aura8_` | `nodes`, `subscriptions`, `lifetime_commissions` | Aura8 content & billing |
| `aim_` | `verticals`, `queries`, `scraper_leads` | AIM OS intelligence layer |

### Run migrations

```bash
# Generate a new migration after editing src/db/schema.ts
npx drizzle-kit generate

# Push schema changes directly to the database (dev only)
npx drizzle-kit push

# Open Drizzle Studio (visual DB browser)
npx drizzle-kit studio
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `node scripts/ladbs-scraper.js` | Scrape LADBS for permit/violation data |
| `node scripts/rescore-leads.js` | Re-score all properties with DSA v2 algorithm |
| `node scripts/sms-outreach.js` | Send bulk SMS outreach via Twilio |

---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (App Router) with TypeScript
- **Database:** [Supabase](https://supabase.com) (PostgreSQL) + [Drizzle ORM](https://orm.drizzle.team)
- **AI:** [Anthropic Claude](https://anthropic.com) via `@ai-sdk/anthropic` and `@anthropic-ai/sdk`
- **Styling:** [Tailwind CSS](https://tailwindcss.com) v4 (inline styles used in dashboard)
- **SMS:** [Twilio](https://twilio.com)
- **Identity Verification:** [Veriff](https://veriff.com)
- **Property Data:** [BatchData](https://batchdata.com) · [RentCast](https://rentcast.io)
- **Deployment:** [Vercel](https://vercel.com) (recommended)

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/DEbuehi7/has-aim-v1)

Add all environment variables from the `.env.local` template above in your Vercel project settings before deploying. Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
