import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that require authentication here
const protectedPaths = [
    '/dashboard',
    '/upload',
    '/analyses',
    '/settings',
    '/onboarding'
]

// Add paths that authenticated users shouldn't access (like login)
const authPaths = [
    '/login',
    '/signup'
]

/**
 * Decode a Firebase JWT and check if it's expired.
 * This is NOT full verification (no signature check) — it only reads
 * the `exp` claim so we can reject obviously-stale cookies in Edge Runtime
 * where firebase-admin is unavailable.
 */
function isTokenExpired(token: string): boolean {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return true
        // Base64-url → Base64 → decode
        const payload = JSON.parse(
            atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
        )
        if (!payload.exp) return true
        // exp is in seconds; Date.now() is in milliseconds
        return payload.exp * 1000 < Date.now()
    } catch {
        return true
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // We set this cookie manually in signin-page.tsx
    // Since Firebase Auth is client-side, this serves as a hint to the server
    const sessionToken = request.cookies.get('__session')?.value

    // Treat session as valid only if the cookie exists AND the JWT hasn't expired
    const hasValidSession = !!sessionToken && !isTokenExpired(sessionToken)

    // If the token is expired, clear the cookie so the browser doesn't keep sending it
    const response = NextResponse.next()

    if (sessionToken && !hasValidSession) {
        response.cookies.delete('__session')
    }

    // 1. Check if trying to access a protected route without a valid session
    const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path))
    if (isProtectedRoute && !hasValidSession) {
        // Redirect to login with return URL
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('returnTo', pathname)
        const redirectResponse = NextResponse.redirect(loginUrl)
        // Also clear stale cookie on redirect
        if (sessionToken) {
            redirectResponse.cookies.delete('__session')
        }
        return redirectResponse
    }

    // 2. Auth routes (login/signup) — do NOT redirect server-side.
    //    The client-side AuthProvider will handle redirecting authenticated
    //    users away from these pages after verifying with Firebase.
    //    Redirecting here based on a cookie alone caused false redirects
    //    when stale cookies or persisted Zustand state existed.

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes / Next.js API)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
