-- =============================================================================
-- Aura8 AI Companion Tables
-- =============================================================================
-- Run in Supabase SQL Editor before using the /aura8/companion page.
-- Safe to run multiple times — all statements use IF NOT EXISTS guards.
--
-- Tables created:
--   aura8_conversations  — stores per-user chat messages with token tracking
-- =============================================================================


-- ---------------------------------------------------------------------------
-- aura8_conversations
--
-- Append-only log of every chat message (both user and assistant turns).
-- One row per turn. Ordered by created_at for history queries.
--
-- Columns:
--   id           — UUID PK
--   created_at   — timestamp of the message
--   email        — subscriber email (FK-ish to aura8_subscribers.email)
--   role         — "user" or "assistant"
--   content      — message text
--   tokens_used  — tokens charged for this turn (0 for assistant turns)
--   session_id   — optional: group messages into sessions (future use)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS aura8_conversations (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email        TEXT        NOT NULL,
  role         TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content      TEXT        NOT NULL DEFAULT '',
  tokens_used  INTEGER     NOT NULL DEFAULT 0,
  session_id   UUID,
  metadata     JSONB       NOT NULL DEFAULT '{}'::JSONB
);

-- Indexes for common access patterns
CREATE INDEX IF NOT EXISTS idx_aura8_conversations_email
  ON aura8_conversations (email);

CREATE INDEX IF NOT EXISTS idx_aura8_conversations_email_created
  ON aura8_conversations (email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_aura8_conversations_created_at
  ON aura8_conversations (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_aura8_conversations_session
  ON aura8_conversations (session_id)
  WHERE session_id IS NOT NULL;

-- Row Level Security — service role bypasses RLS automatically
ALTER TABLE aura8_conversations ENABLE ROW LEVEL SECURITY;
-- No public policies: only server-side service role key can read/write


-- ---------------------------------------------------------------------------
-- Useful queries for monitoring
-- ---------------------------------------------------------------------------

-- Message count by email:
-- SELECT email, count(*) as messages, sum(tokens_used) as tokens
-- FROM aura8_conversations GROUP BY email ORDER BY messages DESC;

-- Recent conversations:
-- SELECT email, role, left(content, 80) as preview, tokens_used, created_at
-- FROM aura8_conversations ORDER BY created_at DESC LIMIT 50;

-- Token usage today:
-- SELECT email, sum(tokens_used) as tokens_today
-- FROM aura8_conversations
-- WHERE created_at >= NOW() - INTERVAL '24 hours'
-- GROUP BY email ORDER BY tokens_today DESC;
