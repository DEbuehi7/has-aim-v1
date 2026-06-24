-- Run this in your Supabase SQL editor to create the email tokens table
-- Required for the email verification flow

CREATE TABLE IF NOT EXISTS aura8_email_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_aura8_email_tokens_token ON aura8_email_tokens(token);

-- Index for cleanup queries by email
CREATE INDEX IF NOT EXISTS idx_aura8_email_tokens_email ON aura8_email_tokens(email);

-- Ensure aura8_subscribers table has age_verified column
-- (Run only if the column doesn't already exist)
ALTER TABLE aura8_subscribers
  ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT FALSE;

-- Optional: enable Row Level Security (RLS) — service role bypasses this
ALTER TABLE aura8_email_tokens ENABLE ROW LEVEL SECURITY;

-- No public access to tokens table (service role only)
-- This ensures tokens can only be read/written via the server-side API
