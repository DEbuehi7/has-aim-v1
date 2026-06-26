-- =============================================================================
-- CCBill Webhook + Aura8 Subscriber Tables
-- =============================================================================
-- Run this in the Supabase SQL editor (or via psql) before enabling the
-- CCBill webhook endpoint.
--
-- Safe to run multiple times — all statements use IF NOT EXISTS / IF EXISTS.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. ccbill_webhook_events
--    Raw append-only log of every postback received from CCBill.
--    Never delete rows from this table; it is the audit trail.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ccbill_webhook_events (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  source            text        NOT NULL DEFAULT 'ccbill',
  event_type        text,
  email             text,
  subscription_id   text,
  transaction_id    text,
  customer_id       text,
  status            text,
  amount            numeric,
  currency          text,
  affiliate         text,
  subaccount        text,
  campaign          text,
  tracking_id       text,
  payload           jsonb       NOT NULL DEFAULT '{}'::jsonb,
  headers           jsonb,
  processed         boolean     NOT NULL DEFAULT false,
  processing_error  text
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_ccbill_events_transaction_id
  ON ccbill_webhook_events (transaction_id);

CREATE INDEX IF NOT EXISTS idx_ccbill_events_subscription_id
  ON ccbill_webhook_events (subscription_id);

CREATE INDEX IF NOT EXISTS idx_ccbill_events_email
  ON ccbill_webhook_events (email);

CREATE INDEX IF NOT EXISTS idx_ccbill_events_created_at
  ON ccbill_webhook_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ccbill_events_processed
  ON ccbill_webhook_events (processed)
  WHERE processed = false;

-- Row Level Security — service role bypasses RLS automatically
ALTER TABLE ccbill_webhook_events ENABLE ROW LEVEL SECURITY;
-- No public policies: only the server-side service role can read/write


-- ---------------------------------------------------------------------------
-- 2. aura8_subscribers
--    Canonical subscriber state table. Upserted on every relevant CCBill event.
--    Also used by the email verification flow (age_verified column added below).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS aura8_subscribers (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  email            text        UNIQUE,
  subscription_id  text        UNIQUE,
  customer_id      text,
  status           text,
  plan             text,
  affiliate        text,
  subaccount       text,
  campaign         text,
  tracking_id      text,
  last_payment_at  timestamptz,
  expires_at       timestamptz,
  metadata         jsonb       NOT NULL DEFAULT '{}'::jsonb,
  age_verified     boolean     NOT NULL DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_aura8_subscribers_email
  ON aura8_subscribers (email);

CREATE INDEX IF NOT EXISTS idx_aura8_subscribers_subscription_id
  ON aura8_subscribers (subscription_id);

CREATE INDEX IF NOT EXISTS idx_aura8_subscribers_status
  ON aura8_subscribers (status);

CREATE INDEX IF NOT EXISTS idx_aura8_subscribers_updated_at
  ON aura8_subscribers (updated_at DESC);

-- Row Level Security
ALTER TABLE aura8_subscribers ENABLE ROW LEVEL SECURITY;
-- No public policies: only the server-side service role can read/write


-- ---------------------------------------------------------------------------
-- 3. Backfill / migration helpers
--    If aura8_subscribers already exists from the email-gate flow, add any
--    missing columns safely.
-- ---------------------------------------------------------------------------

ALTER TABLE aura8_subscribers
  ADD COLUMN IF NOT EXISTS subscription_id  text,
  ADD COLUMN IF NOT EXISTS customer_id      text,
  ADD COLUMN IF NOT EXISTS status           text,
  ADD COLUMN IF NOT EXISTS plan             text,
  ADD COLUMN IF NOT EXISTS affiliate        text,
  ADD COLUMN IF NOT EXISTS subaccount       text,
  ADD COLUMN IF NOT EXISTS campaign         text,
  ADD COLUMN IF NOT EXISTS tracking_id      text,
  ADD COLUMN IF NOT EXISTS last_payment_at  timestamptz,
  ADD COLUMN IF NOT EXISTS expires_at       timestamptz,
  ADD COLUMN IF NOT EXISTS metadata         jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS age_verified     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at       timestamptz NOT NULL DEFAULT now();

-- Add unique constraint on subscription_id if not already present
-- (This will fail silently if the constraint already exists — run separately
--  if you need to handle the error explicitly.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'aura8_subscribers_subscription_id_key'
  ) THEN
    ALTER TABLE aura8_subscribers
      ADD CONSTRAINT aura8_subscribers_subscription_id_key UNIQUE (subscription_id);
  END IF;
END $$;

-- Recreate indexes that may not exist on an older table
CREATE INDEX IF NOT EXISTS idx_aura8_subscribers_email
  ON aura8_subscribers (email);

CREATE INDEX IF NOT EXISTS idx_aura8_subscribers_subscription_id
  ON aura8_subscribers (subscription_id);

CREATE INDEX IF NOT EXISTS idx_aura8_subscribers_status
  ON aura8_subscribers (status);


-- ---------------------------------------------------------------------------
-- 4. Optional: auto-update updated_at via trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_aura8_subscribers_updated_at ON aura8_subscribers;
CREATE TRIGGER trg_aura8_subscribers_updated_at
  BEFORE UPDATE ON aura8_subscribers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
