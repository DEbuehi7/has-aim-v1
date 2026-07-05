# HAS-AIM v1 Canonical Development Workflow

**Version:** 1.0 (LOCKED - No changes without full team approval)  
**Last Updated:** 2026-07-04  
**Approved by:** @DEbuehi7

---

## ✅ APPROVED TOOLS (Use ONLY These)

### Code Development
- **Cline (Local)** — Primary editor. Direct file manipulation, full context, no context corruption.
- **GitHub** — Source of truth. All code lives here. Branch/PR workflow enforced.
- **Vercel** — Auto-deploy on push to main. Zero configuration needed.

### ❌ DO NOT USE
- Railway (expensive, flaky, redundant with Vercel)
- GitHub Copilot Agent Sessions (corrupted context, sessions don't sync to browser app)

---

## Workflow for All Pull Requests

### Small Changes (1-2 files)
```
1. Open Cline locally
2. Edit files directly
3. Test: npm run build
4. Commit & push to feature branch
5. Create manual GitHub PR
6. Merge to main
7. Vercel auto-deploys
```

### Medium Changes (3-10 files, logic-heavy)
```
1. Create feature branch locally
2. Open Cline + load full repo context
3. Edit files, test locally with npm run dev
4. Validate: npm run build
5. Commit with clear message
6. Push to feature branch
7. Create PR on GitHub (describe changes)
8. Self-review, merge to main
9. Vercel deploys automatically (2 min)
```

### Large Features (complex state, new APIs)
```
1. Create feature branch + write detailed task description
2. Open Cline, load repo context from /workspaces/has-aim-v1
3. Implement incrementally:
   - Edit one logical unit
   - Validate with npm run build
   - Commit with descriptive message
   - Repeat until feature complete
4. Final validation: npm run build (must pass)
5. Push branch
6. Create PR with architecture notes
7. Merge to main
8. Monitor Vercel deployment logs
```

---

## Mandatory Checklist Before Every Push

- [ ] `npm run build` passes locally (0 errors, 0 warnings)
- [ ] All modified files tested locally (`npm run dev` if dynamic routes)
- [ ] Commit message is clear and describes the change
- [ ] Branch name is descriptive (`fix/companion-auth`, `feat/token-tiers`, `docs/workflow`)
- [ ] No sensitive data committed (API keys, tokens, emails, passwords)
- [ ] No trailing console.log statements (development only)

---

## Deployment Gate

**Only push to main if:**
1. Build succeeds locally
2. Changes are feature-complete (don't deploy half-done work)
3. No breaking changes without migration plan documented in PR

**Vercel auto-deploys within 2 minutes of merge to main.**

---

## Emergency: Build Fails on Vercel

**Do NOT retry deploy.** Instead:

1. Pull latest main locally
2. Run `npm run build` to reproduce the error
3. Fix in Cline locally
4. Test with `npm run build` again (must pass)
5. Commit fix with clear message
6. Push fix to main
7. Vercel re-deploys automatically (no manual action needed)

---

## Local Development Setup

### First Time
```bash
cd /workspaces/has-aim-v1
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
npm install
```

### Daily Development
```bash
npm run dev          # Runs on localhost:3000

# Before pushing
npm run build         # Must pass

# Optionally run tests (if tests exist)
npm run test
```

### Secrets (NEVER commit to git)
- `NEXT_PUBLIC_SUPABASE_URL` — public, safe to commit
- `SUPABASE_SERVICE_ROLE_KEY` — private, set in Vercel env vars only
- `ANTHROPIC_API_KEY` — private, set in Vercel env vars only

---

## v1 Priority Order (Locked)

1. ✅ **v0 Complete** — Companion auto-login, nav redesign, revenue hidden
2. **Conversation persistence** — Extend companion chat DB + UI history
3. **Multiple companions** — Create/manage profile system
4. **Token tiers & pricing** — Stripe integration (lite/pro/premium)
5. **Admin dashboard** — Revenue, user analytics (hidden from customers)
6. **Affiliate tracking** — CrushOn commission ledger

---

## Communication Protocol

- **Code changes** → Use Cline locally, commit with descriptive messages
- **Blocked/stuck** → Post in GitHub Issues with `blocked` label
- **Questions about code** → Review the recent commit message + read the modified files
- **Architecture decisions** → Document in PR description, link to this file

---

## Why This Workflow?

| Tool | Reason |
|------|--------|
| **Cline (Local)** | Direct file control, full repo context, no session corruption |
| **GitHub** | Immutable history, PR review trail, branch protection |
| **Vercel** | Native Next.js deployment, auto-scaling, zero ops |
| **NOT Railway** | Build failures, $20/mo waste, no advantage over Vercel |
| **NOT Copilot Agent** | Context gets corrupted, sessions don't sync, adds confusion |

---

## Next Steps

- Deploy v0 fixes to production
- Demo to CCBill (Sinisha)
- Lock in v1 feature backlog
- Begin Phase 1: Conversation persistence

---

**Questions?** Review the recent commits or open a GitHub Issue.
