-- ============================================================
-- EthAum.ai — Phase 3 Migration: Challenge Board (Agorize-style)
-- Safe additions only — no DROPs, no RENAMEs
-- Run in Supabase SQL Editor AFTER phase2_product_depth.sql
--
-- IMPORTANT: products.id is SERIAL (INTEGER) in this codebase.
-- challenge_applications.product_id is INTEGER accordingly.
-- ============================================================

-- ─── CHALLENGES TABLE ─────────────────────────────────────────────────────────
-- Note: Using IF NOT EXISTS guards on all objects for idempotency.

CREATE TABLE IF NOT EXISTS challenges (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    posted_by           TEXT        NOT NULL,           -- clerk_id of enterprise user
    posted_by_name      TEXT,                           -- display name / company name
    title               TEXT        NOT NULL,
    description         TEXT,
    vertical            TEXT,
    healthcare_category TEXT,
    compliance_required TEXT[]      DEFAULT ARRAY[]::TEXT[],
    geography           TEXT[]      DEFAULT ARRAY[]::TEXT[],
    stage_required      TEXT,                           -- seed|series_a|series_b|series_c
    prize_value         TEXT,                           -- free text e.g. "$500K contract"
    deadline            TIMESTAMPTZ,
    status              TEXT        NOT NULL DEFAULT 'open',  -- open|closed|winner_selected
    application_count   INTEGER     NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CHALLENGE APPLICATIONS TABLE ─────────────────────────────────────────────
-- product_id is INTEGER to match products.id SERIAL

CREATE TABLE IF NOT EXISTS challenge_applications (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id         UUID        NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    product_id           INTEGER     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    applicant_id         TEXT        NOT NULL,              -- clerk_id of startup user
    product_name         TEXT,                              -- denormalised for easy display
    solution_description TEXT,
    status               TEXT        NOT NULL DEFAULT 'pending',  -- pending|shortlisted|winner|rejected
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (challenge_id, product_id)
);

-- ─── CHECK CONSTRAINTS ────────────────────────────────────────────────────────
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_status_check;
ALTER TABLE challenges ADD CONSTRAINT challenges_status_check
    CHECK (status IN ('open', 'closed', 'winner_selected'));

ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_vertical_check;
ALTER TABLE challenges ADD CONSTRAINT challenges_vertical_check
    CHECK (vertical IS NULL OR vertical IN (
        'healthcare','edtech','fintech','saas','hardware','hospitality'
    ));

ALTER TABLE challenge_applications DROP CONSTRAINT IF EXISTS apps_status_check;
ALTER TABLE challenge_applications ADD CONSTRAINT apps_status_check
    CHECK (status IN ('pending','shortlisted','winner','rejected'));

-- ─── AUTO-UPDATED updated_at TRIGGER ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_challenges_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_challenges_updated_at ON challenges;
CREATE TRIGGER set_challenges_updated_at
    BEFORE UPDATE ON challenges
    FOR EACH ROW EXECUTE FUNCTION update_challenges_updated_at();

-- ─── PERFORMANCE INDEXES ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_posted_by ON challenges(posted_by);
CREATE INDEX IF NOT EXISTS idx_challenges_vertical ON challenges(vertical);
CREATE INDEX IF NOT EXISTS idx_challenges_deadline ON challenges(deadline);
CREATE INDEX IF NOT EXISTS idx_challenge_apps_challenge ON challenge_applications(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_apps_applicant ON challenge_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_challenge_apps_product ON challenge_applications(product_id);

-- ─── VERIFY ───────────────────────────────────────────────────────────────────
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('challenges', 'challenge_applications');
-- Expected: 2 rows
