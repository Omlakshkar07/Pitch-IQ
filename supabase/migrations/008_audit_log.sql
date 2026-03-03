-- ============================================================
-- MIGRATION 008: Audit Log (append-only)
-- ============================================================

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

-- Indexes
CREATE INDEX IF NOT EXISTS audit_user_id_created_at_idx ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_entity_idx ON audit_log(entity_type, entity_id);

-- RLS — users can read their own audit entries; only service role writes
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_read_own" ON audit_log
    FOR SELECT USING (
        user_id = (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub' AND deleted_at IS NULL)
    );

CREATE POLICY "audit_service_all" ON audit_log
    FOR ALL USING (auth.role() = 'service_role');

-- Prevent updates to audit log (strict append-only)
CREATE RULE audit_no_update AS ON UPDATE TO audit_log DO INSTEAD NOTHING;
CREATE RULE audit_no_delete AS ON DELETE TO audit_log DO INSTEAD NOTHING;
