/**
 * app/api/analyses/route.ts
 * Saves analysis result to Supabase after AI processing completes.
 * Secured: requires valid Firebase ID token + verifies deck ownership.
 */
import { NextRequest, NextResponse } from 'next/server'
import { saveAnalysis, updateDeckStatus, writeAuditLog, getDecksByUserId } from '@/lib/db'
import { verifyAuth, AuthError, authErrorResponse } from '@/lib/auth-helpers'

export async function POST(req: NextRequest) {
    try {
        const { supabaseUserId } = await verifyAuth(req)

        const body = await req.json()
        const { deckId, analysis } = body

        if (!deckId || !analysis) {
            return NextResponse.json(
                { error: 'deckId and analysis are required' },
                { status: 400 }
            )
        }

        // Verify the deck belongs to the authenticated user
        const userDecks = await getDecksByUserId(supabaseUserId)
        const ownsDeck = userDecks.some((d) => d.id === deckId)
        if (!ownsDeck) {
            throw new AuthError('Deck not found or not owned by the authenticated user', 403)
        }

        // Save analysis to Supabase (idempotent)
        const saved = await saveAnalysis({
            deck_id: deckId,
            // external_analysis_id is the UUID returned by the ML API
            external_analysis_id: analysis.id || null,
            // Scores live at the top level of DeckAnalysis (not nested under .scores)
            overall_score: Math.round(analysis.overallScore ?? 0),
            idea_score: Math.round(analysis.ideaScore ?? 0),
            team_score: Math.round(analysis.teamScore ?? 0),
            market_score: Math.round(analysis.marketScore ?? 0),
            traction_score: Math.round(analysis.tractionScore ?? 0),
            risk_score: Math.round(analysis.riskScore ?? 0),
            scalability_score: Math.round(analysis.scalabilityScore ?? 0),
            percentile: analysis.percentile != null ? Math.round(analysis.percentile) : null,
            feedback: analysis.feedback ?? {},
            feedback_gaps: analysis.feedbackGaps ?? {},
            flags: analysis.flags ?? {},
            risk_flags: analysis.riskFlags ?? {},
            team_members: analysis.teamMembers ?? [],
            team_expertise: analysis.teamExpertise ?? [],
            team_gaps: analysis.teamGaps ?? [],
            traction_metrics: analysis.tractionMetrics ?? {},
            traction_indicators: analysis.tractionIndicators ?? [],
            traction_missing: analysis.tractionMissing ?? [],
            business_model: analysis.businessModel ?? null,
            business_model_traits: analysis.businessModelTraits ?? [],
            market_problem: analysis.marketProblem ?? null,
            market_solution: analysis.marketSolution ?? null,
            improvement_items: analysis.improvementItems ?? [],
            improvements: analysis.improvements ?? [],
            strengths: analysis.strengths ?? [],
            critical_gaps: analysis.criticalGaps ?? [],
            quick_wins: analysis.quickWins ?? [],
            next_steps: analysis.nextSteps ?? [],
            analyzed_at: analysis.analyzedAt ?? new Date().toISOString(),
        })

        // Mark deck as completed (ownership-checked)
        await updateDeckStatus(deckId, 'completed', supabaseUserId)

        await writeAuditLog({
            userId: supabaseUserId,
            action: 'deck.analysis_complete',
            entityType: 'deck_analysis',
            entityId: saved.id,
            metadata: { deckId, overallScore: analysis.overallScore },
        })

        return NextResponse.json({ success: true, analysisId: saved.id })
    } catch (error) {
        return authErrorResponse(error)
    }
}
