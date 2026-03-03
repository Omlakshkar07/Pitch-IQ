import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// Browser/client-side Supabase client (uses publishable key, respects RLS)
export const supabase = createClient(supabaseUrl, supabasePublishableKey)

// Server-side admin client (bypasses RLS — use ONLY in API routes/server actions)
// This must NEVER be imported in client components
export function createAdminClient() {
    const serviceKey = process.env.SUPABASE_SECRET_KEY
    if (!serviceKey) {
        throw new Error('SUPABASE_SECRET_KEY is not set. Cannot create admin client.')
    }
    return createClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}

// Database types derived from our schema
export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    firebase_uid: string
                    email: string
                    name: string
                    has_completed_onboarding: boolean
                    created_at: string
                    updated_at: string
                    deleted_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['users']['Insert']>
            }
            startup_profiles: {
                Row: {
                    id: string
                    user_id: string
                    startup_name: string
                    description: string | null
                    sector: string
                    stage: string
                    location: string
                    team_size: number | null
                    website: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['startup_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['startup_profiles']['Insert']>
            }
            decks: {
                Row: {
                    id: string
                    user_id: string
                    filename: string
                    file_size_bytes: number
                    storage_url: string
                    mime_type: string
                    status: 'pending' | 'analyzing' | 'completed' | 'failed'
                    sector: string | null
                    stage: string | null
                    revenue_inr: number | null
                    team_size: number | null
                    founding_year: number | null
                    location: string | null
                    incorporation_status: string | null
                    fundraising_status: string | null
                    fund_raised: boolean
                    founder_name: string | null
                    founder_email: string | null
                    founder_phone: string | null
                    analysis_mode: string | null
                    uploaded_at: string
                    updated_at: string
                    deleted_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['decks']['Row'], 'id' | 'uploaded_at' | 'updated_at'>
                Update: Partial<Database['public']['Tables']['decks']['Insert']>
            }
            deck_analyses: {
                Row: {
                    id: string
                    deck_id: string
                    external_analysis_id: string | null
                    overall_score: number
                    idea_score: number
                    team_score: number
                    market_score: number
                    traction_score: number
                    risk_score: number
                    scalability_score: number
                    percentile: number | null
                    feedback: Record<string, string>
                    feedback_gaps: Record<string, string[]>
                    flags: Record<string, string>
                    risk_flags: Record<string, Array<{ description: string; mitigation: string }>>
                    team_members: Array<{ name: string; role: string; education?: string; experience?: string[] }>
                    team_expertise: string[]
                    team_gaps: string[]
                    traction_metrics: Record<string, string | number>
                    traction_indicators: string[]
                    traction_missing: string[]
                    business_model: string | null
                    business_model_traits: string[]
                    market_problem: string | null
                    market_solution: string | null
                    improvement_items: Array<{ title: string; priority: string; impact: string; effort: string; steps: string[] }>
                    improvements: string[]
                    strengths: string[]
                    critical_gaps: string[]
                    quick_wins: string[]
                    next_steps: Array<{ action: string; impact: string }>
                    analyzed_at: string
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['deck_analyses']['Row'], 'id' | 'created_at'>
                Update: never // analyses are immutable
            }
            investment_readiness_results: {
                Row: {
                    id: string
                    user_id: string
                    analysis_id: string | null
                    overall_score: number
                    readiness_level: 'Ready' | 'Nearly Ready' | 'Not Ready'
                    pitch_deck_quality_score: number | null
                    traction_metrics_score: number | null
                    team_strength_score: number | null
                    market_timing_score: number | null
                    financial_health_score: number | null
                    key_improvements: string[]
                    next_steps: string[]
                    estimated_time_to_ready: string | null
                    monthly_revenue_inr: number | null
                    arr_inr: number | null
                    customer_count: number | null
                    revenue_growth_rate_pct: number | null
                    team_size: number | null
                    runway_months: number | null
                    burn_rate_inr: number | null
                    sector: string | null
                    stage: string | null
                    has_lead_investor: boolean | null
                    calculated_at: string
                }
                Insert: Omit<Database['public']['Tables']['investment_readiness_results']['Row'], 'id' | 'calculated_at'>
                Update: never
            }
            valuation_results: {
                Row: {
                    id: string
                    user_id: string
                    sector: string
                    stage: string
                    valuation_low_cr: number
                    valuation_median_cr: number
                    valuation_high_cr: number
                    currency: string
                    confidence_level: 'High' | 'Medium' | 'Low'
                    methodology: string | null
                    revenue_multiple: number | null
                    comparable_companies: Array<{ name: string; valuation: string; stage: string; sector: string }>
                    key_factors: string[]
                    valuation_tips: string[]
                    disclaimer: string | null
                    revenue_inr: number | null
                    arr_inr: number | null
                    mrr_inr: number | null
                    revenue_growth_rate_pct: number | null
                    customer_count: number | null
                    customer_growth_rate_pct: number | null
                    burn_rate_inr: number | null
                    runway_months: number | null
                    team_size: number | null
                    gross_margin_pct: number | null
                    calculated_at: string
                }
                Insert: Omit<Database['public']['Tables']['valuation_results']['Row'], 'id' | 'calculated_at'>
                Update: never
            }
        }
    }
}
