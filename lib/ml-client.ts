/**
 * lib/ml-client.ts
 * Server-side HTTP client for the Render ML API.
 * NEVER import this in client components — it uses ML_API_URL (server-only).
 *
 * All functions throw on failure with a descriptive message.
 * Every timeout is set to 180s (3 min) to handle Render free-tier cold starts.
 */

const ML_BASE =
    process.env.ML_API_URL?.replace(/\/+$/, '') // strip trailing slash
    ?? process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '')

if (!ML_BASE) {
    console.error('[ml-client] ML_API_URL is not set. All ML calls will fail.')
}

const TIMEOUT_MS = 180_000

/** Shared fetch wrapper with timeout + error surfacing */
async function mlFetch(path: string, init: RequestInit): Promise<Response> {
    if (!ML_BASE) {
        throw new Error('ML_API_URL is not configured on the server.')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    let response: Response
    try {
        response = await fetch(`${ML_BASE}${path}`, {
            ...init,
            signal: controller.signal,
        })
    } catch (err: any) {
        clearTimeout(timeoutId)
        if (err?.name === 'AbortError') {
            throw new Error(
                `ML API timed out after ${TIMEOUT_MS / 1000}s on "${path}". ` +
                'The Render service may be starting up — retry in 30s.'
            )
        }
        throw new Error(`ML API network error on "${path}": ${err?.message ?? 'Unknown'}`)
    } finally {
        clearTimeout(timeoutId)
    }

    return response
}

/** Throw a rich error from a non-2xx ML response */
async function assertOk(response: Response, context: string): Promise<void> {
    if (!response.ok) {
        const body = await response.json().catch(() => ({ detail: response.statusText }))
        throw new Error(
            `ML API "${context}" returned ${response.status}: ${body?.detail ?? JSON.stringify(body)}`
        )
    }
}

// ─── Pitch Deck Analysis ──────────────────────────────────────────────────────

export interface MlAnalyzeInput {
    file: File | Blob
    filename: string
    sector: string
    stage: string
    revenue?: number | null
    team_size?: number | null
    founded_year?: number | null
    location?: string | null
}

export async function mlAnalyzePitchDeck(input: MlAnalyzeInput): Promise<unknown> {
    const form = new FormData()
    form.append('file', input.file, input.filename)
    form.append('sector', input.sector)
    form.append('stage', input.stage)
    if (input.revenue != null) form.append('revenue', String(input.revenue))
    if (input.team_size != null) form.append('team_size', String(input.team_size))
    if (input.founded_year != null) form.append('founded_year', String(input.founded_year))
    if (input.location) form.append('location', input.location)

    const response = await mlFetch('/api/pitch-deck/analyze', {
        method: 'POST',
        body: form,
        // Do NOT set Content-Type — browser/Node sets it with the correct boundary
    })
    await assertOk(response, 'pitch-deck/analyze')
    return response.json()
}

// ─── Investment Readiness ─────────────────────────────────────────────────────

export interface MlReadinessInput {
    analysis_id?: string
    pitch_deck_quality_score?: number
    monthly_revenue?: number
    arr?: number
    customer_count?: number
    revenue_growth_rate?: number
    team_size?: number
    runway_months?: number
    burn_rate?: number
    sector?: string
    stage?: string
    has_lead_investor?: boolean
}

export async function mlCalculateReadiness(input: MlReadinessInput): Promise<unknown> {
    const response = await mlFetch('/api/investment/readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    })
    await assertOk(response, 'investment/readiness')
    return response.json()
}

// ─── Valuation Benchmarking ───────────────────────────────────────────────────

export interface MlValuationInput {
    sector: string
    stage: string
    revenue?: number
    arr?: number
    mrr?: number
    revenue_growth_rate?: number
    customer_count?: number
    customer_growth_rate?: number
    burn_rate?: number
    runway_months?: number
    team_size?: number
    gross_margin?: number
    net_revenue_retention?: number
    ltv_cac_ratio?: number
}

export async function mlGetValuationBenchmark(input: MlValuationInput): Promise<unknown> {
    const response = await mlFetch('/api/valuation/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    })
    await assertOk(response, 'valuation/benchmark')
    return response.json()
}
