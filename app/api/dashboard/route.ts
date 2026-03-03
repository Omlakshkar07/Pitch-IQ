/**
 * app/api/dashboard/route.ts
 * Fetches dashboard data: decks, analyses, and readiness results.
 * Secured: requires valid Firebase ID token.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getDecksByUserId, getAnalysesByUserId, getLatestReadiness } from '@/lib/db'
import { verifyAuth, authErrorResponse } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
    try {
        const { supabaseUserId } = await verifyAuth(req)

        const [decks, analyses, latestReadiness] = await Promise.all([
            getDecksByUserId(supabaseUserId),
            getAnalysesByUserId(supabaseUserId),
            getLatestReadiness(supabaseUserId),
        ])

        return NextResponse.json({ decks, analyses, latestReadiness })
    } catch (error) {
        return authErrorResponse(error)
    }
}
