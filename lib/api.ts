/**
 * lib/api.ts
 * Client-side API module.
 *
 * All ML calls go through our Next.js backend (/api/ml/*), never directly
 * to Render. This eliminates CORS issues, hides the ML API URL from the
 * client bundle, and lets the server handle auth + DB persistence atomically.
 *
 * Every function requires a Firebase idToken so the backend can authenticate.
 */
import { auth } from "./firebase"
import type { DeckAnalysis } from "./types"

/** Get the current user's ID token, throwing if not authenticated. */
async function getIdToken(): Promise<string> {
  const user = auth.currentUser
  if (!user) throw new Error("Not authenticated — please sign in.")
  return user.getIdToken()
}

/** Shared error handler for our backend API responses */
async function assertBackendOk(response: Response, context: string): Promise<void> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(body?.error ?? `${context} failed (${response.status})`)
  }
}

export interface AnalyzeRequest {
  file: File;
  sector: string;
  stage: string;
  revenue?: string;
  team_size?: string;
  founded_year?: string;
  location?: string;
  incorporation_status?: string;
  fundraising_status?: string;
  fund_raised?: boolean;
  founder_name?: string;
  founder_email?: string;
  founder_phone?: string;
  analysis_mode?: string;
}

export interface FounderDetail {
  name: string;
  background: string;
}

export interface TractionMetrics {
  revenue: string;
  growth_rate: string;
  capital_raised: {
    total_funding: string;
  };
  runway: string;
}

export interface ImprovementSuggestion {
  suggestion: string;
  impact: string;
  rationale: string;
}

export interface DetailedAnalysis {
  component_scores: {
    idea_novelty: number;
    team_capability: number;
    market_opportunity: number;
    traction_feasibility: number;
    risk_sustainability: number;
    scalability: number;
    overall: number;
  };
  market_problem: string;
  solution_differentiation: string;
  team_capability_detail: string | null;
  traction_metrics: TractionMetrics;
  business_model: string;
  risk_analysis: string;
  evidence: {
    facts: Array<{ field: string; quote: string }>;
    risks: Array<{ field: string; quote: string }>;
    business_type: string;
  };
  facts: {
    company_name: string;
    purpose: string;
    tagline: string;
    problem: string;
    solution: string;
    business_model: string;
    traction: string;
    founders: FounderDetail[];
    raise_amount: string;
    valuation: string;
    revenue: string;
    arr: string;
    mrr: string;
    tam: string;
    sam: string;
    som: string;
  };
}

export interface AnalyzeResponse {
  analysis_id: string;
  timestamp: number;
  overall_score: number;
  idea_novelty: number;
  team_capability: number;
  market_opportunity: number;
  traction_feasibility: number;
  risk_sustainability: number;
  scalability: number;
  market_problem: string;
  solution_differentiation: string;
  team_capability_detail: string | null;
  traction_metrics: TractionMetrics;
  business_model: string;
  risk_analysis: string;
  red_flags: string[];
  amber_flags: string[];
  green_flags: string[];
  percentile: number;
  improvement_suggestions: ImprovementSuggestion[];
  detailed_analysis: DetailedAnalysis;
}

/** Response from the /api/ml/analyze backend route */
export interface BackendAnalyzeResponse {
  success: boolean
  deckId: string
  analysisId: string
  analysis: DeckAnalysis
}

/**
 * Upload a pitch deck and run ML analysis.
 * Calls /api/ml/analyze (Next.js backend) which proxies to Render server-side.
 * Returns the full DeckAnalysis + the DB-assigned deckId and analysisId.
 * The deck and analysis are saved to Supabase by the backend in one atomic call.
 */
export async function analyzePitchDeck(
  request: AnalyzeRequest,
): Promise<BackendAnalyzeResponse> {
  const idToken = await getIdToken()
  const formData = new FormData();

  formData.append("file", request.file);
  formData.append("sector", request.sector);
  formData.append("stage", request.stage);

  if (request.revenue) formData.append("revenue", request.revenue);
  if (request.team_size) formData.append("team_size", request.team_size);
  if (request.founded_year) formData.append("founded_year", request.founded_year);
  if (request.location) formData.append("location", request.location);
  if (request.incorporation_status) formData.append("incorporation_status", request.incorporation_status);
  if (request.fundraising_status) formData.append("fundraising_status", request.fundraising_status);
  if (request.fund_raised !== undefined) formData.append("fund_raised", String(request.fund_raised));
  if (request.founder_name) formData.append("founder_name", request.founder_name);
  if (request.founder_email) formData.append("founder_email", request.founder_email);
  if (request.founder_phone) formData.append("founder_phone", request.founder_phone);
  if (request.analysis_mode) formData.append("analysis_mode", request.analysis_mode);

  const response = await fetch("/api/ml/analyze", {
    method: "POST",
    headers: { "Authorization": `Bearer ${idToken}` },
    body: formData,
  });

  await assertBackendOk(response, "Pitch deck analysis");
  return response.json();
}

/* ─────────────── Investment Readiness ─────────────── */

export interface InvestmentReadinessRequest {
  analysis_id?: string;
  pitch_deck_quality_score?: number;
  monthly_revenue?: number;
  arr?: number;
  customer_count?: number;
  revenue_growth_rate?: number;
  team_size?: number;
  runway_months?: number;
  burn_rate?: number;
  sector?: string;
  stage?: string;
  has_lead_investor?: boolean;
}

export interface InvestmentReadinessResponse {
  overall_readiness_score: number;
  readiness_level: "Ready" | "Nearly Ready" | "Not Ready";
  component_scores: {
    pitch_deck_quality: number;
    traction_metrics: number;
    team_strength: number;
    market_timing: number;
    financial_health: number;
  };
  key_improvements: string[];
  next_steps: string[];
  estimated_time_to_ready: string;
  timestamp: number;
}

export async function calculateInvestmentReadiness(
  request: InvestmentReadinessRequest,
): Promise<InvestmentReadinessResponse> {
  const idToken = await getIdToken()

  const response = await fetch("/api/ml/readiness", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`,
    },
    body: JSON.stringify(request),
  });

  await assertBackendOk(response, "Investment readiness");
  return response.json();
}

/* ─────────────── Valuation Benchmarking ─────────────── */

export interface ValuationBenchmarkRequest {
  sector: string;
  stage: string;
  revenue?: number;
  arr?: number;
  mrr?: number;
  revenue_growth_rate?: number;
  customer_count?: number;
  customer_growth_rate?: number;
  burn_rate?: number;
  runway_months?: number;
  team_size?: number;
  gross_margin?: number;
  net_revenue_retention?: number;
  ltv_cac_ratio?: number;
}

export interface ComparableCompany {
  name: string;
  valuation: string;
  stage: string;
  sector: string;
}

export interface ValuationBenchmarkResponse {
  valuation_band: {
    low: number;
    median: number;
    high: number;
    currency: string;
  };
  confidence_level: "High" | "Medium" | "Low";
  methodology: string;
  revenue_multiple: number;
  comparable_companies: ComparableCompany[];
  key_factors: string[];
  valuation_tips: string[];
  disclaimer: string;
  timestamp: number;
}

export async function getValuationBenchmark(
  request: ValuationBenchmarkRequest,
): Promise<ValuationBenchmarkResponse> {
  const idToken = await getIdToken()

  const response = await fetch("/api/ml/valuation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`,
    },
    body: JSON.stringify(request),
  });

  await assertBackendOk(response, "Valuation benchmark");
  return response.json();
}
