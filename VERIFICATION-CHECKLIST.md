# Aura8 v0 Verification Checklist

- [ ] Railway service created from the target branch
- [ ] Railway built successfully with `railway.json` and `Dockerfile`
- [ ] Railway secrets copied from Vercel and verified against `.env.example`
- [ ] `DATABASE_URL` uses the Supabase PgBouncer connection string
- [ ] `/login` returns `200 OK`
- [ ] `/login` loads in under 2 seconds on the Railway public URL
- [ ] `/api/health` returns `200 OK`
- [ ] `/api/health` reports database startup and runtime checks
- [ ] `/api/ccbill/webhook` is reachable from the public internet
- [ ] `/admin/ccbill` loads when `ADMIN_DEBUG_SECRET` is supplied
- [ ] `/aura8/compliance-login` renders correctly
- [ ] Existing Supabase subscriber and webhook data remain accessible
- [ ] CCBill has been given the Railway URL for review
- [ ] Git tag `aura8-v0-railway-live` created after verification
- [ ] Rollback target identified in Railway before DNS cutover
