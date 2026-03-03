/**
 * app/api/valuation-result/route.ts
 * Saves valuation benchmark results to Supabase.
 * Secured: requires valid Firebase ID token.
 */
import { NextRequest, NextResponse } from 'next/server'
import { saveValuationResult, getAllValuationResults, writeAuditLog } from '@/lib/db'
import { verifyAuth, authErrorResponse } from '@/lib/auth-helpers'

export async function POST(req: NextRequest) {
    try {
        const { supabaseUserId } = await verifyAuth(req)

        const body = await req.json()
        const { result, inputs } = body

        if (!result || !result.sector || !result.stage) {
            return NextResponse.json(
                { error: 'result with sector and stage is required' },
                { status: 400 }
            )
        }

        const saved = await saveValuationResult({
            user_id: supabaseUserId,
            sector: result.sector,
            stage: result.stage,
            valuation_low_cr: result.valuationBand?.low ?? 0,
            valuation_median_cr: result.valuationBand?.median ?? 0,
            valuation_high_cr: result.valuationBand?.high ?? 0,
            currency: result.valuationBand?.currency ?? 'INR',
            confidence_level: result.confidenceLevel,
            methodology: result.methodology ?? null,
            revenue_multiple: result.revenueMultiple ?? null,
            comparable_companies: result.comparableCompanies ?? [],
            key_factors: result.keyFactors ?? [],
            valuation_tips: result.valuationTips ?? [],
            disclaimer: result.disclaimer ?? null,
            // Raw input fields for auditability
            revenue_inr: inputs?.revenue ?? null,
            arr_inr: inputs?.arr ?? null,
            mrr_inr: inputs?.mrr ?? null,
            revenue_growth_rate_pct: inputs?.revenue_growth_rate ?? null,
            customer_count: inputs?.customer_count ?? null,
            customer_growth_rate_pct: inputs?.customer_growth_rate ?? null,
            burn_rate_inr: inputs?.burn_rate ?? null,
            runway_months: inputs?.runway_months ?? null,
            team_size: inputs?.team_size ?? null,
            gross_margin_pct: inputs?.gross_margin ?? null,
        })

        await writeAuditLog({
            userId: supabaseUserId,
            action: 'valuation.calculate',
            entityType: 'valuation_results',
            entityId: saved.id,
            metadata: {
                sector: result.sector,
                stage: result.stage,
                median_cr: result.valuationBand?.median,
            },
        })

        return NextResponse.json({ success: true, id: saved.id })
    } catch (error) {
        return authErrorResponse(error)
    }
}

export async function GET(req: NextRequest) {
    try {
        const { supabaseUserId } = await verifyAuth(req)
        const results = await getAllValuationResults(supabaseUserId)
        return NextResponse.json({ results })
    } catch (error) {
        return authErrorResponse(error)
    }
}
