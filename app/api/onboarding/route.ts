/**
 * app/api/onboarding/route.ts
 * Saves startup profile from onboarding to Supabase.
 * Secured: requires valid Firebase ID token.
 */
import { NextRequest, NextResponse } from 'next/server'
import { upsertStartupProfile, completeOnboarding, writeAuditLog } from '@/lib/db'
import { verifyAuth, authErrorResponse } from '@/lib/auth-helpers'

export async function POST(req: NextRequest) {
    try {
        const { supabaseUserId } = await verifyAuth(req)

        const body = await req.json()
        const { startupName, description, sector, stage, location } = body

        if (!startupName || !sector || !stage || !location) {
            return NextResponse.json(
                { error: 'startupName, sector, stage, and location are required' },
                { status: 400 }
            )
        }

        // Validate input lengths
        const cleanName = String(startupName).slice(0, 200)
        const cleanDesc = description ? String(description).slice(0, 500) : null

        // Upsert the startup profile
        const profile = await upsertStartupProfile({
            user_id: supabaseUserId,
            startup_name: cleanName,
            description: cleanDesc,
            sector: String(sector).slice(0, 100),
            stage: String(stage).slice(0, 100),
            location: String(location).slice(0, 100),
            team_size: null,
            website: null,
        })

        // Mark onboarding complete
        await completeOnboarding(supabaseUserId)

        // Audit log
        await writeAuditLog({
            userId: supabaseUserId,
            action: 'user.onboarding_complete',
            entityType: 'startup_profile',
            entityId: profile.id,
            ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
        })

        return NextResponse.json({ success: true, profileId: profile.id })
    } catch (error) {
        return authErrorResponse(error)
    }
}
