/**
 * app/api/readiness/route.ts
 * Saves investment readiness calculation results to Supabase.
 * Secured: requires valid Firebase ID token.
 */
import { NextRequest, NextResponse } from 'next/server'
import { saveReadinessResult, getAllReadinessResults, writeAuditLog } from '@/lib/db'
import { verifyAuth, authErrorResponse } from '@/lib/auth-helpers'

export async function POST(req: NextRequest) {
    try {
        const { supabaseUserId } = await verifyAuth(req)

        const body = await req.json()
        const { result, inputs } = body

        if (!result || typeof result.overallScore !== 'number') {
            return NextResponse.json(
                { error: 'result with overallScore is required' },
                { status: 400 }
            )
        }

        const saved = await saveReadinessResult({
            user_id: supabaseUserId,
            analysis_id: result.analysisId ?? null,
            overall_score: result.overallScore,
            readiness_level: result.readinessLevel,
            pitch_deck_quality_score: result.componentScores?.pitchDeckQuality ?? null,
            traction_metrics_score: result.componentScores?.tractionMetrics ?? null,
            team_strength_score: result.componentScores?.teamStrength ?? null,
            market_timing_score: result.componentScores?.marketTiming ?? null,
            financial_health_score: result.componentScores?.financialHealth ?? null,
            key_improvements: result.keyImprovements ?? [],
            next_steps: result.nextSteps ?? [],
            estimated_time_to_ready: result.estimatedTimeToReady ?? null,
            // Input fields for auditability
            monthly_revenue_inr: inputs?.monthly_revenue ?? null,
            arr_inr: inputs?.arr ?? null,
            customer_count: inputs?.customer_count ?? null,
            revenue_growth_rate_pct: inputs?.revenue_growth_rate ?? null,
            team_size: inputs?.team_size ?? null,
            runway_months: inputs?.runway_months ?? null,
            burn_rate_inr: inputs?.burn_rate ?? null,
            sector: inputs?.sector ?? null,
            stage: inputs?.stage ?? null,
            has_lead_investor: inputs?.has_lead_investor ?? null,
        })

        await writeAuditLog({
            userId: supabaseUserId,
            action: 'readiness.calculate',
            entityType: 'investment_readiness_results',
            entityId: saved.id,
            metadata: { overallScore: result.overallScore, readinessLevel: result.readinessLevel },
        })

        return NextResponse.json({ success: true, id: saved.id })
    } catch (error) {
        return authErrorResponse(error)
    }
}

export async function GET(req: NextRequest) {
    try {
        const { supabaseUserId } = await verifyAuth(req)
        const results = await getAllReadinessResults(supabaseUserId)
        return NextResponse.json({ results })
    } catch (error) {
        return authErrorResponse(error)
    }
}
