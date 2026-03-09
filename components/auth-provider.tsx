"use client"

import { useEffect, useRef } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { usePathname, useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { useAuthStore } from "@/lib/store"

const AUTH_PAGES = ["/login", "/signup"]

/**
 * AuthProvider — invisible component that listens to Firebase's
 * onAuthStateChanged and keeps the Zustand auth store (and __session
 * cookie) in sync with the real Firebase session.
 *
 * Also handles redirecting authenticated users away from login/signup
 * pages (since middleware can't reliably verify Firebase tokens).
 *
 * Mount this once near the root of the component tree (e.g. in the
 * root layout).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const login = useAuthStore((s) => s.login)
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
    const initialCheckDone = useRef(false)
    const pathname = usePathname()
    const router = useRouter()

    // Subscribe to Firebase auth state ONCE (no pathname dependency)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Firebase has a valid session — make sure Zustand matches
                login({
                    id: firebaseUser.uid,
                    email: firebaseUser.email || "",
                    name: firebaseUser.displayName || "",
                })

                // Refresh the __session cookie so middleware stays in sync
                try {
                    const idToken = await firebaseUser.getIdToken()
                    document.cookie = `__session=${idToken}; path=/; max-age=3600; SameSite=Lax`
                } catch {
                    console.warn("[AuthProvider] Failed to refresh ID token")
                }
            } else {
                // Firebase says no user — clear everything
                if (isAuthenticated || !initialCheckDone.current) {
                    // Clear the cookie
                    document.cookie = "__session=; path=/; max-age=0; SameSite=Lax"
                    // Only clear Zustand state — do NOT call signOut(auth) here
                    // because that would re-trigger onAuthStateChanged recursively
                    useAuthStore.setState({
                        user: null,
                        isAuthenticated: false,
                        hasCompletedOnboarding: false,
                    })
                }
            }
            initialCheckDone.current = true
        })

        return () => unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Separate effect: redirect authenticated users away from auth pages
    // This runs when isAuthenticated or pathname changes, NOT inside the listener
    useEffect(() => {
        if (isAuthenticated && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
            router.replace("/dashboard")
        }
    }, [isAuthenticated, pathname, router])

    return <>{children}</>
}
