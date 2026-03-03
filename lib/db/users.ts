/**
 * lib/db/users.ts
 * Server-side database operations for the users table.
 * Import createAdminClient here — never use supabase (browser client) server-side.
 */
import { createAdminClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type UserRow = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']

/**
 * Upsert a user from Firebase Auth into the users table.
 * Called on every login to keep the DB in sync with Firebase.
 */
export async function upsertUser(firebaseUser: {
    uid: string
    email: string | null
    displayName: string | null
}): Promise<UserRow> {
    const admin = createAdminClient()

    const { data, error } = await admin
        .from('users')
        .upsert(
            {
                firebase_uid: firebaseUser.uid,
                email: firebaseUser.email ?? '',
                name: firebaseUser.displayName ?? '',
            },
            {
                onConflict: 'firebase_uid',
                ignoreDuplicates: false,
            }
        )
        .select()
        .single()

    if (error) throw new Error(`upsertUser failed: ${error.message}`)
    return data
}

/**
 * Get a user by their Firebase UID.
 */
export async function getUserByFirebaseUid(firebaseUid: string): Promise<UserRow | null> {
    const admin = createAdminClient()

    const { data, error } = await admin
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .is('deleted_at', null)
        .single()

    if (error) {
        if (error.code === 'PGRST116') return null // not found
        throw new Error(`getUserByFirebaseUid failed: ${error.message}`)
    }
    return data
}

/**
 * Mark onboarding as complete for a user.
 */
export async function completeOnboarding(userId: string): Promise<void> {
    const admin = createAdminClient()

    const { error } = await admin
        .from('users')
        .update({ has_completed_onboarding: true })
        .eq('id', userId)

    if (error) throw new Error(`completeOnboarding failed: ${error.message}`)
}

/**
 * Soft-delete a user (GDPR right to erasure).
 */
export async function softDeleteUser(userId: string): Promise<void> {
    const admin = createAdminClient()

    const { error } = await admin
        .from('users')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', userId)

    if (error) throw new Error(`softDeleteUser failed: ${error.message}`)
}
