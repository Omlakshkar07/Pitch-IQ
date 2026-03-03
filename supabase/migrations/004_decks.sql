-- ============================================================
-- MIGRATION 004: Decks Table
-- ============================================================

CREATE TABLE IF NOT EXISTS decks (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename              TEXT NOT NULL,
    file_size_bytes       BIGINT NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 52428800),
    storage_url           TEXT NOT NULL DEFAULT '',
    mime_type             TEXT NOT NULL DEFAULT 'application/pdf',
    status                deck_status NOT NULL DEFAULT 'pending',
    -- Startup metadata snapshot at upload time
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

-- Indexes
CREATE INDEX IF NOT EXISTS decks_user_id_uploaded_at_idx ON decks(user_id, uploaded_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS decks_user_id_status_idx ON decks(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS decks_status_idx ON decks(status);
CREATE INDEX IF NOT EXISTS decks_filename_trgm_idx ON decks USING GIN (filename gin_trgm_ops);
CREATE INDEX IF NOT EXISTS decks_deleted_at_idx ON decks(deleted_at) WHERE deleted_at IS NULL;

-- Trigger
CREATE TRIGGER decks_updated_at
    BEFORE UPDATE ON decks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "decks_own" ON decks
    FOR ALL USING (
        user_id = (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub' AND deleted_at IS NULL)
    );

CREATE POLICY "decks_service" ON decks
    FOR ALL USING (auth.role() = 'service_role');
