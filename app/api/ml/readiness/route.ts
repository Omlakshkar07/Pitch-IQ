/**
 * app/api/ml/readiness/route.ts
 * Backend proxy for investment readiness calculation.
 *
 * Architecture:
 *   Browser → POST /api/ml/readiness (JSON)
 *     → [auth] → [call Render ML server-to-server]
 *     → [save result to DB] → return InvestmentReadinessResponse
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, authErrorResponse } from '@/lib/auth-helpers'
import { saveReadinessResult, writeAuditLog } from '@/lib/db'
import { mlCalculateReadiness } from '@/lib/ml-client'
import type { InvestmentReadinessResponse } from '@/lib/api'

export const maxDuration = 180 // 3 minutes — allows Render free-tier cold starts

export async function POST(req: NextRequest) {
    try {
        const { supabaseUserId } = await verifyAuth(req)

        const body = await req.json()
        const {
            analysis_id,
            pitch_deck_quality_score,
            monthly_revenue,
            arr,
            customer_count,
            revenue_growth_rate,
            team_size,
            runway_months,
            burn_rate,
            sector,
            stage,
            has_lead_investor,
        } = body

        // Call Render ML API server-to-server
        const mlResponse = await mlCalculateReadiness({
            analysis_id,
            pitch_deck_quality_score,
            monthly_revenue,
            arr,
            customer_count,
            revenue_growth_rate,
            team_size,
            runway_months,
            burn_rate,
            sector,
            stage,
            has_lead_investor,
        }) as InvestmentReadinessResponse

        // Persist result to Supabase
        const saved = await saveReadinessResult({
            user_id: supabaseUserId,
            analysis_id: analysis_id ?? null,
            overall_score: mlResponse.overall_readiness_score,
            readiness_level: mlResponse.readiness_level,
            pitch_deck_quality_score: mlResponse.component_scores.pitch_deck_quality ?? null,
            traction_metrics_score: mlResponse.component_scores.traction_metrics ?? null,
            team_strength_score: mlResponse.component_scores.team_strength ?? null,
            market_timing_score: mlResponse.component_scores.market_timing ?? null,
            financial_health_score: mlResponse.component_scores.financial_health ?? null,
            key_improvements: mlResponse.key_improvements ?? [],
            next_steps: mlResponse.next_steps ?? [],
            estimated_time_to_ready: mlResponse.estimated_time_to_ready ?? null,
            monthly_revenue_inr: monthly_revenue ?? null,
            arr_inr: arr ?? null,
            customer_count: customer_count ?? null,
            revenue_growth_rate_pct: revenue_growth_rate ?? null,
            team_size: team_size ?? null,
            runway_months: runway_months ?? null,
            burn_rate_inr: burn_rate ?? null,
            sector: sector ?? null,
            stage: stage ?? null,
            has_lead_investor: has_lead_investor ?? null,
        })

        await writeAuditLog({
            userId: supabaseUserId,
            action: 'readiness.calculate',
            entityType: 'investment_readiness_results',
            entityId: saved.id,
            metadata: {
                overallScore: mlResponse.overall_readiness_score,
                readinessLevel: mlResponse.readiness_level,
            },
        })

        return NextResponse.json({ ...mlResponse, _db_id: saved.id })
    } catch (error) {
        return authErrorResponse(error)
    }
}
