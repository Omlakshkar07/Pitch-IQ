/**
 * app/api/decks/route.ts
 * Creates a new deck record in Supabase after upload.
 * Secured: requires valid Firebase ID token.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createDeck, writeAuditLog } from '@/lib/db'
import { verifyAuth, authErrorResponse } from '@/lib/auth-helpers'

export async function POST(req: NextRequest) {
    try {
        const { supabaseUserId } = await verifyAuth(req)

        const body = await req.json()
        const {
            filename,
            fileSizeBytes,
            mimeType,
            sector,
            stage,
            revenue,
            teamSize,
            foundingYear,
            location,
            incorporationStatus,
            fundraisingStatus,
            fundRaised,
            founderName,
            founderEmail,
            founderPhone,
            analysisMode,
        } = body

        if (!filename || !fileSizeBytes) {
            return NextResponse.json(
                { error: 'filename and fileSizeBytes are required' },
                { status: 400 }
            )
        }

        const deck = await createDeck({
            user_id: supabaseUserId,
            filename: String(filename).slice(0, 255),
            file_size_bytes: fileSizeBytes,
            storage_url: '',
            mime_type: mimeType || 'application/pdf',
            status: 'analyzing',
            sector: sector || null,
            stage: stage || null,
            revenue_inr: revenue ? Number(revenue) : null,
            team_size: teamSize ? Number(teamSize) : null,
            founding_year: foundingYear ? Number(foundingYear) : null,
            location: location || null,
            incorporation_status: incorporationStatus || null,
            fundraising_status: fundraisingStatus || null,
            fund_raised: fundRaised ?? false,
            founder_name: founderName || null,
            founder_email: founderEmail || null,
            founder_phone: founderPhone || null,
            analysis_mode: analysisMode || null,
            deleted_at: null,
        })

        await writeAuditLog({
            userId: supabaseUserId,
            action: 'deck.upload',
            entityType: 'deck',
            entityId: deck.id,
            metadata: { filename, fileSizeBytes },
            ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
        })

        return NextResponse.json({ success: true, deckId: deck.id })
    } catch (error) {
        return authErrorResponse(error)
    }
}
