-- ============================================================
-- EthAum.ai — Phase 2 Migration: Healthcare Product Depth
-- Safe additions only — no DROPs, no RENAMEs
-- Run in Supabase SQL Editor AFTER phase1_role_v2.sql
-- ============================================================

-- ─── PRODUCTS TABLE EXTENSIONS ───────────────────────────────────────────────

-- Healthcare vertical (healthcare|edtech|fintech|saas|hardware|hospitality)
ALTER TABLE products ADD COLUMN IF NOT EXISTS vertical TEXT;

-- Healthcare subcategory (chronic_disease|cardiology|mental_health|...)
ALTER TABLE products ADD COLUMN IF NOT EXISTS healthcare_category TEXT;

-- Compliance array (hipaa|fda|ce_mark|iso_13485|soc2|gdpr)
ALTER TABLE products ADD COLUMN IF NOT EXISTS compliance TEXT[];

-- Revenue stage for marketplace V2 (seed|series_a|series_b|series_c|series_d)
-- Note: V0 has text column `funding_stage` — this is a separate, structured column
ALTER TABLE products ADD COLUMN IF NOT EXISTS revenue_stage TEXT;

-- Geography market array (us|eu|india|asean|global)
ALTER TABLE products ADD COLUMN IF NOT EXISTS geography TEXT[];

-- Team size band (1-10|11-50|51-200|200+)
ALTER TABLE products ADD COLUMN IF NOT EXISTS team_size TEXT;

-- Capital raised (free text e.g. "$2.5M")
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_funding TEXT;

-- Rich media & profile URLs
ALTER TABLE products ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pitch_deck_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS demo_video_url TEXT;

-- Integration ecosystem (e.g. ['epic','cerner','salesforce'])
ALTER TABLE products ADD COLUMN IF NOT EXISTS integrations TEXT[];

-- ─── CHECK CONSTRAINTS ───────────────────────────────────────────────────────
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_vertical_check;
ALTER TABLE products ADD CONSTRAINT products_vertical_check
    CHECK (vertical IS NULL OR vertical IN (
        'healthcare','edtech','fintech','saas','hardware','hospitality'
    ));

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_revenue_stage_check;
ALTER TABLE products ADD CONSTRAINT products_revenue_stage_check
    CHECK (revenue_stage IS NULL OR revenue_stage IN (
        'seed','series_a','series_b','series_c','series_d'
    ));

-- ─── PERFORMANCE INDEXES ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_vertical ON products(vertical);
CREATE INDEX IF NOT EXISTS idx_products_healthcare_category ON products(healthcare_category);
CREATE INDEX IF NOT EXISTS idx_products_revenue_stage ON products(revenue_stage);
-- GIN indexes for array columns (enables @> containment queries)
CREATE INDEX IF NOT EXISTS idx_products_compliance ON products USING gin(compliance);
CREATE INDEX IF NOT EXISTS idx_products_geography ON products USING gin(geography);

-- ─── VERIFY MIGRATION ────────────────────────────────────────────────────────
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'products'
-- AND column_name IN (
--     'vertical','healthcare_category','compliance','revenue_stage',
--     'geography','team_size','total_funding','linkedin_url',
--     'pitch_deck_url','demo_video_url','integrations'
-- )
-- ORDER BY column_name;
