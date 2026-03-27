-- ============================================================
-- EthAum.ai — Phase 5 Migration: Subscriptions + Billing
-- Safe additions only — no DROPs, no RENAMEs
-- Run in Supabase SQL Editor AFTER phase4_messaging_watchlist.sql
-- ============================================================

-- ─── SUBSCRIPTIONS TABLE ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscriptions (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               TEXT        NOT NULL UNIQUE,  -- clerk_id (one active sub per user)
    stripe_customer_id    TEXT,
    stripe_subscription_id TEXT,
    stripe_price_id       TEXT,
    plan                  TEXT        NOT NULL DEFAULT 'free'
                          CHECK (plan IN ('free','starter','growth','enterprise_buyer','investor')),
    status                TEXT        NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','trialing','past_due','canceled','unpaid')),
    current_period_start  TIMESTAMPTZ,
    current_period_end    TIMESTAMPTZ,
    cancel_at_period_end  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── AUTO updated_at TRIGGER ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id            ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer    ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub         ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan               ON subscriptions(plan);

-- ─── VERIFY ───────────────────────────────────────────────────────────────────
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name = 'subscriptions';
-- Expected: 1 row
