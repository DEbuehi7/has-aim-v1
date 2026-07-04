-- =============================================================================
-- Migration: aura8_email_tokens enhancements
-- =============================================================================
-- Adds verify_attempts column for brute-force protection.
-- Safe to run multiple times (IF NOT EXISTS / IF EXISTS guards).
--
-- Run in Supabase SQL Editor before deploying the updated email-verify route.
-- =============================================================================

-- verify_attempts: counts how many times a token lookup has been attempted.
-- The email-verify route increments this on each call. Once the count reaches
-- EMAIL_VERIFY_MAX_ATTEMPTS (default 10), the token is deleted and the user
-- must request a new one. Prevents brute-forcing the token space.
ALTER TABLE aura8_email_tokens
  ADD COLUMN IF NOT EXISTS verify_attempts INTEGER NOT NULL DEFAULT 0;

-- Index on token for fast lookups (already exists from create script, safe to re-run)
CREATE INDEX IF NOT EXISTS idx_aura8_email_tokens_token
  ON aura8_email_tokens (token);

-- Optional: auto-expire cleanup (run periodically or via pg_cron)
-- Deletes tokens older than 24 hours to keep the table lean.
-- Uncomment and schedule via pg_cron if available:
-- DELETE FROM aura8_email_tokens WHERE created_at < NOW() - INTERVAL '24 hours';
