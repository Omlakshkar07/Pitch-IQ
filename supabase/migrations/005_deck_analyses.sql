-- ============================================================
-- MIGRATION 005: Deck Analyses (immutable)
-- ============================================================

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
    -- JSONB columns for semi-structured AI output
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

-- Indexes
CREATE INDEX IF NOT EXISTS deck_analyses_deck_id_idx ON deck_analyses(deck_id);
CREATE INDEX IF NOT EXISTS deck_analyses_external_id_idx ON deck_analyses(external_analysis_id);
CREATE INDEX IF NOT EXISTS deck_analyses_overall_score_idx ON deck_analyses(overall_score DESC);
CREATE INDEX IF NOT EXISTS deck_analyses_analyzed_at_idx ON deck_analyses(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS deck_analyses_flags_gin_idx ON deck_analyses USING GIN (flags);

-- RLS
ALTER TABLE deck_analyses ENABLE ROW LEVEL SECURITY;

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
