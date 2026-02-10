import type { DeckAnalysis, Deck, UserProfile, FlagColor } from "./types"

function getFlag(score: number): FlagColor {
  if (score >= 75) return "green"
  if (score >= 50) return "amber"
  return "red"
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score))
}

const feedbackOptions: Record<string, string[]> = {
  idea: [
    "Strong value proposition with clear differentiation. The problem statement is well-articulated and resonates with the target market.",
    "Good problem identification but solution could be explained more clearly. Consider adding more concrete examples of how users benefit.",
    "Value proposition needs strengthening. The pitch should more clearly articulate why this solution is better than existing alternatives.",
  ],
  team: [
    "Impressive founding team with relevant domain expertise. Strong track record in previous ventures builds investor credibility.",
    "Solid team composition but could benefit from highlighting specific achievements and expertise more prominently in the deck.",
    "Team section needs more detail. Consider adding photos, detailed backgrounds, and clear role definitions for each co-founder.",
  ],
  market: [
    "Large addressable market with clear growth trajectory. TAM/SAM/SOM breakdown is convincing and backed by credible sources.",
    "Market sizing is reasonable but needs stronger data sources. Consider referencing industry reports from established firms.",
    "Market opportunity section needs significant improvement. Add bottom-up analysis and more granular market segmentation.",
  ],
  traction: [
    "Impressive early traction with strong month-over-month growth. Retention metrics demonstrate clear product-market fit signals.",
    "Some traction demonstrated but metrics could be more comprehensive. Include retention rates, LTV, and unit economics.",
    "Limited traction metrics presented. This is a key area investors will focus on. Add any customer data, pilots, or LOIs available.",
  ],
  risk: [
    "Key risks are well-identified with thoughtful mitigation strategies. IP protection and regulatory considerations are addressed.",
    "Risk section covers main concerns but mitigation strategies could be more detailed. Consider addressing IP and moat defensibility.",
    "Risk analysis needs significant strengthening. Identify key risks and present concrete mitigation strategies for each.",
  ],
  scalability: [
    "Business model shows excellent scalability potential with strong unit economics. Path to profitability is clear and achievable.",
    "Scalability potential exists but unit economics need more validation. Include projections for the next 18-36 months.",
    "Scalability section needs more work. Clarify how the business model scales and provide evidence of improving unit economics.",
  ],
}

function generateFeedback(dimension: string): string {
  const options = feedbackOptions[dimension] || ["Good work on this section."]
  return options[Math.floor(Math.random() * options.length)]
}

export function generateMockAnalysis(deckId: string): DeckAnalysis {
  const baseScore = Math.floor(Math.random() * 30) + 55
  const ideaScore = clampScore(baseScore + Math.floor(Math.random() * 20) - 8)
  const teamScore = clampScore(baseScore + Math.floor(Math.random() * 20) - 10)
  const marketScore = clampScore(baseScore + Math.floor(Math.random() * 20) - 8)
  const tractionScore = clampScore(baseScore + Math.floor(Math.random() * 20) - 12)
  const riskScore = clampScore(baseScore + Math.floor(Math.random() * 20) - 10)
  const scalabilityScore = clampScore(baseScore + Math.floor(Math.random() * 20) - 8)

  return {
    id: `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    deckId,
    overallScore: baseScore,
    ideaScore,
    teamScore,
    marketScore,
    tractionScore,
    riskScore,
    scalabilityScore,
    feedback: {
      idea: generateFeedback("idea"),
      team: generateFeedback("team"),
      market: generateFeedback("market"),
      traction: generateFeedback("traction"),
      risk: generateFeedback("risk"),
      scalability: generateFeedback("scalability"),
    },
    feedbackGaps: {
      idea: "Solution differentiation could be articulated more clearly against direct competitors.",
      team: "No technical co-founder mentioned — this could be a concern for product-heavy ventures.",
      market: "TAM/SAM/SOM breakdown needs stronger data sources from credible industry reports.",
      traction: "Revenue figures not disclosed — add MRR/ARR data to strengthen investor confidence.",
      risk: "IP protection strategy not addressed — consider patents or trade secret protections.",
      scalability: "Unit economics need more validation — include projections for next 18-36 months.",
    },
    flags: {
      idea: getFlag(ideaScore),
      team: getFlag(teamScore),
      market: getFlag(marketScore),
      traction: getFlag(tractionScore),
      risk: getFlag(riskScore),
      scalability: getFlag(scalabilityScore),
    },
    riskFlags: {
      red: [
        { description: "Limited traction data — no revenue or customer metrics disclosed", mitigation: "Add a dedicated traction slide with MRR, user growth, and retention metrics" },
        { description: "High competition from established brands entering the market", mitigation: "Develop clear defensibility moats and first-mover advantage narrative" },
        { description: "Business model pricing strategy not clearly defined", mitigation: "Add pricing strategy slide with unit economics and LTV/CAC analysis" },
      ],
      amber: [
        { description: "Market acceptance uncertainty in target geography", mitigation: "Conduct customer validation surveys and compile testimonial evidence" },
        { description: "Economic fluctuations may affect consumer discretionary spending", mitigation: "Develop flexible pricing strategy and value-based positioning" },
      ],
      green: [
        { description: "Clear product-market fit signals from organic brand growth", mitigation: "" },
        { description: "Strong founding team with complementary domain expertise", mitigation: "" },
      ],
    },
    teamMembers: [
      {
        name: "Alex Chen",
        role: "Co-Founder & CEO",
        education: "MBA, Stanford Graduate School of Business",
        experience: [
          "Former VP of Product at a Series C startup",
          "10+ years in enterprise SaaS",
          "Previously founded and exited a dev tools company",
        ],
      },
      {
        name: "Priya Sharma",
        role: "Co-Founder & CTO",
        education: "M.S. Computer Science, IIT Delhi",
        experience: [
          "Former Senior Engineer at Google",
          "Published ML researcher with 15+ citations",
          "Deep expertise in AI/ML infrastructure",
        ],
      },
    ],
    teamExpertise: ["Product strategy & go-to-market", "Machine learning & AI", "Enterprise sales", "Brand building"],
    teamGaps: ["Team size not fully disclosed", "No dedicated marketing/growth hire mentioned"],
    tractionMetrics: {
      revenue: "₹12L ARR",
      growthRate: "5x in 2 years",
      capitalRaised: "$500K Pre-Seed",
      revenueStatus: tractionScore >= 60 ? "green" : "amber",
      growthStatus: "green",
      capitalStatus: "green",
    },
    tractionIndicators: [
      "5x brand search volume growth over 2 years",
      "Strong organic traction across channels",
      "Award-winning product recognition",
    ],
    tractionMissing: [
      "Detailed revenue breakdown not provided",
      "Runway information not disclosed",
      "Customer retention rates not shared",
    ],
    businessModel: "The startup operates on a direct-to-consumer (D2C) model, allowing it to maintain control over branding, customer experience, and unit economics. This model supports rapid growth and direct engagement with the target market.",
    businessModelTraits: [
      "Direct customer relationships",
      "Brand control and premium positioning",
      "Higher margins vs. retail distribution",
      "Data-driven customer insights",
    ],
    marketProblem: "The target market is significantly underserved, with growing demand for high-quality, accessible solutions. Consumers face limited options and structural barriers that hinder adoption and purchasing.",
    marketSolution: "The startup offers a differentiated product that has gained significant organic traction through quality and education-first approach, resulting in 5x brand search volume growth over two years.",
    improvementItems: [
      {
        title: "Quantify traction with revenue metrics and pilot conversion data",
        priority: "high",
        impact: "+15-20 points on Traction score",
        effort: "Medium (2-3 weeks)",
        steps: [
          "Add revenue slide with MRR/ARR breakdown",
          "Include customer acquisition cost and LTV metrics",
          "Show pilot program results or conversion funnel data",
        ],
      },
      {
        title: "Clarify business model and pricing strategy",
        priority: "high",
        impact: "+10-15 points on Business Model clarity",
        effort: "Low (1 week)",
        steps: [
          "Add pricing strategy slide with tier breakdown",
          "Explain D2C unit economics clearly",
          "Include customer LTV and CAC calculations",
        ],
      },
      {
        title: "Strengthen competitive analysis",
        priority: "medium",
        impact: "+8-12 points on Market score",
        effort: "Medium (2 weeks)",
        steps: [
          "Create competitive positioning matrix",
          "Identify and articulate defensibility moats",
          "Reference credible market reports for sizing",
        ],
      },
      {
        title: "Add detailed financial projections",
        priority: "medium",
        impact: "+10-15 points on Risk score",
        effort: "High (3-4 weeks)",
        steps: [
          "Build 3-year financial model",
          "Include break-even analysis",
          "Show path to profitability",
        ],
      },
    ],
    improvements: [
      "Add detailed financial projections for next 3 years",
      "Include more customer testimonials and case studies",
      "Strengthen competitive analysis with market positioning map",
      "Add clearer go-to-market strategy with timeline",
    ],
    strengths: [
      "Clear and compelling value proposition",
      "Strong founding team with industry experience",
      "Large and growing target market",
    ],
    criticalGaps: [
      "Limited traction metrics and revenue data",
      "Competitive analysis needs more depth",
      "Missing detailed financial projections",
    ],
    quickWins: [
      "Add customer logos to build credibility",
      "Include team photos and LinkedIn profiles",
      "Visualize market size with clear charts",
    ],
    nextSteps: [
      { action: "Add detailed 3-year financial model", impact: "high" },
      { action: "Include 2-3 customer case studies", impact: "high" },
      { action: "Create competitive positioning matrix", impact: "medium" },
      { action: "Add team member bios with photos", impact: "medium" },
      { action: "Improve slide design consistency", impact: "low" },
    ],
    percentile: Math.floor(Math.random() * 40) + 35,
    analyzedAt: new Date().toISOString(),
  }
}

export function createDemoUser(): UserProfile {
  return {
    id: "user_demo",
    name: "Demo User",
    email: "demo@startup.com",
    startupName: "TechVenture AI",
    sector: "AI/ML",
    stage: "Pre-seed",
    location: "Bangalore",
    description: "AI-powered analytics for SaaS companies",
    createdAt: new Date().toISOString(),
  }
}

export const SAMPLE_DECKS: Deck[] = [
  {
    id: "deck_001",
    userId: "user_demo",
    filename: "TechVenture_Deck_v3.pdf",
    fileSize: 5242880,
    uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
  },
  {
    id: "deck_002",
    userId: "user_demo",
    filename: "TechVenture_Deck_v2.pdf",
    fileSize: 4718592,
    uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
  },
  {
    id: "deck_003",
    userId: "user_demo",
    filename: "TechVenture_Deck_v1.pdf",
    fileSize: 3145728,
    uploadDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
  },
]

const sharedNewFields = {
  feedbackGaps: {
    idea: "Solution differentiation could be stronger against direct competitors.",
    team: "Technical co-founder depth could be highlighted more.",
    market: "TAM/SAM/SOM needs stronger data references.",
    traction: "Revenue figures should be quantified with MRR/ARR.",
    risk: "IP protection strategy not addressed.",
    scalability: "Unit economics need projections for 18-36 months.",
  },
  riskFlags: {
    red: [
      { description: "Limited revenue metrics disclosed", mitigation: "Add MRR/ARR slide with growth trajectory" },
      { description: "Competitive threat from incumbents", mitigation: "Develop clear defensibility narrative" },
    ],
    amber: [
      { description: "Market timing uncertainty", mitigation: "Provide market validation evidence" },
    ],
    green: [
      { description: "Strong organic growth signals", mitigation: "" },
      { description: "Experienced founding team", mitigation: "" },
    ],
  },
  teamMembers: [
    { name: "Alex Chen", role: "Co-Founder & CEO", education: "MBA, Stanford", experience: ["VP of Product at Series C startup", "10+ years enterprise SaaS"] },
    { name: "Priya Sharma", role: "Co-Founder & CTO", education: "M.S. CS, IIT Delhi", experience: ["Senior Engineer at Google", "ML researcher"] },
  ],
  teamExpertise: ["Product strategy", "Machine learning & AI", "Enterprise sales"],
  teamGaps: ["Team size not disclosed", "No dedicated growth hire"],
  tractionMetrics: { revenue: "₹12L ARR", growthRate: "5x in 2 yrs", capitalRaised: "$500K", revenueStatus: "amber" as const, growthStatus: "green" as const, capitalStatus: "green" as const },
  tractionIndicators: ["5x brand search volume growth", "Strong organic traction", "Award-winning products"],
  tractionMissing: ["Revenue breakdown not provided", "Runway not disclosed", "Retention rates not shared"],
  businessModel: "Direct-to-consumer model with strong brand control, higher margins, and direct customer relationships.",
  businessModelTraits: ["Direct customer relationships", "Brand control", "Higher margins vs. retail"],
  marketProblem: "Target market is underserved with growing demand and structural barriers to adoption.",
  marketSolution: "Differentiated product with organic traction and education-first approach driving 5x growth.",
  improvementItems: [
    { title: "Quantify traction with revenue data", priority: "high" as const, impact: "+15-20 pts", effort: "Medium (2-3 weeks)", steps: ["Add MRR/ARR slide", "Include CAC/LTV metrics", "Show conversion funnel"] },
    { title: "Clarify pricing strategy", priority: "high" as const, impact: "+10-15 pts", effort: "Low (1 week)", steps: ["Add pricing slide", "Explain unit economics", "Show LTV/CAC"] },
    { title: "Strengthen competitive analysis", priority: "medium" as const, impact: "+8-12 pts", effort: "Medium (2 weeks)", steps: ["Create positioning matrix", "Identify moats"] },
  ],
}

export const SAMPLE_ANALYSES: DeckAnalysis[] = [
  {
    id: "analysis_001",
    deckId: "deck_001",
    overallScore: 72,
    ideaScore: 85,
    teamScore: 68,
    marketScore: 75,
    tractionScore: 60,
    riskScore: 70,
    scalabilityScore: 78,
    feedback: {
      idea: "Strong value proposition with clear differentiation in the AI/ML space. The problem statement resonates well with enterprise customers.",
      team: "Founding team has relevant experience, but consider adding a CTO with deeper technical expertise in machine learning.",
      market: "Large addressable market with clear growth trajectory. TAM/SAM/SOM breakdown is convincing.",
      traction: "Early customer adoption is promising, but need more concrete revenue figures and retention metrics.",
      risk: "Key risks identified but mitigation strategies could be more detailed. Consider addressing IP protection.",
      scalability: "Business model shows good scalability potential. Unit economics need more validation.",
    },
    flags: { idea: "green", team: "amber", market: "green", traction: "amber", risk: "amber", scalability: "green" },
    ...sharedNewFields,
    improvements: [
      "Add detailed financial projections for next 3 years",
      "Include more customer testimonials and case studies",
      "Strengthen competitive analysis with market positioning map",
      "Add clearer go-to-market strategy with timeline",
    ],
    strengths: [
      "Clear and compelling value proposition",
      "Strong founding team with industry experience",
      "Large and growing target market",
    ],
    criticalGaps: [
      "Limited traction metrics and revenue data",
      "Competitive analysis needs more depth",
      "Missing detailed financial projections",
    ],
    quickWins: [
      "Add customer logos to build credibility",
      "Include team photos and LinkedIn profiles",
      "Visualize market size with clear charts",
    ],
    nextSteps: [
      { action: "Add detailed 3-year financial model", impact: "high" },
      { action: "Include 2-3 customer case studies", impact: "high" },
      { action: "Create competitive positioning matrix", impact: "medium" },
      { action: "Add team member bios with photos", impact: "medium" },
      { action: "Improve slide design consistency", impact: "low" },
    ],
    percentile: 68,
    analyzedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "analysis_002",
    deckId: "deck_002",
    overallScore: 64,
    ideaScore: 78,
    teamScore: 62,
    marketScore: 70,
    tractionScore: 52,
    riskScore: 60,
    scalabilityScore: 68,
    feedback: {
      idea: "Good problem identification but solution could be explained more clearly. Consider adding more concrete examples.",
      team: "Solid team composition but could benefit from highlighting specific achievements more prominently.",
      market: "Market sizing is reasonable but needs stronger data sources.",
      traction: "Some traction demonstrated but metrics could be more comprehensive.",
      risk: "Risk section covers main concerns but mitigation strategies could be more detailed.",
      scalability: "Scalability potential exists but unit economics need more validation.",
    },
    flags: { idea: "green", team: "amber", market: "amber", traction: "amber", risk: "amber", scalability: "amber" },
    ...sharedNewFields,
    improvements: [
      "Strengthen problem statement with more data",
      "Add financial projections and unit economics",
      "Include competitive landscape analysis",
      "Improve visual design and consistency",
    ],
    strengths: [
      "Interesting market opportunity",
      "Relevant team background",
      "Clear problem identification",
    ],
    criticalGaps: [
      "Weak traction evidence",
      "No financial projections",
      "Missing competitor analysis",
    ],
    quickWins: [
      "Add basic revenue projections",
      "Include market size visualization",
      "Add customer testimonial quotes",
    ],
    nextSteps: [
      { action: "Develop 3-year financial model", impact: "high" },
      { action: "Add competitive analysis slide", impact: "high" },
      { action: "Include more traction metrics", impact: "medium" },
      { action: "Improve deck visual design", impact: "low" },
    ],
    percentile: 52,
    analyzedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "analysis_003",
    deckId: "deck_003",
    overallScore: 55,
    ideaScore: 70,
    teamScore: 55,
    marketScore: 58,
    tractionScore: 42,
    riskScore: 50,
    scalabilityScore: 55,
    feedback: {
      idea: "Value proposition needs strengthening. The pitch should more clearly articulate why this solution is better than alternatives.",
      team: "Team section needs more detail. Consider adding photos, detailed backgrounds, and clear role definitions.",
      market: "Market opportunity section needs improvement. Add bottom-up analysis.",
      traction: "Limited traction metrics presented. Add any customer data, pilots, or LOIs.",
      risk: "Risk analysis needs strengthening. Identify key risks and present concrete mitigation strategies.",
      scalability: "Scalability section needs more work. Clarify how the business model scales.",
    },
    flags: { idea: "amber", team: "amber", market: "amber", traction: "red", risk: "amber", scalability: "amber" },
    ...sharedNewFields,
    improvements: [
      "Completely revamp the problem-solution section",
      "Add team credentials and experience details",
      "Include any early traction or pilot data",
      "Develop financial model from scratch",
    ],
    strengths: [
      "Identified a real market problem",
      "Founding team is passionate",
      "Early product prototype exists",
    ],
    criticalGaps: [
      "No traction data at all",
      "Very basic market analysis",
      "No financial projections",
    ],
    quickWins: [
      "Add a slide with team photos and bios",
      "Include problem statistics from credible sources",
      "Create a simple TAM/SAM/SOM slide",
    ],
    nextSteps: [
      { action: "Get at least 3 pilot customers", impact: "high" },
      { action: "Create detailed financial projections", impact: "high" },
      { action: "Conduct proper market research", impact: "high" },
      { action: "Get a design refresh for the deck", impact: "medium" },
    ],
    percentile: 38,
    analyzedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export function seedDemoData() {
  const { StorageService } = require("./storage")
  const user = createDemoUser()
  StorageService.saveUser(user)
  StorageService.savePassword("demo@startup.com", "password123")
  StorageService.saveDecks(SAMPLE_DECKS)
  SAMPLE_ANALYSES.forEach((a: DeckAnalysis) => StorageService.saveAnalysis(a))
}
