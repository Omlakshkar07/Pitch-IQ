/**
 * lib/db/audit.ts
 * Helpers for writing to the append-only audit_log.
 * Always use the admin client here — audit logs are write-only from the server.
 */
import { createAdminClient } from '@/lib/supabase'

type AuditAction =
    | 'user.signup'
    | 'user.login'
    | 'user.onboarding_complete'
    | 'deck.upload'
    | 'deck.analysis_complete'
    | 'deck.analysis_failed'
    | 'deck.delete'
    | 'readiness.calculate'
    | 'valuation.calculate'
    | 'user.delete_account'

export async function writeAuditLog(params: {
    userId?: string
    action: AuditAction
    entityType?: string
    entityId?: string
    metadata?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
}): Promise<void> {
    const admin = createAdminClient()

    const { error } = await admin.from('audit_log').insert({
        user_id: params.userId ?? null,
        action: params.action,
        entity_type: params.entityType ?? null,
        entity_id: params.entityId ?? null,
        metadata: params.metadata ?? null,
        ip_address: params.ipAddress ?? null,
        user_agent: params.userAgent ?? null,
    })

    // Audit logs should never throw — log silently
    if (error) {
        console.error('[audit_log] write failed:', error.message)
    }
}
