-- ============================================================
-- PitchIQ — MASTER MIGRATION (run this in Supabase SQL Editor)
-- Project: bfvccxpzwuyxxapgezli
-- Date: 2026-03-03
-- ============================================================

-- ================================================
-- 1. EXTENSIONS
-- ================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ================================================
-- 2. ENUMS
-- ================================================
DO $$ BEGIN
    CREATE TYPE deck_status AS ENUM ('pending', 'analyzing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE readiness_level AS ENUM ('Ready', 'Nearly Ready', 'Not Ready');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE confidence_level AS ENUM ('High', 'Medium', 'Low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ================================================
-- 3. UPDATED_AT TRIGGER FUNCTION
-- ================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 4. USERS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS users (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid             TEXT NOT NULL UNIQUE,
    email                    TEXT NOT NULL UNIQUE,
    name                     TEXT NOT NULL DEFAULT '',
    has_completed_onboarding BOOLEAN NOT NULL DEFAULT FALSE,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at               TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS users_firebase_uid_idx ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_active_idx ON users(id) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "service_role_all_users" ON users;

CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (firebase_uid = auth.jwt() ->> 'sub');
CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (firebase_uid = auth.jwt() ->> 'sub');
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (firebase_uid = auth.jwt() ->> 'sub');
CREATE POLICY "service_role_all_users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- ================================================
-- 5. STARTUP PROFILES TABLE (1:1 with users)
-- ================================================
CREATE TABLE IF NOT EXISTS startup_profiles (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    startup_name TEXT NOT NULL CHECK (char_length(startup_name) <= 200),
    description  TEXT CHECK (char_length(description) <= 500),
    sector       TEXT NOT NULL,
    stage        TEXT NOT NULL,
    location     TEXT NOT NULL,
    team_size    INT CHECK (team_size > 0 AND team_size < 100000),
    website      TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS startup_profiles_user_id_idx ON startup_profiles(user_id);
CREATE INDEX IF NOT EXISTS startup_profiles_sector_stage_idx ON startup_profiles(sector, stage);

DROP TRIGGER IF EXISTS startup_profiles_updated_at ON startup_profiles;
CREATE TRIGGER startup_profiles_updated_at
    BEFORE UPDATE ON startup_profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE startup_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "startup_profiles_own" ON startup_profiles;
DROP POLICY IF EXISTS "startup_profiles_service" ON startup_profiles;

CREATE POLICY "startup_profiles_own" ON startup_profiles
    FOR ALL USING (
        user_id = (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub' AND deleted_at IS NULL)
    );
CREATE POLICY "startup_profiles_service" ON startup_profiles
    FOR ALL USING (auth.role() = 'service_role');

-- ================================================
-- 6. DECKS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS decks (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename              TEXT NOT NULL,
    file_size_bytes       BIGINT NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 52428800),
    storage_url           TEXT NOT NULL DEFAULT '',
    mime_type             TEXT NOT NULL DEFAULT 'application/pdf',
    status                deck_status NOT NULL DEFAULT 'pending',
    sector                TEXT,
    stage                 TEXT,
    revenue_inr           NUMERIC(18,2),
    team_size             INT CHECK (team_size > 0),
    founding_year         SMALLINT CHECK (founding_year >= 1900 AND founding_year <= 2100),
    location              TEXT,
    incorporation_status  TEXT,
    fundraising_status    TEXT,
    fund_raised           BOOLEAN NOT NULL DEFAULT FALSE,
    founder_name          TEXT,
    founder_email         TEXT,
    founder_phone         TEXT,
    analysis_mode         TEXT,
    uploaded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at            TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS decks_user_id_uploaded_at_idx ON decks(user_id, uploaded_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS decks_user_id_status_idx ON decks(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS decks_status_idx ON decks(status);
CREATE INDEX IF NOT EXISTS decks_filename_trgm_idx ON decks USING GIN (filename gin_trgm_ops);
CREATE INDEX IF NOT EXISTS decks_active_idx ON decks(id) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS decks_updated_at ON decks;
CREATE TRIGGER decks_updated_at
    BEFORE UPDATE ON decks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "decks_own" ON decks;
DROP POLICY IF EXISTS "decks_service" ON decks;

CREATE POLICY "decks_own" ON decks
    FOR ALL USING (
        user_id = (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub' AND deleted_at IS NULL)
    );
CREATE POLICY "decks_service" ON decks
    FOR ALL USING (auth.role() = 'service_role');

-- ================================================
-- 7. DECK ANALYSES TABLE (immutable, 1:1 per deck)
-- ================================================
CREATE TABLE IF NOT EXISTS deck_analyses (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id               UUID NOT NULL REFERENCES decks(id) ON DELETE RESTRICT,
    external_analysis_id  TEXT UNIQUE,
    overall_score         SMALLINT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    idea_score            SMALLINT NOT NULL DEFAULT 0 CHECK (idea_score BETWEEN 0 AND 100),
    team_score            SMALLINT NOT NULL DEFAULT 0 CHECK (team_score BETWEEN 0 AND 100),
    market_score          SMALLINT NOT NULL DEFAULT 0 CHECK (market_score BETWEEN 0 AND 100),
    traction_score        SMALLINT NOT NULL DEFAULT 0 CHECK (traction_score BETWEEN 0 AND 100),
    risk_score            SMALLINT NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    scalability_score     SMALLINT NOT NULL DEFAULT 0 CHECK (scalability_score BETWEEN 0 AND 100),
    percentile            SMALLINT CHECK (percentile BETWEEN 0 AND 100),
    feedback              JSONB NOT NULL DEFAULT '{}',
    feedback_gaps         JSONB NOT NULL DEFAULT '{}',
    flags                 JSONB NOT NULL DEFAULT '{}',
    risk_flags            JSONB NOT NULL DEFAULT '{}',
    team_members          JSONB NOT NULL DEFAULT '[]',
    team_expertise        TEXT[] NOT NULL DEFAULT '{}',
    team_gaps             TEXT[] NOT NULL DEFAULT '{}',
    traction_metrics      JSONB NOT NULL DEFAULT '{}',
    traction_indicators   TEXT[] NOT NULL DEFAULT '{}',
    traction_missing      TEXT[] NOT NULL DEFAULT '{}',
    business_model        TEXT,
    business_model_traits TEXT[] NOT NULL DEFAULT '{}',
    market_problem        TEXT,
    market_solution       TEXT,
    improvement_items     JSONB NOT NULL DEFAULT '[]',
    improvements          TEXT[] NOT NULL DEFAULT '{}',
    strengths             TEXT[] NOT NULL DEFAULT '{}',
    critical_gaps         TEXT[] NOT NULL DEFAULT '{}',
    quick_wins            TEXT[] NOT NULL DEFAULT '{}',
    next_steps            JSONB NOT NULL DEFAULT '[]',
    analyzed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (deck_id)
);

CREATE INDEX IF NOT EXISTS deck_analyses_deck_id_idx ON deck_analyses(deck_id);
CREATE INDEX IF NOT EXISTS deck_analyses_external_id_idx ON deck_analyses(external_analysis_id);
CREATE INDEX IF NOT EXISTS deck_analyses_overall_score_idx ON deck_analyses(overall_score DESC);
CREATE INDEX IF NOT EXISTS deck_analyses_analyzed_at_idx ON deck_analyses(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS deck_analyses_flags_gin_idx ON deck_analyses USING GIN (flags);

ALTER TABLE deck_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deck_analyses_own" ON deck_analyses;
DROP POLICY IF EXISTS "deck_analyses_service" ON deck_analyses;

CREATE POLICY "deck_analyses_own" ON deck_analyses
    FOR ALL USING (
        deck_id IN (
            SELECT d.id FROM decks d
            INNER JOIN users u ON u.id = d.user_id
            WHERE u.firebase_uid = auth.jwt() ->> 'sub'
              AND u.deleted_at IS NULL
              AND d.deleted_at IS NULL
        )
    );
CREATE POLICY "deck_analyses_service" ON deck_analyses
    FOR ALL USING (auth.role() = 'service_role');

-- ================================================
-- 8. INVESTMENT READINESS RESULTS
-- ================================================
CREATE TABLE IF NOT EXISTS investment_readiness_results (
    id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_id               UUID REFERENCES deck_analyses(id) ON DELETE SET NULL,
    overall_score             SMALLINT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    readiness_level           readiness_level NOT NULL,
    pitch_deck_quality_score  SMALLINT CHECK (pitch_deck_quality_score BETWEEN 0 AND 100),
    traction_metrics_score    SMALLINT CHECK (traction_metrics_score BETWEEN 0 AND 100),
    team_strength_score       SMALLINT CHECK (team_strength_score BETWEEN 0 AND 100),
    market_timing_score       SMALLINT CHECK (market_timing_score BETWEEN 0 AND 100),
    financial_health_score    SMALLINT CHECK (financial_health_score BETWEEN 0 AND 100),
    key_improvements          TEXT[] NOT NULL DEFAULT '{}',
    next_steps                TEXT[] NOT NULL DEFAULT '{}',
    estimated_time_to_ready   TEXT,
    monthly_revenue_inr       NUMERIC(18,2),
    arr_inr                   NUMERIC(18,2),
    customer_count            INT CHECK (customer_count >= 0),
    revenue_growth_rate_pct   NUMERIC(7,2),
    team_size                 INT CHECK (team_size > 0),
    runway_months             SMALLINT CHECK (runway_months >= 0),
    burn_rate_inr             NUMERIC(18,2),
    sector                    TEXT,
    stage                     TEXT,
    has_lead_investor         BOOLEAN,
    calculated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS readiness_user_id_calc_at_idx ON investment_readiness_results(user_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS readiness_analysis_id_idx ON investment_readiness_results(analysis_id);

ALTER TABLE investment_readiness_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "readiness_own" ON investment_readiness_results;
DROP POLICY IF EXISTS "readiness_service" ON investment_readiness_results;

CREATE POLICY "readiness_own" ON investment_readiness_results
    FOR ALL USING (
        user_id = (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub' AND deleted_at IS NULL)
    );
CREATE POLICY "readiness_service" ON investment_readiness_results
    FOR ALL USING (auth.role() = 'service_role');

-- ================================================
-- 9. VALUATION RESULTS
-- ================================================
CREATE TABLE IF NOT EXISTS valuation_results (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sector                   TEXT NOT NULL,
    stage                    TEXT NOT NULL,
    valuation_low_cr         NUMERIC(18,2) NOT NULL,
    valuation_median_cr      NUMERIC(18,2) NOT NULL,
    valuation_high_cr        NUMERIC(18,2) NOT NULL,
    currency                 TEXT NOT NULL DEFAULT 'INR',
    confidence_level         confidence_level NOT NULL,
    methodology              TEXT,
    revenue_multiple         NUMERIC(8,2),
    comparable_companies     JSONB NOT NULL DEFAULT '[]',
    key_factors              TEXT[] NOT NULL DEFAULT '{}',
    valuation_tips           TEXT[] NOT NULL DEFAULT '{}',
    disclaimer               TEXT,
    revenue_inr              NUMERIC(18,2),
    arr_inr                  NUMERIC(18,2),
    mrr_inr                  NUMERIC(18,2),
    revenue_growth_rate_pct  NUMERIC(7,2),
    customer_count           INT,
    customer_growth_rate_pct NUMERIC(7,2),
    burn_rate_inr            NUMERIC(18,2),
    runway_months            SMALLINT,
    team_size                INT,
    gross_margin_pct         NUMERIC(7,2),
    calculated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS valuation_user_id_calc_at_idx ON valuation_results(user_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS valuation_sector_stage_idx ON valuation_results(sector, stage);

ALTER TABLE valuation_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "valuation_own" ON valuation_results;
DROP POLICY IF EXISTS "valuation_service" ON valuation_results;

CREATE POLICY "valuation_own" ON valuation_results
    FOR ALL USING (
        user_id = (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub' AND deleted_at IS NULL)
    );
CREATE POLICY "valuation_service" ON valuation_results
    FOR ALL USING (auth.role() = 'service_role');

-- ================================================
-- 10. AUDIT LOG (append-only)
-- ================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    entity_type TEXT,
    entity_id   UUID,
    metadata    JSONB,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_user_id_created_at_idx ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_entity_idx ON audit_log(entity_type, entity_id);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_read_own" ON audit_log;
DROP POLICY IF EXISTS "audit_service_all" ON audit_log;

CREATE POLICY "audit_read_own" ON audit_log
    FOR SELECT USING (
        user_id = (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub' AND deleted_at IS NULL)
    );
CREATE POLICY "audit_service_all" ON audit_log
    FOR ALL USING (auth.role() = 'service_role');

-- ================================================
-- VERIFICATION QUERY (run after migration to confirm)
-- ================================================
SELECT table_name, pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
