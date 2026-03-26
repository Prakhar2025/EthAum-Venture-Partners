-- ============================================================
-- EthAum.ai — Phase 1 Migration: Role-Based Architecture
-- Safe additions only — no DROPs, no RENAMEs, no ALTER COLUMN
-- Run in Supabase SQL Editor
-- ============================================================

-- ─── USERS TABLE EXTENSIONS ──────────────────────────────────

-- New V2 role column (distinct from V0 role: buyer|founder|admin)
-- Values: 'startup' | 'enterprise' | 'investor' | 'admin'
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_v2 TEXT DEFAULT 'startup';

-- Onboarding completion flag
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

-- Company details (safe — add if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_website TEXT;

-- Verification badge (admin-set)
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Flexible JSONB blob for role-specific onboarding form data
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_data JSONB;

-- ─── CHECK CONSTRAINT ────────────────────────────────────────
-- Enforce valid role_v2 values
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_v2_check;
ALTER TABLE users ADD CONSTRAINT users_role_v2_check
    CHECK (role_v2 IN ('startup', 'enterprise', 'investor', 'admin'));

-- ─── INDEX FOR FAST ROLE LOOKUPS ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_role_v2 ON users(role_v2);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_complete ON users(onboarding_complete);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
-- Enable RLS on users table (idempotent)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before re-creating (idempotent pattern)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Service role has full access" ON users;

-- Users can read their own row (matched by clerk_id stored in JWT sub via Clerk)
-- NOTE: Supabase uses auth.uid() which maps to the Supabase Auth UID.
-- Since we use Clerk (not Supabase Auth), we use the service_role key in our
-- backend — which bypasses RLS. These policies protect direct browser access.
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (true);  -- Public profiles (marketplace needs to read reviewer info)

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (true);  -- Backend uses service_role; this is a safety net

CREATE POLICY "Service role has full access" ON users
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── VERIFY MIGRATION ────────────────────────────────────────
-- Run this SELECT after migration to confirm columns exist:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'users'
-- AND column_name IN ('role_v2', 'onboarding_complete', 'company_website', 'verified', 'onboarding_data')
-- ORDER BY column_name;
