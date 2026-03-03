/**
 * lib/db/readiness-valuation.ts
 * DB operations for investment_readiness_results and valuation_results.
 */
import { createAdminClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type ReadinessInsert = Database['public']['Tables']['investment_readiness_results']['Insert']
type ReadinessRow = Database['public']['Tables']['investment_readiness_results']['Row']
type ValuationInsert = Database['public']['Tables']['valuation_results']['Insert']
type ValuationRow = Database['public']['Tables']['valuation_results']['Row']

// ─── INVESTMENT READINESS ─────────────────────────────────────────────────────

export async function saveReadinessResult(data: ReadinessInsert): Promise<ReadinessRow> {
    const admin = createAdminClient()

    const { data: result, error } = await admin
        .from('investment_readiness_results')
        .insert(data)
        .select()
        .single()

    if (error) throw new Error(`saveReadinessResult failed: ${error.message}`)
    return result
}

export async function getLatestReadiness(userId: string): Promise<ReadinessRow | null> {
    const admin = createAdminClient()

    const { data, error } = await admin
        .from('investment_readiness_results')
        .select('*')
        .eq('user_id', userId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) throw new Error(`getLatestReadiness failed: ${error.message}`)
    return data
}

export async function getAllReadinessResults(userId: string): Promise<ReadinessRow[]> {
    const admin = createAdminClient()

    const { data, error } = await admin
        .from('investment_readiness_results')
        .select('*')
        .eq('user_id', userId)
        .order('calculated_at', { ascending: false })

    if (error) throw new Error(`getAllReadinessResults failed: ${error.message}`)
    return data ?? []
}

// ─── VALUATION ────────────────────────────────────────────────────────────────

export async function saveValuationResult(data: ValuationInsert): Promise<ValuationRow> {
    const admin = createAdminClient()

    const { data: result, error } = await admin
        .from('valuation_results')
        .insert(data)
        .select()
        .single()

    if (error) throw new Error(`saveValuationResult failed: ${error.message}`)
    return result
}

export async function getLatestValuation(userId: string): Promise<ValuationRow | null> {
    const admin = createAdminClient()

    const { data, error } = await admin
        .from('valuation_results')
        .select('*')
        .eq('user_id', userId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) throw new Error(`getLatestValuation failed: ${error.message}`)
    return data
}

export async function getAllValuationResults(userId: string): Promise<ValuationRow[]> {
    const admin = createAdminClient()

    const { data, error } = await admin
        .from('valuation_results')
        .select('*')
        .eq('user_id', userId)
        .order('calculated_at', { ascending: false })

    if (error) throw new Error(`getAllValuationResults failed: ${error.message}`)
    return data ?? []
}
