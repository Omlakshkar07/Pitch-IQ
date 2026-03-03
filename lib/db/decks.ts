/**
 * lib/db/decks.ts
 * DB operations for decks and deck_analyses tables.
 */
import { createAdminClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type DeckRow = Database['public']['Tables']['decks']['Row']
type DeckInsert = Database['public']['Tables']['decks']['Insert']
type AnalysisRow = Database['public']['Tables']['deck_analyses']['Row']
type AnalysisInsert = Database['public']['Tables']['deck_analyses']['Insert']

// ─── DECKS ────────────────────────────────────────────────────────────────────

/**
 * Create a new deck record when the user starts an upload+analysis.
 */
export async function createDeck(data: DeckInsert): Promise<DeckRow> {
    const admin = createAdminClient()

    const { data: deck, error } = await admin
        .from('decks')
        .insert(data)
        .select()
        .single()

    if (error) throw new Error(`createDeck failed: ${error.message}`)
    return deck
}

/**
 * Get all decks for a user (active only, sorted newest first).
 */
export async function getDecksByUserId(userId: string): Promise<DeckRow[]> {
    const admin = createAdminClient()

    const { data, error } = await admin
        .from('decks')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('uploaded_at', { ascending: false })

    if (error) throw new Error(`getDecksByUserId failed: ${error.message}`)
    return data ?? []
}

/**
 * Update deck status (e.g., 'analyzing' -> 'completed' | 'failed').
 * Requires userId to enforce ownership — prevents IDOR.
 */
export async function updateDeckStatus(
    deckId: string,
    status: DeckRow['status'],
    userId: string
): Promise<void> {
    const admin = createAdminClient()

    const { error } = await admin
        .from('decks')
        .update({ status })
        .eq('id', deckId)
        .eq('user_id', userId)

    if (error) throw new Error(`updateDeckStatus failed: ${error.message}`)
}

/**
 * Soft-delete a deck (sets deleted_at). Preserves analysis data temporarily.
 */
export async function softDeleteDeck(deckId: string, userId: string): Promise<void> {
    const admin = createAdminClient()

    // Guard: only delete decks belonging to this user
    const { error } = await admin
        .from('decks')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', deckId)
        .eq('user_id', userId)

    if (error) throw new Error(`softDeleteDeck failed: ${error.message}`)

    // Hard-delete the analysis (no value in keeping it if deck is gone)
    await admin.from('deck_analyses').delete().eq('deck_id', deckId)
}

// ─── ANALYSES ────────────────────────────────────────────────────────────────

/**
 * Save analysis result returned by the AI backend.
 * Idempotent — subsequent calls with same deck_id are ignored.
 */
export async function saveAnalysis(data: AnalysisInsert): Promise<AnalysisRow> {
    const admin = createAdminClient()

    const { data: analysis, error } = await admin
        .from('deck_analyses')
        .upsert(data, {
            onConflict: 'deck_id',
            ignoreDuplicates: false, // overwrite — allows re-analysis of the same deck
        })
        .select()
        .single()

    if (error) throw new Error(`saveAnalysis failed: ${error.message}`)
    return analysis
}

/**
 * Get analysis by its UUID, scoped to the given user.
 * Joins through decks to verify the user owns the deck.
 */
export async function getAnalysisById(analysisId: string, userId: string): Promise<AnalysisRow | null> {
    const admin = createAdminClient()

    const { data, error } = await admin
        .from('deck_analyses')
        .select(`
      *,
      decks!inner(user_id)
    `)
        .eq('id', analysisId)
        .eq('decks.user_id', userId)
        .single()

    if (error) {
        if (error.code === 'PGRST116') return null
        throw new Error(`getAnalysisById failed: ${error.message}`)
    }
    return data
}

/**
 * Get all analyses for a user (joined through decks).
 * Returns analysis + deck filename and upload date.
 */
export async function getAnalysesByUserId(userId: string) {
    const admin = createAdminClient()

    const { data, error } = await admin
        .from('deck_analyses')
        .select(`
      *,
      decks!inner(
        id,
        filename,
        uploaded_at,
        status,
        user_id,
        deleted_at
      )
    `)
        .eq('decks.user_id', userId)
        .is('decks.deleted_at', null)
        .order('analyzed_at', { ascending: false })

    if (error) throw new Error(`getAnalysesByUserId failed: ${error.message}`)
    return data ?? []
}

/**
 * Get two analyses for comparison (validates ownership).
 */
export async function getAnalysesForComparison(
    deckIds: [string, string],
    userId: string
): Promise<AnalysisRow[]> {
    const admin = createAdminClient()

    const { data, error } = await admin
        .from('deck_analyses')
        .select(`
      *,
      decks!inner(id, filename, user_id, deleted_at)
    `)
        .in('deck_id', deckIds)
        .eq('decks.user_id', userId)
        .is('decks.deleted_at', null)

    if (error) throw new Error(`getAnalysesForComparison failed: ${error.message}`)
    return data ?? []
}

/**
 * Score progression for dashboard chart.
 */
export async function getScoreProgression(userId: string) {
    const admin = createAdminClient()

    const { data, error } = await admin
        .from('deck_analyses')
        .select(`
      overall_score,
      analyzed_at,
      decks!inner(filename, user_id, deleted_at)
    `)
        .eq('decks.user_id', userId)
        .is('decks.deleted_at', null)
        .order('analyzed_at', { ascending: true })

    if (error) throw new Error(`getScoreProgression failed: ${error.message}`)
    return data ?? []
}
