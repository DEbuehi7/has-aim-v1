-- Static compliance login schema + RLS policies
-- Run this in Supabase SQL editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.compliance_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL UNIQUE,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  account_type text NOT NULL DEFAULT 'compliance_auditor',
  role text NOT NULL DEFAULT 'read_only_auditor',
  organization text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  restrictions jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  last_login_ip text,
  expires_at timestamptz,
  notes text
);

CREATE TABLE IF NOT EXISTS public.compliance_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  compliance_account_id uuid REFERENCES public.compliance_accounts(id),
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  ip_address text,
  user_agent text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_account
  ON public.compliance_audit_log(compliance_account_id);

CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_created_at
  ON public.compliance_audit_log(created_at DESC);

ALTER TABLE public.aura8_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ccbill_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yoti_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS compliance_read_only_aura8_subscribers ON public.aura8_subscribers;
CREATE POLICY compliance_read_only_aura8_subscribers
  ON public.aura8_subscribers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.compliance_accounts ca
      WHERE ca.id = auth.uid()
        AND ca.active = true
        AND (ca.expires_at IS NULL OR ca.expires_at > now())
    )
  );

DROP POLICY IF EXISTS compliance_read_only_ccbill_webhook_events ON public.ccbill_webhook_events;
CREATE POLICY compliance_read_only_ccbill_webhook_events
  ON public.ccbill_webhook_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.compliance_accounts ca
      WHERE ca.id = auth.uid()
        AND ca.active = true
        AND (ca.expires_at IS NULL OR ca.expires_at > now())
    )
  );

DROP POLICY IF EXISTS compliance_read_only_yoti_verifications ON public.yoti_verifications;
CREATE POLICY compliance_read_only_yoti_verifications
  ON public.yoti_verifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.compliance_accounts ca
      WHERE ca.id = auth.uid()
        AND ca.active = true
        AND (ca.expires_at IS NULL OR ca.expires_at > now())
    )
  );
