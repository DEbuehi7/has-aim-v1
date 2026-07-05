# Aura8 v0 Railway Migration

## Goal

Deploy a Railway-hosted Aura8 v0 that:

- serves a working static checkpoint at `/login`
- responds `200 OK` on `/api/health`
- keeps `/api/ccbill/webhook` reachable for CCBill
- keeps Supabase-backed Aura8 data accessible

## 1. Export current Vercel configuration

1. In Vercel, open the project and copy every production environment variable.
2. Compare that list to `.env.example`.
3. Make sure the following values are present before touching Railway:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `CCBILL_WEBHOOK_SECRET`
   - `ADMIN_DEBUG_SECRET`
   - `COMPLIANCE_SESSION_SECRET`
   - `COMPLIANCE_SESSION_DURATION_MINUTES`

## 2. Create the Railway service

1. Create a new Railway project from `DEbuehi7/has-aim-v1`.
2. Point the service at the branch you want to test for v0.
3. Confirm Railway detects:
   - `railway.json`
   - `Dockerfile`
4. Leave the start command empty in the Railway UI so the Docker `CMD` is used.

## 3. Map Railway secrets

Create Railway variables from `.env.example`.

### Supabase pooling requirement

Set `DATABASE_URL` to the Supabase **PgBouncer** string, not the direct port 5432 string.

Format:

```env
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

Use the same Supabase project already holding Aura8 data so no migration is needed for existing subscriber or webhook records.

## 4. Deploy v0 safely

### Recommended release tags

- `aura8-v0-railway-preflight` — first Railway-ready commit
- `aura8-v0-railway-live` — first confirmed public Railway deployment
- `aura8-v1-ccbill-approved` — post-review release
- `aura8-v2-next-phase` — next product iteration

### Recommended flow

1. Tag the commit you want to test as `aura8-v0-railway-preflight`.
2. Deploy that exact commit to Railway.
3. Verify `/login`, `/api/health`, and `/api/ccbill/webhook`.
4. After CCBill confirms access, tag the live commit as `aura8-v0-railway-live`.

## 5. Smoke-test the Railway deployment

Replace `APP_URL` with the Railway public URL.

```bash
curl -i "$APP_URL/login"
curl -i "$APP_URL/api/health"
curl -i "$APP_URL/api/ccbill/webhook"
curl -i -H "x-admin-secret: $ADMIN_DEBUG_SECRET" "$APP_URL/admin/ccbill"
```

Expected results:

- `/login` returns `200` and renders the static checkpoint page
- `/api/health` returns `200` with JSON status
- `/api/ccbill/webhook` returns `200` with `{"status":"ok"}`
- `/admin/ccbill` loads when the admin secret is provided

## 6. DNS and public URL

1. Test the Railway-generated domain first.
2. Only add a custom domain after the Railway domain passes smoke tests.
3. Update `NEXT_PUBLIC_SITE_URL` to the final production URL after DNS is attached.

## 7. CCBill-specific verification path

Share this minimum verification set with CCBill:

- Landing page: `https://<domain>/login`
- Health endpoint: `https://<domain>/api/health`
- Webhook endpoint: `https://<domain>/api/ccbill/webhook`
- Compliance login: `https://<domain>/aura8/compliance-login`

## 8. Rollback plan

If the Railway deployment fails:

1. Re-deploy the previous successful Railway deployment from the Railway UI.
2. Re-point DNS only after the rollback is confirmed healthy.
3. Keep the last known-good git tag (`aura8-v0-railway-live` or earlier) unchanged.
4. If needed, temporarily direct reviewers back to the previous live deployment while fixing forward on a new tag.
