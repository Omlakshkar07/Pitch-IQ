-- ============================================================
-- MIGRATION 003: Startup Profiles (1:1 with users)
-- ============================================================

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

-- Indexes
CREATE INDEX IF NOT EXISTS startup_profiles_user_id_idx ON startup_profiles(user_id);
CREATE INDEX IF NOT EXISTS startup_profiles_sector_stage_idx ON startup_profiles(sector, stage);

-- Trigger
CREATE TRIGGER startup_profiles_updated_at
    BEFORE UPDATE ON startup_profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE startup_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "startup_profiles_own" ON startup_profiles
    FOR ALL USING (
        user_id = (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub' AND deleted_at IS NULL)
    );

CREATE POLICY "startup_profiles_service" ON startup_profiles
    FOR ALL USING (auth.role() = 'service_role');
