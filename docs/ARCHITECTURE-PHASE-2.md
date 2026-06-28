# AIM Operating Platform: Phase 2+ Architecture

**Status:** Parked for Phase 2+ (post-Aura8 revenue)  
**Last Updated:** 2026-06-28  
**Canonical:** Yes — this is the locked strategic direction after Phase 1 execution completes.

---

## Executive Summary

The Aura8 → AIM ecosystem is a **phased, revenue-financed architecture**, not a feature checklist.

**Phase 1 (Current):** Execute Aura8 as an active revenue engine with manual operations acceptable.  
**Phase 2+:** Use Aura8 cash flow to finance increasingly sophisticated automation, proprietary data assets, and autonomous self-healing infrastructure.

This document captures the Phase 2+ strategy so it remains canonical for execution when Phase 1 revenue is confirmed.

---

## Phase 1: Execution Architecture (Active Now)

### Layer: The Yield
- **What:** Aura8.fun generates recurring revenue
- **Status:** Active execution (Sprint 8 focus)
- **Component:** Email verification gate + CCBill subscription integration
- **Ownership:** Immediate priority

### Layer: The Sink
- **What:** Capital compounds through reinvestment doctrine
- **Structure:** SBI → AIM LLC → HIS Property LLCs + other investments
- **Status:** Active (operating doctrine already established)
- **Ownership:** Financial flow, not engineering

### Layer: The Brain
- **What:** Multi-model AI governance layer
- **Components:** SENTINEL (monitoring), LIAISON (comms), ARCHITECT (planning), ORACLE (decisions)
- **Orchestration:** n8n (current backbone)
- **Status:** Active and canonical
- **Intervention Model:** Manual (acceptable in Phase 1)
- **Ownership:** n8n workflows + LLM routing logic

---

## Phase 2+: Evolution Architecture (Parked, Revenue-Gated)

### Layer: The Vault (Data Proprietary Asset)

**What it does:**
Retain anonymized interaction telemetry to build proprietary fine-tuned models.

**Why it matters:**
- Storage is inexpensive
- Recreating behavioral history years later is impossible
- This funds Phase 2+ model development

**When it activates:**
After Aura8 has dependable recurring revenue.

**Implementation Strategy:**

#### Immediate (Phase 1, before revenue):
Design database schemas to retain interaction metadata without building ML infrastructure:

```sql
-- Add to all relevant workflow/interaction tables:
ALTER TABLE ccbill_webhook_events ADD COLUMN IF NOT EXISTS retain_for_training boolean DEFAULT true;
ALTER TABLE aura8_subscribers ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

-- New table for interaction sessions
CREATE TABLE IF NOT EXISTS public.interaction_telemetry (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_email text,
  interaction_type text, -- 'auth', 'content_access', 'api_call', etc.
  model_used text, -- 'gpt-4', 'claude-opus', etc.
  prompt_variant text, -- variant ID for A/B testing
  input_tokens integer,
  output_tokens integer,
  latency_ms integer,
  outcome text, -- 'success', 'partial', 'error'
  error_message text,
  anonymized boolean default false,
  anonymized_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  retain_for_training boolean default true
);

CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON interaction_telemetry(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_retain ON interaction_telemetry(retain_for_training);
```

#### Phase 2 (post-revenue):
- Build ingestion pipeline to aggregate anonymized telemetry
- Train proprietary fine-tuned models on interaction patterns
- Use proprietary models to improve SENTINEL/ORACLE decision quality
- Create competitive moat through behavioral understanding

**Cost Structure:**
- Phase 1: Zero (schema design only)
- Phase 2: Storage + LLM fine-tuning cost, funded by Aura8 revenue

---

### Layer: Self-Healing (Autonomous Operations)

**What it does:**
Detects workflow failures and reroutes autonomously without manual intervention.

**Why it matters:**
- Manual intervention is operational debt
- Autonomous recovery scales without adding ops headcount
- Increases reliability as complexity grows

**When it activates:**
After Aura8 has predictable revenue and n8n workflows are proven stable.

**Implementation Strategy:**

#### Phase 1 (Current):
```
Workflow fails
    │
    ▼
n8n retries (configurable policy)
    │
    ▼
Error notification to you
    │
    ├── Manual fix (acceptable now)
    └── Learn pattern for Phase 2
```

#### Phase 2 (post-revenue):
```
Workflow fails
    │
    ▼
Supervisor Agent (LLM) detects failure
    │
    ├── Diagnose cause (logs, metrics, context)
    │
    ├── Route automatically:
    │   ├── Retry with backoff
    │   ├── Use backup API/model
    │   ├── Modify prompt and retry
    │   ├── Switch to different LLM
    │   ├── Create maintenance task (GitHub issue)
    │   └── Escalate only if unresolved
    │
    ▼
Workflow continues / Recovery complete / Human notified of escalation
```

**Integration:**
- Supervisor agent lives as an n8n workflow listener
- Eventually becomes part of SENTINEL governance layer
- Decision log feeds into interaction telemetry (The Vault)

**Cost Structure:**
- Phase 1: Zero (manual ops acceptable)
- Phase 2: LLM API calls for diagnostics, funded by Aura8 revenue

---

## Architectural Principle: Phased by Revenue

This system is **not feature-complete**.  
It is **revenue-financed and sequenced**.

```
Phase 1: Build one revenue engine (Aura8)
    │
    ▼
Phase 2: Automate its operation (Self-Healing)
    │
    ▼
Phase 3: Use cash flow to finance sophisticated automation (Vault + proprietary models)
    │
    ▼
Phase 4: Create proprietary data assets (fine-tuned models)
    │
    ▼
Phase 5: Build self-improving infrastructure (autonomous optimization)
```

Each stage finances the next rather than requiring outside capital.

---

## What This Means for Current Sprint

**Sprint 8 Focus:** Execute Phase 1 (Aura8 revenue engine).

**Do not attempt:**
- Building ML infrastructure now
- Autonomous failure recovery now
- Proprietary model training now

**Do accept:**
- Manual intervention in n8n
- Error notifications to you
- Simple retry policies

**Do preserve:**
- Interaction telemetry schema design (zero cost, high future value)
- Decision logs for later analysis

---

## Activation Triggers for Phase 2

Phase 2+ work begins **only when**:

1. **Aura8 has predictable recurring revenue** (e.g., 50+ active subscribers, >$1000/month MRR)
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

- `docs/aura8-access-control.md` — Phase 1 subscriber enforcement
- `docs/ccbill-admin-debug.md` — Phase 1 webhook monitoring
- `docs/ccbill-testing.md` — Phase 1 integration testing
- `lib/aura8/` — Phase 1 access + subscription logic
- `.env.example` — Phase 1 config (CCBILL_WEBHOOK_SECRET, ADMIN_DEBUG_SECRET, etc.)

---

## Footer

This architecture remains canonical until explicitly revised.  
Owned by: Strategic Planning (You)  
Last validated: 2026-06-28
