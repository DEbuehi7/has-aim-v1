# CROSS-SESSION MANIFEST
**Status:** Canonical Reference Document  
**Last Updated:** 2026-06-30 (UPDATED)  
**Purpose:** Single source of truth for all chat sessions working on HAS/AIM ecosystem  
**Ownership:** You (multi-session coordinator)

---

## Product Ownership Map

| Product | Phase | Status | Current Session | Other Sessions | Blockers | Notes |
|---------|-------|--------|-----------------|-----------------|----------|-------|
| **Aura8** | Phase 1 | Active Execution | ✅ This session | Dev session | CCBill merchant approval | Email gate (Yoti age verification) + CCBill live. Awaiting Sinisha. |
| **SENTINEL** | Phase 2+ | Architecture | ⏳ Needs sketch | Dev session | Property data source + Yoti API | BRRRR property valuation + HAS compliance filtering |
| **Pure** | Phase 2+ | Architecture | ⏳ Defined | Dev session | System access permissions | All-seeing eye: global/local system edits, chat interface, observation layer |
| **Anomaly** | Phase 2+ | Architecture | ⏳ Defined | Dev session | Dimension framework build | 6D analysis: underground + ground + above-ground (3D space) → time-loaded (4D) → cost-loaded (5D) → performance-loaded (6D) |
| **AIMoney** | Phase 2+ | Architecture | ⏳ Needs sketch | Dev session | Budget rules definition | Money management: spending control, audit trail, revenue protection |

---

## HAS System Definition

**HAS = Hanwa Innovation Solutions + Artificial Intelligence Multifamily (AIM) + Smiling Bubbles Inc.**

### Core Purpose
Multi-layered property intelligence system for BRRRR compliance and investment filtering.

### Compliance Criteria (TBD)
- [ ] ROI threshold minimum
- [ ] Cap rate range
- [ ] Tenant quality score
- [ ] Market stability index
- [ ] Renovation complexity
- [ ] Cash flow velocity
- [ ] Refinance timeline alignment
- [ ] Other criteria?

### Ownership
- **Hanwa Innovation Solutions:** Property sourcing + data partnerships
- **AIM (AI Multifamily):** Property scoring + predictive analytics
- **Smiling Bubbles Inc:** Operational execution + capital deployment

---

## Age Verification: Yoti Integration

**Status:** Phase 1 active

### Function
Verify user is 18+ using Yoti (UK-based digital identity platform).

### Implementation
- Replace previous Veriff integration
- Yoti session flow → age attestation + KYC logging
- 18 U.S.C. § 2257 compliant record retention
- IP address, timestamp, user agent logging

### Integration Points
- Entry: Email gate → Yoti session redirect
- Completion: Yoti callback → Supabase verification log
- Access grant: Verified users only
- Logging: Audit trail for compliance

### Supabase Schema
```sql
CREATE TABLE IF NOT EXISTS public.yoti_verifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  email text,
  yoti_session_id text unique,
  yoti_activity_id text,
  age_verified boolean,
  verified_at timestamptz,
  ip_address text,
  user_agent text,
  metadata jsonb
);

CREATE INDEX idx_yoti_verifications_email ON public.yoti_verifications(email);
CREATE INDEX idx_yoti_verifications_verified_at ON public.yoti_verifications(verified_at DESC);
```

---

## SENTINEL: BRRRR Property Valuation Machine

**Status:** Architecture phase, parked for Phase 2+

### Function
Ingest BRRRR property listings → Apply HAS compliance filters → Output investment recommendation + property valuation

### Input
- Property address
- List price
- Unit count
- Tenant composition
- NOI / Cap rate
- Renovation scope estimate
- Market data

### Processing
1. **HAS Compliance Check** — Does property meet minimum criteria?
2. **BRRRR Valuation** — Buy, Renovate, Rent, Refinance, Repeat cash flow model
3. **Risk Score** — Market, tenant, renovation risk
4. **Revenue Projection** — 5-year BRRRR cash flow model
5. **Recommendation** — Buy / Analyze Further / Pass

### Output
```json
{
  "property_id": "uuid",
  "address": "123 Main St",
  "list_price": 450000,
  "has_compliant": true,
  "brrrr_valuation": 580000,
  "compliance_score": 0.87,
  "risk_score": 0.34,
  "projected_5yr_cashflow": 125000,
  "recommendation": "BUY",
  "decision_confidence": 0.92,
  "next_steps": ["Schedule inspection", "Get contractor quote"]
}
```

### Dependencies
- Property data source (API or feed)
- HAS compliance criteria (final definition needed)
- Market data provider (Zillow, CoStar, etc.)
- Revenue model parameters + Aura8 cash flow metrics
- Yoti integration (for user verification, if needed)

---

## Pure: All-Seeing Eye (Observation & System Control Layer)

**Status:** Architecture phase, parked for Phase 2+

### Function
Central observation + control interface for HAS/AIM ecosystem.

### Capabilities
1. **Global system edits:** Modify rules, budgets, thresholds across all products
2. **Local edits:** Granular control (individual property, user, transaction, etc.)
3. **Chat interface:** Conversational system interaction (query properties, approvals, alerts)
4. **Real-time observation:** Dashboard showing all system state (Aura8, SENTINEL, Anomaly, AIMoney)
5. **Decision layer:** You + Pure together make strategic calls on conflicts/exceptions

### What Pure Observes
- **Aura8:** User signups, payments, subscriber status
- **SENTINEL:** Property analysis queue, valuations, recommendations
- **Anomaly:** Multi-dimensional analysis results
- **AIMoney:** Spending, budget status, approval queue

### What Pure Controls
- System rules (spending caps, property thresholds, approval workflows)
- User access (subscriber tiers, permissions)
- Data retention (anonymization policies, vault settings)
- Alert thresholds (when to escalate to you)

### Chat Interface Example
```
You: "Show me all properties under $500K with cap rate >6% in Phoenix market"
Pure: [Displays filtered list from SENTINEL analysis]

You: "Increase acquisition budget to $20K/day"
Pure: Updates AIMoney rules, logs change, confirms

You: "What's anomaly telling us about Q3 trends?"
Pure: [Fetches Anomaly 6D analysis, synthesizes insights]

You: "Approve this $12K contractor invoice"
Pure: [Processes through AIMoney approval workflow, logs to audit trail]
```

### Integration Points
- **Input:** You (via chat or dashboard)
- **Processing:** Query engine + LLM agent (Claude/GPT-4)
- **Output:** Results, confirmations, alerts
- **Storage:** Supabase (all system state)

### Ownership
- **You:** All observation + control authority
- **Pure:** Execution + logging layer
- **No delegation:** You remain sole decision authority

---

## Anomaly: 6-Dimensional Analysis Engine

**Status:** Architecture phase, parked for Phase 2+

### Function
Multi-dimensional analysis across space, time, cost, and performance to identify patterns, risks, and optimization opportunities.

### The 6 Dimensions

**Dimension 1–3: Space (XYZ)**
- **Underground:** Below-market properties, off-market deals, distressed assets
- **Ground:** Current-market, standard offerings (MLS listings)
- **Above-ground:** Premium properties, new construction, value-add opportunities

**Dimension 4: Time**
- Historical trends (past 5 years)
- Current state (today's market)
- Projected forecasts (next 3–5 years)
- Seasonal patterns
- Refinance cycle timing

**Dimension 5: Cost**
- Acquisition price
- Renovation cost
- Carrying cost (interest, taxes, insurance)
- Cost per unit
- Cost per dollar of revenue

**Dimension 6: Performance**
- Cash-on-cash return
- Cap rate
- IRR (internal rate of return)
- Debt service coverage ratio (DSCR)
- Tenant quality score
- Market rent growth potential

### Analysis Output
```json
{
  "analysis_id": "uuid",
  "timestamp": "2026-06-30T10:00:00Z",
  
  "space_analysis": {
    "market_tier": "ground",
    "opportunity_type": "value-add",
    "competitive_position": "strong"
  },
  
  "time_analysis": {
    "market_cycle": "seller's_market_declining",
    "refinance_window": "2027-2028",
    "rental_growth_trend": 0.03
  },
  
  "cost_analysis": {
    "total_investment": 450000,
    "cost_per_unit": 18750,
    "cost_per_rental_dollar": 1.2
  },
  
  "performance_analysis": {
    "projected_coc": 0.24,
    "projected_cap_rate": 0.067,
    "projected_irr": 0.18,
    "dscr": 1.45
  },
  
  "synthetic_insight": "Strong value-add in declining seller's market. Refinance window opens 2027 with projected 18% IRR. Cost structure favorable relative to rental comps.",
  
  "risk_flags": ["Market downturn risk", "Tenant quality concentration"],
  "opportunities": ["Aggressive refinance in 24 months", "Rental rate growth above market"]
}
```

### Integration Points
- **Data source:** SENTINEL valuations, market data, historical performance
- **Processing:** Multi-dimensional correlation engine (ML or rules-based)
- **Output:** Insights dashboards, anomaly alerts, trend forecasts
- **Storage:** Supabase `anomaly_analysis` table

### Use Cases
1. **Portfolio optimization:** Which properties to hold vs. sell?
2. **Market timing:** When to refinance? When to acquire?
3. **Risk detection:** Which deals have hidden downsides?
4. **Trend forecasting:** What's the market doing in 12 months?
5. **Anomaly flagging:** Which property doesn't fit expected pattern?

---

## AIMoney: Money Management System

**Status:** Architecture phase, parked for Phase 2+

### Function
Comprehensive financial control system protecting exponential revenue from erosion through intelligent spending rules, audit trails, and approval workflows.

### Core Principle
You (solo operator) maintain absolute control over all spending.

- No automatic spending triggers (except pre-approved categories)
- Every transaction requires approval or auto-approval tier
- Full audit trail: reason, approval, timestamp, immutable log
- Daily P&L visibility
- Budget enforcement (hard caps, soft alerts, velocity checks)

### Budget Rule Framework

#### Transaction Tiers
- **<$1,000:** Auto-approve, logged
- **$1,000–$10,000:** You confirm, logged with reason
- **>$10,000:** You confirm + business case, logged
- **>50% daily revenue:** Manual approval required

#### Daily Spend Caps (Hard Limits)
- **Operations:** $10,000/day
- **Acquisition:** $15,000/day
- **Payroll:** Fixed monthly / 30
- **Taxes:** Fixed quarterly / 90
- **Debt service:** Fixed monthly

#### Velocity Checks (Fraud Prevention)
- Single transaction >50% daily revenue → Alert + confirm
- Daily spend >200% baseline → Alert + confirm
- Category spend >150% plan → Alert + review

### Daily Dashboard
- Revenue in (Aura8 + other sources)
- Spend by category (operations, acquisition, payroll, taxes, debt, equipment)
- Budget utilization (% of cap remaining)
- Velocity status (OK / FLAGGED / ALERT)
- Pending approvals queue

### Monthly Audit Report
- Total revenue / spend / net
- Category breakdown + variance from plan
- Approval statistics (auto, manual, denied)
- High-value transaction log (>$10K)
- Compliance status (all hard limits honored)
- Recommendations (increase acquisition? Consolidate tools?)

### Supabase Schema
```sql
CREATE TABLE public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  date timestamptz,
  vendor text,
  category text,
  amount numeric,
  daily_revenue numeric,
  status text,
  approved_by text,
  approved_at timestamptz,
  approval_reason text,
  immutable boolean default true,
  encrypted boolean default true
);

CREATE TABLE public.budget_rules (
  id uuid primary key default gen_random_uuid(),
  category text unique,
  hard_cap_daily numeric,
  soft_alert_daily numeric,
  monthly_plan numeric,
  auto_approve_under numeric,
  active boolean default true
);

CREATE TABLE public.daily_cash_summary (
  id uuid primary key default gen_random_uuid(),
  date date unique,
  total_revenue numeric,
  total_spend numeric,
  net numeric
);
```

### Integration Points
- **Input:** Plaid (bank API), CCBill, payment processors, manual entry
- **Processing:** n8n workflow (categorize, validate, route approval)
- **Output:** Dashboard, email summaries, Slack alerts, audit reports
- **Storage:** Supabase (immutable, encrypted audit log)

---

## Cross-Session Communication Protocol

### When Session A makes changes:
1. Update relevant section in this manifest
2. Create a **MANIFEST SYNC** comment at the top of the PR/commit message
3. Link to the changed section

### When Session B reads from this manifest:
1. Check the section last updated timestamp
2. If newer than your session start, review changes
3. Incorporate into your work
4. Update timestamp after confirming integration

---

## Activation Triggers for Phase 2

Phase 2+ work begins **only when**:

1. **Aura8 has predictable recurring revenue** (e.g., 50+ active subscribers, >$1000/mo MRR)
2. **n8n workflows are stable** (low failure rate, no recurring manual fixes)
3. **Operational patterns are clear** (can now design better automation)
4. **Capital is available** (Aura8 revenue covers Phase 2 dev costs)

Until all four conditions are met, Phase 1 remains the sole focus.

---

## Ownership & Decision Rights

- **Phase 1 (Aura8 execution):** You (product/ops owner)
- **Phase 2+ strategic direction:** This doc (canonical, locked)
- **Phase 2+ activation decision:** You + revenue confirmation
- **Phase 2+ engineering:** Cline (when activated)

---

## References

- `docs/ARCHITECTURE-PHASE-2.md` — Phase 2+ strategy
- `docs/SENTINEL-PROPERTY-INTELLIGENCE.md` — Property valuation machine
- `docs/AIMONEY-BUDGET-CONTROLS.md` — Money management system
- `.env.example` — Phase 1 config (Yoti API keys, CCBILL_WEBHOOK_SECRET, ADMIN_DEBUG_SECRET, etc.)

---

**Last validated:** 2026-06-30  
**Owner:** You (canonical)  
**Next review:** After CCBill merchant approval + first revenue confirmation
