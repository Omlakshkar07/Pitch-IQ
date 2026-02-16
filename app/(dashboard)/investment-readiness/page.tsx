"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  TrendingUp,
  Loader2,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuthStore, useDecksStore, useReadinessStore } from "@/lib/store"
import { calculateInvestmentReadiness } from "@/lib/api"
import type { InvestmentReadinessData } from "@/lib/types"
import type { InvestmentReadinessResponse } from "@/lib/api"
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"

const SECTORS = [
  "Technology", "Healthcare", "Fintech", "EdTech", "E-commerce",
  "SaaS", "AI/ML", "CleanTech", "AgriTech", "Logistics",
  "Real Estate", "Media", "Gaming", "FoodTech", "Other",
]

const STAGES = [
  "Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Growth",
]

function scoreColor(score: number) {
  if (score >= 71) return "#22c55e"
  if (score >= 41) return "#f97316"
  return "#ef4444"
}

function readinessLevelBadge(level: string) {
  switch (level) {
    case "Ready":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
    case "Nearly Ready":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40"
    default:
      return "bg-red-500/20 text-red-400 border-red-500/40"
  }
}

export default function InvestmentReadinessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const { analyses } = useDecksStore()
  const { addReadiness } = useReadinessStore()

  const prefilledAnalysisId = searchParams.get("analysis_id") || ""

  const [analysisId, setAnalysisId] = useState(prefilledAnalysisId)
  const [sector, setSector] = useState(user?.sector || "")
  const [stage, setStage] = useState(user?.stage || "")
  const [revenue, setRevenue] = useState("")
  const [growthRate, setGrowthRate] = useState("")
  const [teamSize, setTeamSize] = useState(user?.teamSize?.toString() || "")
  const [runwayMonths, setRunwayMonths] = useState("")
  const [burnRate, setBurnRate] = useState("")
  const [arr, setArr] = useState("")
  const [customerCount, setCustomerCount] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<InvestmentReadinessResponse | null>(null)

  const completedAnalyses = analyses.filter((a) => a.overallScore > 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await calculateInvestmentReadiness({
        analysis_id: analysisId || undefined,
        sector: sector || undefined,
        stage: stage || undefined,
        monthly_revenue: revenue ? Number(revenue) : undefined,
        revenue_growth_rate: growthRate ? Number(growthRate) : undefined,
        team_size: teamSize ? Number(teamSize) : undefined,
        runway_months: runwayMonths ? Number(runwayMonths) : undefined,
        burn_rate: burnRate ? Number(burnRate) : undefined,
        arr: arr ? Number(arr) : undefined,
        customer_count: customerCount ? Number(customerCount) : undefined,
      })

      setResult(response)

      const stored: InvestmentReadinessData = {
        id: `readiness_${Date.now()}`,
        analysisId: analysisId || undefined,
        overallScore: response.overall_readiness_score,
        readinessLevel: response.readiness_level,
        componentScores: {
          pitchDeckQuality: response.component_scores.pitch_deck_quality,
          tractionMetrics: response.component_scores.traction_metrics,
          teamStrength: response.component_scores.team_strength,
          marketTiming: response.component_scores.market_timing,
          financialHealth: response.component_scores.financial_health,
        },
        keyImprovements: response.key_improvements,
        nextSteps: response.next_steps,
        estimatedTimeToReady: response.estimated_time_to_ready,
        calculatedAt: new Date().toISOString(),
      }
      addReadiness(stored)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate readiness")
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setResult(null)
    setError("")
  }

  if (result) {
    const gaugeData = [
      { name: "score", value: result.overall_readiness_score, fill: scoreColor(result.overall_readiness_score) },
    ]

    const radarData = [
      { category: "Pitch Deck", score: result.component_scores.pitch_deck_quality, fullMark: 100 },
      { category: "Traction", score: result.component_scores.traction_metrics, fullMark: 100 },
      { category: "Team", score: result.component_scores.team_strength, fullMark: 100 },
      { category: "Market Timing", score: result.component_scores.market_timing, fullMark: 100 },
      { category: "Financial Health", score: result.component_scores.financial_health, fullMark: 100 },
    ]

    return (
      <div className="mx-auto max-w-5xl space-y-8 pb-12">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Investment Readiness Results</h1>
          <p className="text-muted-foreground">Your startup&apos;s investment readiness assessment</p>
        </div>

        {/* Score + Readiness Level */}
        <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-primary/5">
          <CardContent className="p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex flex-col items-center justify-center">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Overall Readiness
                </h2>
                <div className="relative h-52 w-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="78%"
                      outerRadius="100%"
                      data={gaugeData}
                      startAngle={225}
                      endAngle={-45}
                      barSize={12}
                    >
                      <RadialBar
                        dataKey="value"
                        cornerRadius={6}
                        background={{ fill: "hsl(var(--muted))" }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-5xl font-bold"
                      style={{ color: scoreColor(result.overall_readiness_score) }}
                    >
                      {result.overall_readiness_score}
                    </span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`mt-3 text-sm ${readinessLevelBadge(result.readiness_level)}`}
                >
                  {result.readiness_level}
                </Badge>
                {result.estimated_time_to_ready && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Est. time to ready: <strong className="text-foreground">{result.estimated_time_to_ready}</strong>
                  </p>
                )}
              </div>

              {/* Radar Chart */}
              <div className="flex flex-col items-center justify-center">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Component Scores
                </h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="80%">
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis
                        dataKey="category"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="hsl(160 84% 39%)"
                        fill="hsl(160 84% 39%)"
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Score Bars */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {radarData.map((item) => (
              <div key={item.category} className="flex items-center gap-3">
                <span className="min-w-[140px] text-sm font-medium">{item.category}</span>
                <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-muted/50">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.score}%`, backgroundColor: scoreColor(item.score) }}
                  />
                </div>
                <span
                  className="min-w-[32px] text-right text-sm font-bold"
                  style={{ color: scoreColor(item.score) }}
                >
                  {item.score}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Key Improvements */}
        {result.key_improvements.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Key Improvements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.key_improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {result.next_steps.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.next_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {step}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card className="border-border/50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Calculate Again
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => router.push(`/valuation${sector ? `?sector=${encodeURIComponent(sector)}&stage=${encodeURIComponent(stage)}` : ""}`)}
              >
                Get Valuation Estimate
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => router.push("/dashboard")}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back
      </button>

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <TrendingUp className="h-6 w-6 text-primary" />
          Investment Readiness
        </h1>
        <p className="text-muted-foreground">
          Assess how ready your startup is for investment. Fill in the details below.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Analysis ID (optional) */}
            {completedAnalyses.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="analysis_id">Link to Analysis (optional)</Label>
                <Select value={analysisId} onValueChange={setAnalysisId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a completed analysis" />
                  </SelectTrigger>
                  <SelectContent>
                    {completedAnalyses.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.id.slice(0, 8)} — Score: {a.overallScore}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="revenue">Monthly Revenue (INR)</Label>
                <Input
                  id="revenue"
                  type="number"
                  placeholder="e.g. 500000"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arr">ARR (INR)</Label>
                <Input
                  id="arr"
                  type="number"
                  placeholder="e.g. 6000000"
                  value={arr}
                  onChange={(e) => setArr(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="growthRate">Revenue Growth Rate (%)</Label>
                <Input
                  id="growthRate"
                  type="number"
                  placeholder="e.g. 15"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerCount">Customer Count</Label>
                <Input
                  id="customerCount"
                  type="number"
                  placeholder="e.g. 200"
                  value={customerCount}
                  onChange={(e) => setCustomerCount(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="teamSize">Team Size</Label>
                <Input
                  id="teamSize"
                  type="number"
                  placeholder="e.g. 10"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="runwayMonths">Runway (months)</Label>
                <Input
                  id="runwayMonths"
                  type="number"
                  placeholder="e.g. 12"
                  value={runwayMonths}
                  onChange={(e) => setRunwayMonths(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="burnRate">Burn Rate (INR/month)</Label>
                <Input
                  id="burnRate"
                  type="number"
                  placeholder="e.g. 300000"
                  value={burnRate}
                  onChange={(e) => setBurnRate(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Calculate Investment Readiness
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
