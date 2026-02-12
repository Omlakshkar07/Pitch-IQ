const API_BASE_URL =
  "https://ccc9-2401-4900-883c-c410-945c-c66b-8e3e-e50.ngrok-free.app/api/pitch-deck";

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

export async function analyzePitchDeck(
  request: AnalyzeRequest,
): Promise<AnalyzeResponse> {
  const formData = new FormData();

  // Required fields
  formData.append("file", request.file);
  formData.append("sector", request.sector);
  formData.append("stage", request.stage);

  // Optional fields
  if (request.revenue) formData.append("revenue", request.revenue);
  if (request.team_size) formData.append("team_size", request.team_size);
  if (request.founded_year)
    formData.append("founded_year", request.founded_year);
  if (request.location) formData.append("location", request.location);
  if (request.incorporation_status)
    formData.append("incorporation_status", request.incorporation_status);
  if (request.fundraising_status)
    formData.append("fundraising_status", request.fundraising_status);
  if (request.fund_raised !== undefined)
    formData.append("fund_raised", String(request.fund_raised));
  if (request.founder_name)
    formData.append("founder_name", request.founder_name);
  if (request.founder_email)
    formData.append("founder_email", request.founder_email);
  if (request.founder_phone)
    formData.append("founder_phone", request.founder_phone);
  if (request.analysis_mode)
    formData.append("analysis_mode", request.analysis_mode);

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}
