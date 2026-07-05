# TRIFECTA CONVERSION MAP — Zero-Waste Migration
## Existing HAS Architecture → Aura8 + BRRRR + AIMature

**Author:** SENTINEL (architecture/governance)  
**Verdict up front:** Nothing gets thrown away. Every module you named already
does a job the trifecta needs — this is a re-scope (extend the schema, widen
the role), not a rebuild. The one thing that needs correction before Cline
builds toward it is a scale mismatch in the roadmap numbers (§1).

---

## 1. ONE CORRECTION BEFORE ANYTHING ELSE

Your Phase 1/2 BRRRR targets are well-grounded:
- "First 4-plex + ADU → $8K/mo NOI" is close to the actual pro forma
  ($61,503/yr = ~$5,125/mo NOI on the fourplex we modeled — a fully-ADU'd,
  slightly stronger deal gets you near $8K). **This number is real. Keep it.**
- "3-5 properties → $50K/mo NOI" is plausible *if* those are larger
  commercial-scale assets (NOI is pre-debt-service, so this isn't as
  aggressive as it first looks).

**But "Phase 3 (2028+): 300+ properties, $200M+ portfolio" does not
reconcile with anything we've modeled.** The 5-year compounding projection
already built in `CalBrrrr.md` — parallel/leverage-stacked path, $250K
capital, debt-only, no equity partners — tops out at **28–36 units over
5 years**. Getting from 3–5 properties to 300+ requires either:
(a) outside equity/syndication capital, which directly contradicts the
locked sovereignty doctrine ("debt scales you while keeping 100% control;
equity partners don't"), or (b) the number is aspirational long-horizon
noise that isn't meant to drive near-term build priorities.

**Recommendation:** keep "2028+" framing as an open-ended aspiration, but
don't let Cline or Anomaly plan against it as a target. The actionable
BRRRR ceiling for build purposes is the 28–36 unit / 5-year model already
in canon. If you *do* want the 300-property scale, that's a distinct
strategic decision (bring in partnership capital, syndicate) that should
be made explicitly — not inherited implicitly from a roadmap number.

Everything below assumes the grounded trajectory, not the 300-property one.

---

## 2. THE CONVERSION MAP

| Existing Module | Current State | Trifecta Role | Reused As-Is | Extension Needed |
|---|---|---|---|---|
| **Pure** | Live, "P" button | Cross-track orchestrator | Model router, `aim_decisions` ledger, human-gate enforcement | Add routing rules for Aura8 + AIMature query types (already designed for this in the master roadmap) |
| **Sentinel** | Parked, sketched | BRRRR property intelligence | Full spec already exists in `SENTINEL_BRRRR_Ecosystem_Handoff.md` §6.2 | None — build as originally specced |
| **Anomaly** | Partial architecture | Multi-domain scoring engine | DSA v2 weights + 6-D scoring for BRRRR (§4 of BRRRR brief) | **New:** extend the 6-D frame to score Aura8 content/retention trends and AIMature creator-niche trends — same engine, new input schema per domain |
| **AIMoney** | Architecture exists | Capital ledger + BRRRR underwriting | Yield-on-cost gate logic (§6.4 of BRRRR brief) stays exactly as built | **New:** add a cross-track capital-allocation ledger (the 30/40/20/10 flywheel) — this is a *superset* role, not a conflict. Underwriting math stays BRRRR-only; ledger role is new and spans all three tracks |
| **Pulse** | Exists, parked | Market + sentiment intelligence | — | New build, but clarify first: is Pulse meant to *be* ORACLE (Grok), or a separate module ORACLE feeds? |
| **PURE Filter** | Live, `lib/pure-filter.ts` | Brand voice + compliance | Fully reused, no changes | Extend the canonical vocabulary list to include Aura8/AIMature terms as they're coined |

---

## 3. THE MODULES YOU LISTED THAT WEREN'T PREVIOUSLY SPECIFIED

These appeared in your list (Pipeline, Alerts, Contacts, Grants, Field Ops,
Vendors, Call) without prior architecture. Best-guess mapping below —
**flagging assumptions where guessing wrong would cause real conflicts.**

| Module | Proposed Mapping | Confidence |
|---|---|---|
| **Pipeline** | Generalize the existing `rei_pipeline` (deal-stage tracker) into `aim_pipeline` — one stage-tracker schema, `track` column (`aura8`\|`brrrr`\|`aimature`) distinguishes a subscriber funnel stage from a deal stage from a creator-onboarding stage | High |
| **Contacts** | Unified CRM — sellers, tenants, creators, subscribers all in one `aim_contacts` table with a `contact_type` column | High |
| **Alerts** | Cross-track notification/webhook dispatcher — churn signal, deal match, chargeback, rebill failure all route through one `aim_alerts` table | High |
| **Call** | **This is almost certainly your existing VAPI agents** (Maya Outing / Maya Inby) — reuse directly for BRRRR seller outreach, and consider extending to AIMature creator support calls | High |
| **Vendors** | Contractor/vendor management — shared between existing DTLA ops (Tree Elevator, Hart DM contacts) and BRRRR rehab vendors. One `rei_vendors` table, `context` column distinguishes DTLA-ops vendors from BRRRR-rehab vendors | Medium |
| **Field Ops** | Physical operations tracker — likely unifies DTLA unit-turn/abatement tracking (Weldon/Simone active units) with BRRRR rehab-scope tracking. Same shape, different asset class | Medium |
| **Grants** | **Needs your confirmation before I spec this.** Two very different things this could mean: (a) HACLA/HUD subsidy and grant compliance tracking for the existing Weldon/Simone affordable-housing portfolio — which maps to the "Subsidy Gap" module already named in your original HAS canon, or (b) a new grant-funding-research tool for BRRRR/business capital. These have almost no schema overlap and getting this wrong risks tangling live HACLA compliance data with a speculative-capital tool. **Which did you mean?** | **Low — please confirm** |

---

## 4. SHARED DATA MODEL ADDITIONS (cross-track, additive only)

None of this touches the existing `aura8_`, `rei_`, `has_` schemas. These are new, track-spanning tables:

```sql
-- Generalized pipeline (replaces track-specific pipeline tables)
CREATE TABLE aim_pipeline (
  id uuid primary key default gen_random_uuid(),
  track text check (track in ('aura8', 'brrrr', 'aimature')),
  entity_id uuid,
  stage text,
  updated_at timestamptz default now()
);

-- Unified CRM
CREATE TABLE aim_contacts (
  id uuid primary key default gen_random_uuid(),
  contact_type text check (contact_type in ('seller', 'tenant', 'creator', 'subscriber', 'vendor')),
  name text,
  email text,
  phone text,
  source text,
  notes jsonb,
  created_at timestamptz default now()
);

-- Cross-track alerts
CREATE TABLE aim_alerts (
  id uuid primary key default gen_random_uuid(),
  track text check (track in ('aura8', 'brrrr', 'aimature')),
  alert_type text,
  severity text check (severity in ('critical', 'warning', 'info')),
  payload jsonb,
  resolved boolean default false,
  created_at timestamptz default now()
);

-- Capital allocation flywheel (AIMoney's new ledger role — additive to existing rei_underwriting)
CREATE TABLE aim_capital_ledger (
  id uuid primary key default gen_random_uuid(),
  source_track text check (source_track in ('aura8', 'brrrr', 'aimature')),
  amount numeric not null,
  allocation_bucket text check (allocation_bucket in ('operating_reserve', 'brrrr_downpayment', 'rd', 'aimature_marketing')),
  destination_track text,
  executed_at timestamptz default now(),
  human_approved boolean default false -- GUARDRAIL: every allocation >$X needs sign-off
);

-- Vendors (shared DTLA-ops + BRRRR-rehab)
CREATE TABLE rei_vendors (
  id uuid primary key default gen_random_uuid(),
  name text,
  context text check (context in ('dtla_ops', 'brrrr_rehab')),
  trade text,
  contact_id uuid,
  rating numeric
);

-- Field ops (shared DTLA unit-turn + BRRRR rehab tracking)
CREATE TABLE rei_field_ops (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid,
  context text check (context in ('dtla_uniturn', 'brrrr_rehab')),
  scope jsonb,
  status text,
  cost_actual numeric,
  cost_budget numeric
);
```

**GUARDRAIL carried forward:** `aim_capital_ledger.human_approved` enforces
the same rule as everywhere else in your architecture — capital deployment
above threshold is never automated end-to-end.

---

## 5. CONVERSION SEQUENCE (Cline-ready, zero-rebuild)

1. **Do nothing to Sentinel, Anomaly's BRRRR scoring, AIMoney's underwriting
   gate, or PURE Filter.** They're already correctly scoped — build them
   exactly as specified in the existing BRRRR brief.
2. **Extend Pure's router** to include Aura8-support and AIMature-support
   query types (schema addition only — router logic already exists).
3. **Generalize Anomaly's 6-D frame** — add domain-specific input schemas
   for content/retention trends (Aura8) and creator-niche trends (AIMature),
   reusing the same scoring engine.
4. **Add the new cross-track tables** from §4 — additive, no migrations
   touch existing tables.
5. **Stand up Pulse** — confirm first whether it *is* ORACLE or *feeds*
   ORACLE, then build the standing-module version.
6. **Resolve the Grants ambiguity** before touching that schema at all —
   this is the one place guessing wrong creates real risk against live
   HACLA compliance data.
7. **Re-baseline the Phase 3 BRRRR target** in whatever roadmap doc Cline
   is planning from, so "300+ properties" doesn't silently become a build
   target — replace with the grounded 28–36 unit / 5-year figure, or
   explicitly flag the higher number as syndication-dependent.

---

## 6. OPEN QUESTIONS FOR CLARIFICATION

### 6.1 — Grants Module
**What does "Grants" refer to?**
- Option A: HACLA/HUD subsidy compliance tracking for existing Weldon/Simone portfolio (maps to "Subsidy Gap" in HAS canon)
- Option B: New grant-funding research tool for BRRRR/business capital

These have almost no schema overlap. Guessing wrong risks tangling live compliance data. **Which did you intend?**

### 6.2 — Pulse vs. ORACLE
**Is Pulse meant to *be* ORACLE (Grok) or a separate module that ORACLE feeds?**

This distinction changes the architecture slightly. Clarify before building.

---

## 7. CANONICAL VOCABULARY ADDITIONS

Extend `lib/pure-filter.ts` to include:

**Aura8 terms:**
- Companion, token, tier (lite/pro/premium), gallery, conversation, streaming

**AIMature terms:**
- Creator, fan queue, creator SaaS, white-label, niche

**Cross-track terms:**
- Flywheel, capital allocation, track, pipeline, compliance

---

*SENTINEL sign-off: this is additive architecture, not a rewrite. All prior
BRRRR-brief specs stay authoritative and unchanged. Not financial or legal advice.*
