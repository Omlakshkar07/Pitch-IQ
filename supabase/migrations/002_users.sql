-- ============================================================
-- MIGRATION 002: Users Table
-- ============================================================

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

-- Indexes
CREATE INDEX IF NOT EXISTS users_firebase_uid_idx ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_deleted_at_idx ON users(deleted_at) WHERE deleted_at IS NULL;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own row
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (firebase_uid = auth.jwt() ->> 'sub');

CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (firebase_uid = auth.jwt() ->> 'sub');

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (firebase_uid = auth.jwt() ->> 'sub');

-- Service role bypasses RLS (for server-side sync)
CREATE POLICY "service_role_all" ON users
    FOR ALL USING (auth.role() = 'service_role');
