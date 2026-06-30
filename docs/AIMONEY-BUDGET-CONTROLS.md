# AIMoney: Budget Security System
**Status:** Architecture design (Phase 2+, revenue-gated)  
**Purpose:** Enforce spending rules on exponential revenue machine. Protect against spend erosion. Single-user control (you).  
**Ownership:** Smiling Bubbles Inc. (Operational Finance)

---

## Executive Summary

AIMoney is a **budget security + spend enforcement system** that:
1. Locks spending rules on Aura8 (and future) revenue streams
2. Protects against exponential revenue erosion (spending outpacing income growth)
3. Maintains full audit trail of all transactions
4. Gives you absolute control + approval authority
5. Provides daily cash P&L visibility

---

## Core Principle

You are the **sole decision authority** for all spending.

- No team members have independent spend approval
- No automatic spending triggers (except pre-approved categories)
- Every transaction logs reason, approval timestamp, and you
- Budget rules are yours to set and adjust

---

## Budget Rule Framework

### Transaction-Level Controls

#### Spending Tiers (with approval requirement)
```
Amount             Approval            Processing Time    Logging
<$1,000            Auto-approve        Immediate          Standard log
$1,000–$10,000     You confirm         5 min wait         Standard log + reason
>$10,000           You confirm + wait  Manual review      Extended log + business case
>50% daily revenue Manual approval     1-hour window      Flagged + alert
```

#### Daily Spend Caps (Hard Limits)
```
Category              Hard Cap    Soft Alert    Rollover Period
Operations            $10,000     $8,000        7-day average
Acquisition           $15,000     $12,000       7-day average
Payroll               [Fixed]     [Fixed]       Monthly
Taxes                 [Fixed]     [Fixed]       Quarterly
Debt service          [Fixed]     [Fixed]       Monthly
Emergency reserve     Unlimited   [None]        [None]
```

#### Velocity Checks (Fraud Prevention)
```
Check                              Trigger                Approval
Single transaction >50% daily rev  Automatic              You must confirm
Daily spend >200% baseline         Automatic              You must confirm
Category spend >150% plan          Automatic              You must review
Weekly spend >110% weekly avg      Alert only             You decide
```

### Category-Level Controls

#### Protected Categories (Cannot exceed plan)
- **Payroll:** Cannot spend more than budgeted monthly amount
- **Taxes:** Cannot spend more than quarterly reserve
- **Debt service:** Cannot skip or reduce scheduled payments
- **Loan covenants:** Cannot violate lender requirements

#### Discretionary Categories (Can adjust, must log)
- **Acquisition:** Ads, affiliate payouts, marketing
- **Operations:** Tools, infrastructure, contractors
- **Equipment:** Purchases ≤ $2K auto-approved, >$2K requires you

#### Blocked Categories (None)
- You can spend on anything
- No categories are permanently blocked
- Budget rules are yours to override (with audit trail)

---

## Daily Operations

### Morning Ritual (Your Dashboard)

**AIMoney shows you:**
```
═════════════════════════════════════════════════════════
                  TODAY'S CASH SUMMARY
═════════════════════════════════════════════════════════

Revenue in (Aura8):          +$3,452
Acquisition spend:           -$2,100
Operations spend:            -$890
Payroll (scheduled):         -$4,200
Taxes (reserve):             -$0
Debt service:                -$0
Emergency reserve:           +$0
                             ──────
NET TODAY:                   -$3,738

7-Day Average Daily Net:     +$1,245
This week cumulative:        +$8,715
Monthly so far:              +$28,450

Budget Status:
  ✅ Acquisition: $12,000 used of $15,000 cap (80%)
  ✅ Operations: $4,200 used of $10,000 cap (42%)
  ✅ Payroll: $12,600 used of $12,600 (100% — on schedule)
  ⚠️  Velocity: Daily spend $3.7K vs avg $4.1K (normal)

Pending approvals: 2
  1. Contractor invoice: $8,500 (awaiting you)
  2. Ad spend increase: $500 daily (awaiting you)
═════════════════════════════════════════════════════════
```

### Transaction Processing

**When a payment request arrives:**

```
Example: Software tool renewal, $4,200/month

1. System checks:
   ├─ Amount: $4,200 (within $1K–$10K tier)
   ├─ Category: Operations (cap $10,000/day)
   ├─ Daily velocity: Current day spend $2,100 + $4,200 = $6,300 (within limit)
   ├─ Weekly average: OK
   └─ Previous approvals: Already approved (same vendor)

2. System routes to you:
   Subject: "Approve: $4,200 Software Renewal — Operations"
   Body: Vendor, amount, category, why, last approval date
   Action: [APPROVE] [DENY] [HOLD 24 HRS]

3. You approve (or deny):
   → Transaction processes immediately
   → Logged: timestamp, amount, approval reason, you, approval method

4. Audit trail created:
   ├─ Transaction ID: t_xxx
   ├─ Approved by: you
   ├─ Approved at: 2026-06-30T09:45:00Z
   ├─ Approval method: Email / Dashboard / SMS
   ├─ Reason (optional): "Quarterly renewal, already budgeted"
   └─ Vault: Encrypted, immutable log
```

---

## Audit Trail & Compliance

### Every Transaction Logs

```json
{
  "transaction_id": "t_20260630_001",
  "date": "2026-06-30",
  "vendor": "HubSpot",
  "category": "operations",
  "amount": 4200.00,
  "currency": "USD",
  
  "context": {
    "daily_revenue": 15000.00,
    "daily_total_spend": 6300.00,
    "budget_cap": 10000.00,
    "budget_remaining": 3700.00,
    "weekly_average_spend": 4100.00,
    "velocity_check": "OK"
  },
  
  "approval": {
    "status": "approved",
    "approved_by": "you",
    "approved_at": "2026-06-30T09:45:00Z",
    "approval_method": "email_link",
    "approval_reason": "Quarterly renewal, already budgeted"
  },
  
  "processing": {
    "payment_method": "bank_transfer",
    "processing_at": "2026-06-30T10:00:00Z",
    "status": "completed"
  },
  
  "audit": {
    "created_at": "2026-06-30T09:30:00Z",
    "immutable": true,
    "encrypted": true
  }
}
```

### Monthly Audit Report

**Generated automatically, sent to you:**
```
═════════════════════════════════════════════════════════
           AIMONEY MONTHLY AUDIT — JUNE 2026
═════════════════════════════════════════════════════════

Total Revenue In:              $450,000 (Aura8 + other)
Total Spend:                   -$125,000
Net:                           +$325,000

Breakdown by Category:
  Acquisition:                 $45,000 (36% of budget)
  Operations:                  $52,000 (73% of budget)
  Payroll:                     $42,000 (100% of budget)
  Taxes:                       $18,000 (reserve)
  Debt service:                $10,000 (scheduled)
  Equipment:                   $3,200 (2% of budget)

Approval Statistics:
  Total transactions: 347
  Auto-approved (<$1K): 298 (86%)
  Manual approved by you: 45 (13%)
  Denied: 4 (1%)
  Average approval time: 8 minutes

Velocity Alerts:
  Single transaction >50% daily rev: 0
  Daily spend >200% baseline: 0
  Category overruns: 1 (Acquisition, flagged, reviewed, approved)

Compliance:
  ✅ No hard limit violations
  ✅ All protected categories on schedule
  ✅ No missing approvals
  ✅ All transactions audited

High-value approvals (>$10K):
  1. Equipment: $18,500 (approved 2026-06-15)
  2. Contractor: $12,000 (approved 2026-06-22)
  3. Ad spend increase: $11,200 (approved 2026-06-28)

Recommendations:
  → Acquisition spending on trend (36% utilized). Consider increasing if ROI >20%.
  → Operations at 73% — monitor tooling costs, potential to consolidate.
  → Payroll stable. On track for planned hires in Q3.

═════════════════════════════════════════════════════════
```

---

## Integration Architecture

### Input Sources
```
Bank API (Plaid)     → Real-time transactions
  ├─ Chase
  ├─ Mercury
  └─ Other accounts

Payment Processors
  ├─ Stripe (if future e-commerce)
  ├─ PayPal
  └─ Manual invoices

Aura8 Revenue        → Subscription + affiliate payouts
  ├─ CCBill payments
  └─ Affiliate commissions
```

### Processing Engine (n8n)
```
Incoming transaction
  │
  ├─ Categorize (merchant name, description)
  ├─ Check budget rules
  ├─ Calculate velocity
  ├─ Route to approval (auto / you / hold)
  │
  ├─ IF auto-approve: Process + Log
  ├─ IF you-approve: Wait for your action + Log
  └─ IF hold: Pause until manual review

Log all steps → Supabase (immutable)
```

### Output Channels
```
You receive:
  ├─ Email summaries (daily, weekly, monthly)
  ├─ Dashboard (real-time)
  ├─ Slack alerts (high-value or policy violations)
  └─ SMS alerts (emergency flags: >100% daily revenue spend)

Accounting export:
  ├─ CSV for tax prep
  ├─ JSON for accounting software
  └─ Audit-ready report
```

### Storage (Supabase)

```sql
-- Financial transactions table
CREATE TABLE public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  
  -- Transaction details
  date timestamptz,
  vendor text,
  category text, -- operations|acquisition|payroll|taxes|debt|equipment|other
  amount numeric,
  currency text default 'USD',
  description text,
  
  -- Context
  daily_revenue numeric,
  daily_total_spend numeric,
  budget_cap numeric,
  velocity_check text, -- OK|FLAGGED|ALERT
  
  -- Approval
  status text, -- pending|approved|denied|on_hold
  approved_by text, -- 'you' (always)
  approved_at timestamptz,
  approval_method text, -- email|dashboard|api
  approval_reason text,
  
  -- Processing
  payment_method text,
  processing_at timestamptz,
  processing_status text, -- pending|completed|failed
  
  -- Audit
  immutable boolean default true,
  encrypted boolean default true
);

-- Budget rules table
CREATE TABLE public.budget_rules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  
  -- Rule definition
  category text unique,
  hard_cap_daily numeric,
  soft_alert_daily numeric,
  monthly_plan numeric,
  
  -- Policy
  auto_approve_under numeric, -- Transactions <this amount auto-approve
  requires_approval_over numeric,
  requires_reason_over numeric,
  
  -- Status
  active boolean default true,
  last_updated timestamptz,
  updated_by text -- 'you'
);

-- Daily summary table
CREATE TABLE public.daily_cash_summary (
  id uuid primary key default gen_random_uuid(),
  date date unique,
  
  -- Flow
  total_revenue numeric,
  total_spend numeric,
  net numeric,
  
  -- Category breakdown
  acquisition_spend numeric,
  operations_spend numeric,
  payroll_spend numeric,
  
  -- Metrics
  daily_velocity_pct numeric,
  budget_utilization_pct numeric,
  alerts_count integer,
  approvals_pending integer
);

CREATE INDEX idx_transactions_date ON financial_transactions(date DESC);
CREATE INDEX idx_transactions_category ON financial_transactions(category);
CREATE INDEX idx_transactions_approved_by ON financial_transactions(approved_by);
```

---

## Phase 2 MVP Scope

**When to launch:** After Aura8 has predictable monthly revenue + you want spend control

**MVP includes:**
1. Bank API (Plaid) connector
2. Basic transaction categorization (rules engine)
3. Budget caps + velocity checks
4. Approval workflow (email/dashboard)
5. Daily dashboard
6. Monthly audit report

**Not included in MVP:**
- Advanced forecasting (Phase 3+)
- Automated rebalancing (Phase 3+)
- Multi-business support (Phase 3+)
- Tax integration (Phase 3+)

---

## Configuration (Your Customization)

**You decide:**
```
Daily hard caps by category:
  Acquisition:     $15,000
  Operations:      $10,000
  Payroll:         $[Monthly / 30]
  Taxes:           $[Quarterly / 90]
  Equipment:       $2,000

Auto-approve under: $1,000
Manual approve tier: $1,000–$10,000
High-approval tier: >$10,000

Velocity alert: >50% daily revenue in single transaction
Velocity alert: >200% 7-day average spend

Approval timeout: 1 hour (auto-escalate to hold)
Notification: Email + Slack + SMS (emergency only)
```

---

## Security & Control

### Access Control
- **Only you** can approve transactions
- **No delegation** (even if you hire accounting team, they can't approve)
- **API keys** are isolated and scoped to read-only for accounting
- **Audit trail** is encrypted and immutable (cannot be retroactively edited)

### Failure Modes
```
What if I don't approve a transaction?
  → Enters 24-hour hold, then escalates to you
  → Can be manually released or denied
  → All actions logged with timestamps

What if Plaid API fails?
  → Manual transaction entry form (backup)
  → Fallback to email receipts + weekly reconciliation
  → Alert sent to you immediately

What if I lose access to email/dashboard?
  → SMS backup approval method
  → Phone verification required
  → Emergency access protocol
```

---

## Success Metrics

- [ ] 100% transaction audit trail (zero missing logs)
- [ ] Average approval time <10 minutes
- [ ] Zero unauthorized spend (all transactions approved by you)
- [ ] Monthly reconciliation accuracy >99.9%
- [ ] Spending discipline: actual spend within plan ±10%

---

## References

- `docs/CROSS-SESSION-MANIFEST.md` — Product ownership + blockers
- `docs/ARCHITECTURE-PHASE-2.md` — Phase 2+ strategy
- Aura8 revenue dashboard (input source)

---

**Status:** Architecture (ready for implementation after Aura8 revenue confirms)  
**Next step:** Finalize spending categories + budget caps with you
