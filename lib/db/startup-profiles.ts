/**
 * lib/db/startup-profiles.ts
 * DB operations for startup_profiles table.
 */
import { createAdminClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type ProfileRow = Database['public']['Tables']['startup_profiles']['Row']
type ProfileInsert = Database['public']['Tables']['startup_profiles']['Insert']

/**
 * Upsert startup profile (created on onboarding, updatable in Settings).
 */
export async function upsertStartupProfile(
    data: ProfileInsert
): Promise<ProfileRow> {
    const admin = createAdminClient()

    const { data: profile, error } = await admin
        .from('startup_profiles')
        .upsert(data, { onConflict: 'user_id' })
        .select()
        .single()

    if (error) throw new Error(`upsertStartupProfile failed: ${error.message}`)
    return profile
}

/**
 * Get startup profile for a user.
 */
export async function getStartupProfile(userId: string): Promise<ProfileRow | null> {
    const admin = createAdminClient()

    const { data, error } = await admin
        .from('startup_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error) {
        if (error.code === 'PGRST116') return null
        throw new Error(`getStartupProfile failed: ${error.message}`)
    }
    return data
}
