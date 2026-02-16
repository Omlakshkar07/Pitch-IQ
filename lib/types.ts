export interface UserProfile {
  id: string
  name: string
  email: string
  password?: string
  startupName: string
  sector: string
  stage: string
  location: string
  description?: string
  teamSize?: number
  website?: string
  createdAt: string
}

export interface Deck {
  id: string
  userId: string
  filename: string
  fileSize: number
  uploadDate: string
  status: "pending" | "analyzing" | "completed" | "failed"
  fileData?: string
  sector?: string
  stage?: string
  revenue?: number
  teamSize?: number
  foundingYear?: number
  location?: string
  incorporationStatus?: string
  fundraisingStatus?: string
  fundRaised?: boolean
  founderName?: string
  founderEmail?: string
  founderPhone?: string
  analysisMode?: string
}

export interface RiskFlag {
  description: string
  mitigation: string
}

export interface TeamMember {
  name: string
  role: string
  education: string
  experience: string[]
}

export interface TractionMetrics {
  revenue: string
  growthRate: string
  capitalRaised: string
  revenueStatus: "green" | "amber" | "red"
  growthStatus: "green" | "amber" | "red"
  capitalStatus: "green" | "amber" | "red"
}

export interface ImprovementItem {
  title: string
  priority: "high" | "medium" | "low"
  impact: string
  effort: string
  steps: string[]
}

export interface DeckAnalysis {
  id: string
  deckId: string
  overallScore: number
  ideaScore: number
  teamScore: number
  marketScore: number
  tractionScore: number
  riskScore: number
  scalabilityScore: number
  feedback: {
    idea: string
    team: string
    market: string
    traction: string
    risk: string
    scalability: string
  }
  feedbackGaps: {
    idea: string
    team: string
    market: string
    traction: string
    risk: string
    scalability: string
  }
  flags: {
    idea: "red" | "amber" | "green"
    team: "red" | "amber" | "green"
    market: "red" | "amber" | "green"
    traction: "red" | "amber" | "green"
    risk: "red" | "amber" | "green"
    scalability: "red" | "amber" | "green"
  }
  riskFlags: {
    red: RiskFlag[]
    amber: RiskFlag[]
    green: RiskFlag[]
  }
  teamMembers: TeamMember[]
  teamExpertise: string[]
  teamGaps: string[]
  tractionMetrics: TractionMetrics
  tractionIndicators: string[]
  tractionMissing: string[]
  businessModel: string
  businessModelTraits: string[]
  marketProblem: string
  marketSolution: string
  improvementItems: ImprovementItem[]
  improvements: string[]
  strengths: string[]
  criticalGaps: string[]
  quickWins: string[]
  nextSteps: Array<{
    action: string
    impact: "high" | "medium" | "low"
  }>
  percentile: number
  analyzedAt: string
}

export interface ReadinessScore {
  id: string
  deckId: string
  compositeScore: number
  pitchDeckScore: number
  tractionScore: number
  teamScore: number
  marketTimingScore: number
  financialHealthScore: number
  readinessLevel: "Ready" | "Nearly Ready" | "Not Ready"
  calculatedAt: string
}

export interface InvestmentReadinessData {
  id: string
  analysisId?: string
  overallScore: number
  readinessLevel: "Ready" | "Nearly Ready" | "Not Ready"
  componentScores: {
    pitchDeckQuality: number
    tractionMetrics: number
    teamStrength: number
    marketTiming: number
    financialHealth: number
  }
  keyImprovements: string[]
  nextSteps: string[]
  estimatedTimeToReady: string
  calculatedAt: string
}

export interface ValuationData {
  id: string
  sector: string
  stage: string
  valuationBand: {
    low: number
    median: number
    high: number
    currency: string
  }
  confidenceLevel: "High" | "Medium" | "Low"
  methodology: string
  revenueMultiple: number
  comparableCompanies: Array<{
    name: string
    valuation: string
    stage: string
    sector: string
  }>
  keyFactors: string[]
  valuationTips: string[]
  disclaimer: string
  calculatedAt: string
}

export interface SignupData {
  name: string
  email: string
  password: string
}

export type FlagColor = "red" | "amber" | "green"
