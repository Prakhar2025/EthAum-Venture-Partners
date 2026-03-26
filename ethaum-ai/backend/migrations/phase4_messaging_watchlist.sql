-- ============================================================
-- EthAum.ai — Phase 4 Migration: Messaging + Watchlist
-- Safe additions only — no DROPs, no RENAMEs
-- Run in Supabase SQL Editor AFTER phase3_challenge_board.sql
--
-- Schema context:
--   users.id     = UUID
--   products.id  = SERIAL (INTEGER)
-- ============================================================

-- ─── MESSAGES TABLE ───────────────────────────────────────────────────────────
-- Supports threaded inbox model. A "thread" is identified by sorting the two
-- clerk_ids alphabetically + the optional product context.

CREATE TABLE IF NOT EXISTS messages (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user   TEXT        NOT NULL,                          -- clerk_id sender
    to_user     TEXT        NOT NULL,                          -- clerk_id recipient
    thread_id   TEXT        NOT NULL,                          -- composite key: sorted(from,to) + product_id
    product_id  INTEGER     REFERENCES products(id) ON DELETE SET NULL,
    content     TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 4000),
    read        BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── WATCHLIST TABLE ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS watchlist (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT        NOT NULL,                          -- clerk_id
    product_id  INTEGER     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

-- ─── PERFORMANCE INDEXES ─────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_messages_thread   ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user  ON messages(to_user);
CREATE INDEX IF NOT EXISTS idx_messages_from_user ON messages(from_user);
CREATE INDEX IF NOT EXISTS idx_messages_read     ON messages(to_user, read);
CREATE INDEX IF NOT EXISTS idx_watchlist_user    ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_product ON watchlist(product_id);

-- ─── VERIFY ───────────────────────────────────────────────────────────────────
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('messages', 'watchlist');
-- Expected: 2 rows
