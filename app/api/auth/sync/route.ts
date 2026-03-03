/**
 * app/api/auth/sync/route.ts
 *
 * Called immediately after Firebase login/signup to sync the user
 * into our Supabase PostgreSQL users table.
 *
 * The client sends their Firebase ID token in the Authorization header.
 * We verify it server-side with Firebase Admin, then upsert into Supabase.
 */
import { NextRequest, NextResponse } from 'next/server'
import { upsertUser, writeAuditLog } from '@/lib/db'
import { verifyFirebaseToken, authErrorResponse } from '@/lib/auth-helpers'

export async function POST(req: NextRequest) {
    try {
        // Verify the Firebase ID token from the Authorization header
        const { uid, email } = await verifyFirebaseToken(req)

        // Read optional display name from body
        const body = await req.json().catch(() => ({}))
        const displayName = body.displayName ?? body.name ?? ''

        // Upsert user into Supabase
        const user = await upsertUser({ uid, email, displayName })

        // Log the sync event
        await writeAuditLog({
            userId: user.id,
            action: 'user.login',
            entityType: 'user',
            entityId: user.id,
            metadata: { firebase_uid: uid },
            ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
            userAgent: req.headers.get('user-agent') ?? undefined,
        })

        return NextResponse.json({
            supabaseUserId: user.id,
            hasCompletedOnboarding: user.has_completed_onboarding,
        })
    } catch (error) {
        return authErrorResponse(error)
    }
}
