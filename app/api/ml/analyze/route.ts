/**
 * app/api/ml/analyze/route.ts
 *
 * Backend proxy for pitch deck analysis.
 * 
 * Architecture:
 *   Browser → POST /api/ml/analyze (multipart) 
 *     → [auth] → [create deck in DB] → [call Render ML server-to-server]
 *     → [map response] → [save analysis to DB] → return DeckAnalysis
 *
 * Benefits over browser-direct approach:
 *   - No CORS dependency on Render service
 *   - ML API URL never exposed to client bundle
 *   - Auth enforced BEFORE any ML computation
 *   - Atomic: deck + analysis created in same server turn
 */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, authErrorResponse } from '@/lib/auth-helpers'
import { createDeck, saveAnalysis, updateDeckStatus, writeAuditLog } from '@/lib/db'
import { mlAnalyzePitchDeck } from '@/lib/ml-client'
import { mapApiResponseToAnalysis } from '@/lib/mock-data'
import type { AnalyzeResponse } from '@/lib/api'

export const maxDuration = 300 // 5 minutes — allows Render free-tier cold starts

export async function POST(req: NextRequest) {
    try {
        const { supabaseUserId } = await verifyAuth(req)

        // Parse the multipart form sent by the browser
        const form = await req.formData()
        const file = form.get('file') as File | null
        const sector = (form.get('sector') as string) || ''
        const stage = (form.get('stage') as string) || ''
        const revenue = form.get('revenue') ? Number(form.get('revenue')) : null
        const teamSize = form.get('team_size') ? Number(form.get('team_size')) : null
        const foundedYear = form.get('founded_year') ? Number(form.get('founded_year')) : null
        const location = (form.get('location') as string) || null
        const incorporationStatus = (form.get('incorporation_status') as string) || null
        const fundraisingStatus = (form.get('fundraising_status') as string) || null
        const fundRaised = form.get('fund_raised') === 'true'
        const founderName = (form.get('founder_name') as string) || null
        const founderEmail = (form.get('founder_email') as string) || null
        const founderPhone = (form.get('founder_phone') as string) || null
        const analysisMode = (form.get('analysis_mode') as string) || null

        if (!file) {
            return NextResponse.json({ error: 'file is required' }, { status: 400 })
        }
        if (!sector || !stage) {
            return NextResponse.json({ error: 'sector and stage are required' }, { status: 400 })
        }

        // 1. Create deck record in Supabase (status: analyzing)
        const deck = await createDeck({
            user_id: supabaseUserId,
            filename: file.name.slice(0, 255),
            file_size_bytes: file.size,
            storage_url: '',
            mime_type: file.type || 'application/pdf',
            status: 'analyzing',
            sector: sector || null,
            stage: stage || null,
            revenue_inr: revenue,
            team_size: teamSize,
            founding_year: foundedYear,
            location,
            incorporation_status: incorporationStatus,
            fundraising_status: fundraisingStatus,
            fund_raised: fundRaised,
            founder_name: founderName,
            founder_email: founderEmail,
            founder_phone: founderPhone,
            analysis_mode: analysisMode,
            deleted_at: null,
        })

        // 2. Call Render ML API server-to-server (no CORS, no cold-start UX block)
        let mlResponse: AnalyzeResponse
        try {
            mlResponse = await mlAnalyzePitchDeck({
                file,
                filename: file.name,
                sector,
                stage,
                revenue,
                team_size: teamSize,
                founded_year: foundedYear,
                location,
            }) as AnalyzeResponse
        } catch (mlErr: any) {
            // Mark deck as failed so the user can retry
            await updateDeckStatus(deck.id, 'failed', supabaseUserId).catch(console.error)
            await writeAuditLog({
                userId: supabaseUserId,
                action: 'deck.analysis_failed',
                entityType: 'deck',
                entityId: deck.id,
                metadata: { error: mlErr?.message },
            }).catch(console.error)
            return NextResponse.json(
                { error: mlErr?.message ?? 'ML analysis failed' },
                { status: 502 }
            )
        }

        // 3. Map ML response → DeckAnalysis shape
        const analysis = mapApiResponseToAnalysis(mlResponse, deck.id)

        // 4. Save analysis to Supabase
        const saved = await saveAnalysis({
            deck_id: deck.id,
            external_analysis_id: analysis.id || null,
            overall_score: Math.round(analysis.overallScore ?? 0),
            idea_score: Math.round(analysis.ideaScore ?? 0),
            team_score: Math.round(analysis.teamScore ?? 0),
            market_score: Math.round(analysis.marketScore ?? 0),
            traction_score: Math.round(analysis.tractionScore ?? 0),
            risk_score: Math.round(analysis.riskScore ?? 0),
            scalability_score: Math.round(analysis.scalabilityScore ?? 0),
            percentile: analysis.percentile != null ? Math.round(analysis.percentile) : null,
            feedback: analysis.feedback ?? {},
            feedback_gaps: (analysis.feedbackGaps ?? {}) as unknown as Record<string, string[]>,
            flags: analysis.flags ?? {},
            risk_flags: analysis.riskFlags ?? {},
            team_members: analysis.teamMembers ?? [],
            team_expertise: analysis.teamExpertise ?? [],
            team_gaps: analysis.teamGaps ?? [],
            traction_metrics: (analysis.tractionMetrics ?? {}) as unknown as Record<string, string | number>,
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

        // 5. Mark deck as completed
        await updateDeckStatus(deck.id, 'completed', supabaseUserId)

        // 6. Audit log
        await writeAuditLog({
            userId: supabaseUserId,
            action: 'deck.analysis_complete',
            entityType: 'deck_analysis',
            entityId: saved.id,
            metadata: {
                deckId: deck.id,
                overallScore: analysis.overallScore,
                externalAnalysisId: analysis.id,
            },
            ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
        })

        // Return the full analysis + deckId so the frontend can navigate
        return NextResponse.json({
            success: true,
            deckId: deck.id,
            analysisId: saved.id,
            analysis,
        })
    } catch (error) {
        return authErrorResponse(error)
    }
}
