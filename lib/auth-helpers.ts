/**
 * lib/auth-helpers.ts
 * Server-side utilities for authenticating API requests.
 *
 * Every API route should call `verifyAuth(req)` to get the verified
 * Firebase user. This replaces the old pattern of trusting `uid` from
 * the request body.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from './firebase-admin'
import { getUserByFirebaseUid } from './db'

export interface VerifiedUser {
    firebaseUid: string
    email: string
    /** Supabase user UUID — undefined if user hasn't synced yet */
    supabaseUserId?: string
}

/**
 * Extract and verify the Firebase ID token from the Authorization header.
 * Returns the decoded token payload or throws.
 */
export async function verifyFirebaseToken(
    req: NextRequest
): Promise<{ uid: string; email: string }> {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        throw new AuthError('Missing or invalid Authorization header', 401)
    }

    const idToken = authHeader.slice(7) // strip "Bearer "
    if (!idToken) {
        throw new AuthError('Empty bearer token', 401)
    }

    try {
        const decoded = await getAdminAuth().verifyIdToken(idToken)
        return {
            uid: decoded.uid,
            email: decoded.email ?? '',
        }
    } catch (err: any) {
        if (err.code === 'auth/id-token-expired') {
            throw new AuthError('Token expired — please re-authenticate', 401)
        }
        throw new AuthError('Invalid authentication token', 401)
    }
}

/**
 * Full auth flow: verify token + resolve Supabase user.
 * Use this in routes that need the Supabase UUID.
 */
export async function verifyAuth(req: NextRequest): Promise<{
    firebaseUid: string
    email: string
    supabaseUserId: string
    hasCompletedOnboarding: boolean
}> {
    const { uid, email } = await verifyFirebaseToken(req)

    const user = await getUserByFirebaseUid(uid)
    if (!user) {
        throw new AuthError('User not found in database. Please complete sign-up.', 404)
    }

    return {
        firebaseUid: uid,
        email,
        supabaseUserId: user.id,
        hasCompletedOnboarding: user.has_completed_onboarding,
    }
}

/**
 * Custom error class for auth failures.
 * API routes can catch this and return the appropriate HTTP response.
 */
export class AuthError extends Error {
    status: number
    constructor(message: string, status: number = 401) {
        super(message)
        this.name = 'AuthError'
        this.status = status
    }
}

/**
 * Helper: create a JSON error response from an AuthError.
 */
export function authErrorResponse(err: unknown): NextResponse {
    if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[auth] unexpected error:', err)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
}
