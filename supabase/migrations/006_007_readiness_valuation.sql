-- ============================================================
-- MIGRATION 006: Investment Readiness Results
-- ============================================================

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
    -- Guidance output
    key_improvements          TEXT[] NOT NULL DEFAULT '{}',
    next_steps                TEXT[] NOT NULL DEFAULT '{}',
    estimated_time_to_ready   TEXT,
    -- Input snapshot (denormalized for auditability)
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

-- Indexes
CREATE INDEX IF NOT EXISTS readiness_user_id_calc_at_idx ON investment_readiness_results(user_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS readiness_analysis_id_idx ON investment_readiness_results(analysis_id);

-- RLS
ALTER TABLE investment_readiness_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "readiness_own" ON investment_readiness_results
    FOR ALL USING (
        user_id = (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub' AND deleted_at IS NULL)
    );

CREATE POLICY "readiness_service" ON investment_readiness_results
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- MIGRATION 007: Valuation Results
-- ============================================================

CREATE TABLE IF NOT EXISTS valuation_results (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Output
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
    -- Input snapshot
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

-- Indexes
CREATE INDEX IF NOT EXISTS valuation_user_id_calc_at_idx ON valuation_results(user_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS valuation_sector_stage_idx ON valuation_results(sector, stage);

-- RLS
ALTER TABLE valuation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "valuation_own" ON valuation_results
    FOR ALL USING (
        user_id = (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub' AND deleted_at IS NULL)
    );

CREATE POLICY "valuation_service" ON valuation_results
    FOR ALL USING (auth.role() = 'service_role');
