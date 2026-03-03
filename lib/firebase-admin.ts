/**
 * lib/firebase-admin.ts
 * Firebase Admin SDK initialization — server-side ONLY.
 * Never import this in client components.
 *
 * Requires env var FIREBASE_SERVICE_ACCOUNT_KEY (JSON string)
 * OR falls back to project-based init with FIREBASE_PROJECT_ID.
 */
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'

let adminApp: App | undefined
let adminAuth: Auth | undefined

function getAdminApp(): App {
    if (adminApp) return adminApp

    const existing = getApps()
    if (existing.length > 0) {
        adminApp = existing[0]
        return adminApp
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (serviceAccountKey) {
        try {
            const serviceAccount = JSON.parse(serviceAccountKey)
            adminApp = initializeApp({
                credential: cert(serviceAccount),
            })
        } catch {
            throw new Error(
                'FIREBASE_SERVICE_ACCOUNT_KEY is set but is not valid JSON. ' +
                'Ensure it contains the full service account key file contents.'
            )
        }
    } else {
        // Fallback: use project ID only (works in GCP environments with default credentials)
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        if (!projectId) {
            throw new Error(
                'Firebase Admin SDK requires either FIREBASE_SERVICE_ACCOUNT_KEY (JSON string) ' +
                'or NEXT_PUBLIC_FIREBASE_PROJECT_ID to be set.'
            )
        }
        adminApp = initializeApp({ projectId })
    }

    return adminApp
}

export function getAdminAuth(): Auth {
    if (adminAuth) return adminAuth
    adminAuth = getAuth(getAdminApp())
    return adminAuth
}
