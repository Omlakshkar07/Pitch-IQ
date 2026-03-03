/**
 * app/api/ml/valuation/route.ts
 * Backend proxy for valuation benchmarking.
 *
 * Architecture:
 *   Browser → POST /api/ml/valuation (JSON)
 *     → [auth] → [call Render ML server-to-server]
 *     → [save result to DB] → return ValuationBenchmarkResponse
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, authErrorResponse } from '@/lib/auth-helpers'
import { saveValuationResult, writeAuditLog } from '@/lib/db'
import { mlGetValuationBenchmark } from '@/lib/ml-client'
import type { ValuationBenchmarkResponse } from '@/lib/api'

export const maxDuration = 180 // 3 minutes — allows Render free-tier cold starts

export async function POST(req: NextRequest) {
    try {
        const { supabaseUserId } = await verifyAuth(req)

        const body = await req.json()
        const {
            sector,
            stage,
            revenue,
            arr,
            mrr,
            revenue_growth_rate,
            customer_count,
            customer_growth_rate,
            burn_rate,
            runway_months,
            team_size,
            gross_margin,
            net_revenue_retention,
            ltv_cac_ratio,
        } = body

        if (!sector || !stage) {
            return NextResponse.json(
                { error: 'sector and stage are required' },
                { status: 400 }
            )
        }

        // Call Render ML API server-to-server
        const mlResponse = await mlGetValuationBenchmark({
            sector,
            stage,
            revenue,
            arr,
            mrr,
            revenue_growth_rate,
            customer_count,
            customer_growth_rate,
            burn_rate,
            runway_months,
            team_size,
            gross_margin,
            net_revenue_retention,
            ltv_cac_ratio,
        }) as ValuationBenchmarkResponse

        // Persist result to Supabase
        const saved = await saveValuationResult({
            user_id: supabaseUserId,
            sector,
            stage,
            valuation_low_cr: mlResponse.valuation_band?.low ?? 0,
            valuation_median_cr: mlResponse.valuation_band?.median ?? 0,
            valuation_high_cr: mlResponse.valuation_band?.high ?? 0,
            currency: mlResponse.valuation_band?.currency ?? 'INR',
            confidence_level: mlResponse.confidence_level,
            methodology: mlResponse.methodology ?? null,
            revenue_multiple: mlResponse.revenue_multiple ?? null,
            comparable_companies: mlResponse.comparable_companies ?? [],
            key_factors: mlResponse.key_factors ?? [],
            valuation_tips: mlResponse.valuation_tips ?? [],
            disclaimer: mlResponse.disclaimer ?? null,
            revenue_inr: revenue ?? null,
            arr_inr: arr ?? null,
            mrr_inr: mrr ?? null,
            revenue_growth_rate_pct: revenue_growth_rate ?? null,
            customer_count: customer_count ?? null,
            customer_growth_rate_pct: customer_growth_rate ?? null,
            burn_rate_inr: burn_rate ?? null,
            runway_months: runway_months ?? null,
            team_size: team_size ?? null,
            gross_margin_pct: gross_margin ?? null,
        })

        await writeAuditLog({
            userId: supabaseUserId,
            action: 'valuation.calculate',
            entityType: 'valuation_results',
            entityId: saved.id,
            metadata: {
                sector,
                stage,
                median_cr: mlResponse.valuation_band?.median,
                confidence: mlResponse.confidence_level,
            },
        })

        return NextResponse.json({ ...mlResponse, _db_id: saved.id })
    } catch (error) {
        return authErrorResponse(error)
    }
}
