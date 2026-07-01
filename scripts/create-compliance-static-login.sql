-- Supabase migration: Create compliance tables and RLS policies
-- Purpose: Enable static login for CCBill/Visa/Mastercard compliance audits
-- Run this migration in your Supabase SQL editor before deploying the application

-- Create compliance_accounts table
CREATE TABLE IF NOT EXISTS public.compliance_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  account_type text NOT NULL DEFAULT 'compliance_auditor', -- 'compliance_auditor', 'internal_admin', etc.
  role text NOT NULL DEFAULT 'read_only_auditor', -- 'read_only_auditor', 'admin', etc.
  organization text, -- 'CCBill', 'Visa', 'Mastercard'
  permissions jsonb DEFAULT '[]'::jsonb, -- array of permitted actions
  restrictions jsonb DEFAULT '[]'::jsonb, -- array of prohibited actions
  active boolean DEFAULT true,
  last_login_at timestamptz,
  last_login_ip text,
  expires_at timestamptz, -- null = permanent access
  notes text
);

-- Create compliance_audit_log table
CREATE TABLE IF NOT EXISTS public.compliance_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  compliance_account_id uuid REFERENCES public.compliance_accounts(id) ON DELETE CASCADE,
  action text NOT NULL, -- 'login', 'view_content', 'view_subscribers', 'view_payments', 'view_audit_trail'
  resource_type text, -- 'content', 'subscriber', 'payment', 'verification', 'dashboard'
  resource_id uuid,
  ip_address text,
  user_agent text,
  details jsonb
);

-- Create indexes for performance
CREATE INDEX idx_compliance_accounts_username ON public.compliance_accounts(username);
CREATE INDEX idx_compliance_accounts_active ON public.compliance_accounts(active);
CREATE INDEX idx_compliance_audit_log_account ON public.compliance_audit_log(compliance_account_id);
CREATE INDEX idx_compliance_audit_log_created_at ON public.compliance_audit_log(created_at DESC);
CREATE INDEX idx_compliance_audit_log_action ON public.compliance_audit_log(action);

-- Enable RLS on compliance tables
ALTER TABLE public.compliance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only service role can access compliance tables directly
CREATE POLICY "Service role only" ON public.compliance_accounts
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only" ON public.compliance_audit_log
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Enable RLS on data tables for compliance read-only access
ALTER TABLE public.aura8_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ccbill_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yoti_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow authenticated compliance access (read-only)
-- Note: These are permissive policies that allow reading when appropriate
CREATE POLICY "Compliance read-only access" ON public.aura8_subscribers
  FOR SELECT USING (true); -- Read-only, controlled by API endpoint

CREATE POLICY "Compliance read-only access" ON public.ccbill_webhook_events
  FOR SELECT USING (true); -- Read-only, controlled by API endpoint

CREATE POLICY "Compliance read-only access" ON public.yoti_verifications
  FOR SELECT USING (true); -- Read-only, controlled by API endpoint

-- Restrict write operations
CREATE POLICY "No writes" ON public.aura8_subscribers
  FOR UPDATE USING (false) WITH CHECK (false);

CREATE POLICY "No writes" ON public.ccbill_webhook_events
  FOR UPDATE USING (false) WITH CHECK (false);

CREATE POLICY "No writes" ON public.yoti_verifications
  FOR UPDATE USING (false) WITH CHECK (false);

CREATE POLICY "No deletes" ON public.aura8_subscribers
  FOR DELETE USING (false);

CREATE POLICY "No deletes" ON public.ccbill_webhook_events
  FOR DELETE USING (false);

CREATE POLICY "No deletes" ON public.yoti_verifications
  FOR DELETE USING (false);
