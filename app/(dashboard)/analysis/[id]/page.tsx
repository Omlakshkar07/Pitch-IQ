"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDecksStore } from "@/lib/store"
import type { DeckAnalysis } from "@/lib/types"
import { format } from "date-fns"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Users,
  TrendingUp,
  Briefcase,
  Target,
  GraduationCap,
  Clock,
  Zap,
  Shield,
  Star,
  Activity,
  Eye,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

/* ─────────────────────── helpers ─────────────────────── */
function scoreColor(score: number) {
  if (score >= 71) return "#22c55e"
  if (score >= 41) return "#f97316"
  return "#ef4444"
}

function scoreLabel(score: number) {
  if (score >= 86) return "🌟 Excellent"
  if (score >= 71) return "✅ Good"
  if (score >= 41) return "⚠️ Needs Work"
  return "⚠️ Needs Significant Work"
}

function flagBadge(flag: "red" | "amber" | "green") {
  const map = {
    red: { label: "Critical", cls: "bg-red-500/20 text-red-400 border-red-500/40" },
    amber: { label: "Moderate", cls: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
    green: { label: "Good", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" },
  }
  return map[flag]
}

function priorityBadge(p: "high" | "medium" | "low") {
  const map = {
    high: { icon: "🎯", cls: "bg-red-500/20 text-red-400 border-red-500/40" },
    medium: { icon: "📊", cls: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
    low: { icon: "💡", cls: "bg-blue-500/20 text-blue-400 border-blue-500/40" },
  }
  return map[p]
}

function tractionStatusIcon(s: "green" | "amber" | "red") {
  if (s === "green") return <CheckCircle className="h-4 w-4 text-emerald-400" />
  if (s === "amber") return <AlertTriangle className="h-4 w-4 text-amber-400" />
  return <AlertTriangle className="h-4 w-4 text-red-400" />
}

/* ─────────────────────── categories ─────────────────────── */
type CatKey = "idea" | "team" | "market" | "traction" | "risk" | "scalability"
const CATEGORIES: { key: CatKey; label: string; icon: React.ReactNode }[] = [
  { key: "team", label: "Team Capability", icon: <Users className="h-4 w-4" /> },
  { key: "market", label: "Market Opportunity", icon: <Target className="h-4 w-4" /> },
  { key: "scalability", label: "Scalability", icon: <TrendingUp className="h-4 w-4" /> },
  { key: "idea", label: "Idea Novelty", icon: <Lightbulb className="h-4 w-4" /> },
  { key: "traction", label: "Traction / Feasibility", icon: <Activity className="h-4 w-4" /> },
  { key: "risk", label: "Risk / Sustainability", icon: <Shield className="h-4 w-4" /> },
]

function getScore(a: DeckAnalysis, key: CatKey) {
  const map: Record<CatKey, number> = {
    idea: a.ideaScore,
    team: a.teamScore,
    market: a.marketScore,
    traction: a.tractionScore,
    risk: a.riskScore,
    scalability: a.scalabilityScore,
  }
  return map[key]
}

/* ─────────────────────── Component ─────────────────────── */
export default function AnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const { analyses, decks, loadFromStorage } = useDecksStore()
  const [analysis, setAnalysis] = useState<DeckAnalysis | null>(null)
  const [deckName, setDeckName] = useState("")
  const [expandedCats, setExpandedCats] = useState<Set<CatKey>>(new Set())
  const [showTeam, setShowTeam] = useState(true)
  const [showBusiness, setShowBusiness] = useState(true)
  const [chartView, setChartView] = useState<"bar" | "radar">("bar")

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  useEffect(() => {
    const id = params.id as string
    const found = analyses.find((a) => a.id === id || a.deckId === id)
    if (found) {
      setAnalysis(found)
      const deck = decks.find((d) => d.id === found.deckId)
      setDeckName(deck?.filename ?? "Unknown Deck")
    }
  }, [params.id, analyses, decks])

  if (!analysis) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading analysis…</p>
        </div>
      </div>
    )
  }

  const toggleCat = (key: CatKey) => {
    setExpandedCats((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const sortedCats = [...CATEGORIES].sort((a, b) => getScore(analysis, b.key) - getScore(analysis, a.key))

  const radarData = CATEGORIES.map((c) => ({
    category: c.label,
    score: getScore(analysis, c.key),
    fullMark: 100,
  }))

  const gaugeData = [
    { name: "score", value: analysis.overallScore, fill: scoreColor(analysis.overallScore) },
  ]

  /* top 2 strengths & bottom 2 concerns from sorted categories */
  const top2 = sortedCats.slice(0, 2)
  const bottom2 = sortedCats.slice(-2).reverse()

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* ───────── Back button ───────── */}
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Analyses
      </button>

      {/* ═══════════════════════════════════════════════════════
          SECTION 1 — HEADER: Overall Score + Percentile + Insights
         ═══════════════════════════════════════════════════════ */}
      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-primary/5">
        <CardContent className="p-6 md:p-8">
          {/* metadata bar */}
          <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono">ID: {analysis.id.slice(0, 8)}</span>
            <span className="hidden sm:inline">•</span>
            <span>{format(new Date(analysis.analyzedAt), "MMM d, yyyy 'at' h:mm a")}</span>
            <span className="hidden sm:inline">•</span>
            <span className="truncate">{deckName}</span>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* ── Overall Score Gauge ── */}
            <div className="flex flex-col items-center justify-center">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Overall Score
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
                {/* center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-5xl font-bold"
                    style={{ color: scoreColor(analysis.overallScore) }}
                  >
                    {analysis.overallScore}
                  </span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
              </div>
              <span className="mt-2 text-base font-medium">{scoreLabel(analysis.overallScore)}</span>
            </div>

            {/* ── Percentile + Quick Insights ── */}
            <div className="flex flex-col justify-center space-y-6">
              {/* Percentile bar */}
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Percentile Ranking
                </h3>
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted/50">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
                    style={{ width: `${analysis.percentile}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-medium text-muted-foreground">
                    <span>0</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  You&apos;re in the <strong className="text-foreground">{analysis.percentile}th percentile</strong> of analyzed decks
                </p>
              </div>

              {/* Quick insights */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Insights
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm">
                    <span className="mt-0.5 shrink-0">💪</span>
                    <span>
                      <strong className="text-emerald-400">Strengths:</strong>{" "}
                      {top2.map((c) => `${c.label} (${getScore(analysis, c.key)})`).join(", ")}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm">
                    <span className="mt-0.5 shrink-0">⚠️</span>
                    <span>
                      <strong className="text-amber-400">Concerns:</strong>{" "}
                      {bottom2.map((c) => `${c.label} (${getScore(analysis, c.key)})`).join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2 — SCORE BREAKDOWN
         ═══════════════════════════════════════════════════════ */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Score Breakdown
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={chartView === "bar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartView("bar")}
              className="h-7 px-2 text-xs"
            >
              Bars
            </Button>
            <Button
              variant={chartView === "radar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartView("radar")}
              className="h-7 px-2 text-xs"
            >
              Radar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {chartView === "radar" && (
            <div className="mx-auto h-72 w-full max-w-md">
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
                    stroke="#f97316"
                    fill="#f97316"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartView === "bar" && (
            <div className="space-y-3">
              {sortedCats.map((cat) => {
                const score = getScore(analysis, cat.key)
                const expanded = expandedCats.has(cat.key)
                const fb = flagBadge(analysis.flags[cat.key])
                return (
                  <div key={cat.key} className="rounded-xl border border-border/50 bg-card/50">
                    {/* bar row */}
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
                      onClick={() => toggleCat(cat.key)}
                    >
                      <span className="text-muted-foreground">{cat.icon}</span>
                      <span className="min-w-[140px] text-sm font-medium">{cat.label}</span>
                      <div className="relative mx-2 h-3 flex-1 overflow-hidden rounded-full bg-muted/50">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${score}%`,
                            backgroundColor: scoreColor(score),
                          }}
                        />
                      </div>
                      <span
                        className="min-w-[32px] text-right text-sm font-bold"
                        style={{ color: scoreColor(score) }}
                      >
                        {score}
                      </span>
                      <Badge variant="outline" className={`ml-1 hidden text-[10px] sm:inline-flex ${fb.cls}`}>
                        {fb.label}
                      </Badge>
                      {expanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    {/* expanded details */}
                    {expanded && (
                      <div className="border-t border-border/30 px-5 py-4 text-sm leading-relaxed">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="mb-2 flex items-center gap-1.5 font-semibold text-emerald-400">
                              <CheckCircle className="h-3.5 w-3.5" /> Strengths
                            </h4>
                            <p className="text-muted-foreground">{analysis.feedback[cat.key]}</p>
                          </div>
                          <div>
                            <h4 className="mb-2 flex items-center gap-1.5 font-semibold text-amber-400">
                              <AlertTriangle className="h-3.5 w-3.5" /> Gaps
                            </h4>
                            <p className="text-muted-foreground">{analysis.feedbackGaps[cat.key]}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3 — RISK ASSESSMENT
         ═══════════════════════════════════════════════════════ */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* flag count cards */}
          <div className="grid grid-cols-3 gap-3">
            {(["red", "amber", "green"] as const).map((level) => {
              const count = analysis.riskFlags[level].length
              const colors = {
                red: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", emoji: "🔴" },
                amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", emoji: "🟠" },
                green: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", emoji: "🟢" },
              }
              const c = colors[level]
              return (
                <div
                  key={level}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-4 ${c.bg} ${c.border}`}
                >
                  <span className="text-lg">{c.emoji}</span>
                  <span className={`text-3xl font-bold ${c.text}`}>{count}</span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {level === "red" ? "Red Flags" : level === "amber" ? "Amber Flags" : "Green Flags"}
                  </span>
                </div>
              )
            })}
          </div>

          {/* flag lists */}
          {analysis.riskFlags.red.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-red-400">
                🔴 Critical Concerns
              </h4>
              <div className="space-y-3">
                {analysis.riskFlags.red.map((f, i) => (
                  <div key={i} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                    <p className="text-sm">{f.description}</p>
                    {f.mitigation && (
                      <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                        <span>Consider: {f.mitigation}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.riskFlags.amber.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-amber-400">
                🟠 Moderate Concerns
              </h4>
              <div className="space-y-3">
                {analysis.riskFlags.amber.map((f, i) => (
                  <div key={i} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                    <p className="text-sm">{f.description}</p>
                    {f.mitigation && (
                      <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                        <span>Consider: {f.mitigation}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.riskFlags.green.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-emerald-400">
                🟢 Positive Indicators
              </h4>
              <div className="space-y-2">
                {analysis.riskFlags.green.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                    {f.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4 — IMPROVEMENT ROADMAP
         ═══════════════════════════════════════════════════════ */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-primary" />
            Improvement Roadmap ({analysis.improvementItems.length} Items)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.improvementItems.map((item, idx) => {
            const pb = priorityBadge(item.priority)
            return (
              <div
                key={idx}
                className="rounded-xl border border-border/50 bg-card/50 p-5 transition-colors hover:border-primary/30"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-lg">{pb.icon}</span>
                    <div>
                      <h4 className="font-semibold">
                        {idx + 1}. {item.title}
                      </h4>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge variant="outline" className={`text-[10px] ${pb.cls}`}>
                          {item.priority.toUpperCase()} PRIORITY
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-9 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BarChart3 className="h-3.5 w-3.5 text-primary" />
                    <span>Impact: <strong className="text-foreground">{item.impact}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>Effort: <strong className="text-foreground">{item.effort}</strong></span>
                  </div>
                </div>

                <div className="ml-9 mt-3">
                  <h5 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <CheckCircle className="h-3 w-3" /> What to do
                  </h5>
                  <ul className="space-y-1">
                    {item.steps.map((step, si) => (
                      <li key={si} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          SECTION 5 — TEAM & TRACTION
         ═══════════════════════════════════════════════════════ */}
      <Card className="border-border/50">
        <CardHeader>
          <button
            className="flex w-full items-center justify-between"
            onClick={() => setShowTeam(!showTeam)}
          >
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Team & Traction
            </CardTitle>
            {showTeam ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </CardHeader>

        {showTeam && (
          <CardContent className="space-y-6">
            {/* team members */}
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Founding Team
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {analysis.teamMembers.map((m, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border/50 bg-card/50 p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                        {m.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.role}</p>
                      </div>
                    </div>
                    <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <GraduationCap className="h-3 w-3" />
                      {m.education}
                    </div>
                    <ul className="space-y-1">
                      {m.experience.map((exp, ei) => (
                        <li key={ei} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                          {exp}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* expertise & gaps */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-emerald-400">Expertise Coverage</h4>
                <div className="space-y-1">
                  {analysis.teamExpertise.map((e, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      {e}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-amber-400">Potential Gaps</h4>
                <div className="space-y-1">
                  {analysis.teamGaps.map((g, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      {g}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* traction metrics */}
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Traction Metrics
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Revenue", value: analysis.tractionMetrics.revenue, status: analysis.tractionMetrics.revenueStatus },
                  { label: "Growth Rate", value: analysis.tractionMetrics.growthRate, status: analysis.tractionMetrics.growthStatus },
                  { label: "Capital Raised", value: analysis.tractionMetrics.capitalRaised, status: analysis.tractionMetrics.capitalStatus },
                ].map((m, i) => (
                  <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="mt-1 text-lg font-bold">{m.value}</p>
                    <div className="mt-1 flex justify-center">{tractionStatusIcon(m.status)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* indicators & missing */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-emerald-400">Growth Indicators</h4>
                {analysis.tractionIndicators.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 py-0.5 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 text-primary" />
                    {t}
                  </div>
                ))}
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-amber-400">Missing Data</h4>
                {analysis.tractionMissing.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 py-0.5 text-sm text-muted-foreground">
                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════
          SECTION 6 — BUSINESS MODEL & MARKET
         ═══════════════════════════════════════════════════════ */}
      <Card className="border-border/50">
        <CardHeader>
          <button
            className="flex w-full items-center justify-between"
            onClick={() => setShowBusiness(!showBusiness)}
          >
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-primary" />
              Business Model & Market
            </CardTitle>
            {showBusiness ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </CardHeader>

        {showBusiness && (
          <CardContent className="space-y-6">
            {/* Business Model */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" /> Business Model
              </h4>
              <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{analysis.businessModel}</p>
              <div className="flex flex-wrap gap-2">
                {analysis.businessModelTraits.map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
                    <CheckCircle className="h-3 w-3" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Market Problem & Solution */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/50 p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-400">
                  <Target className="h-3.5 w-3.5" /> Problem
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">{analysis.marketProblem}</p>
              </div>
              <div className="rounded-xl border border-border/50 p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  <Lightbulb className="h-3.5 w-3.5" /> Solution
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">{analysis.marketSolution}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════
          KEY TAKEAWAYS
         ═══════════════════════════════════════════════════════ */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle className="h-4 w-4" /> Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4" /> Critical Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {analysis.criticalGaps.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  {g}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-primary">
              <Zap className="h-4 w-4" /> Quick Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {analysis.quickWins.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {q}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════════════
          FOOTER ACTIONS
         ═══════════════════════════════════════════════════════ */}
      <Card className="border-border/50">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Compare to Benchmarks
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => router.push(`/investment-readiness?analysis_id=${analysis.id}`)}
            >
              <TrendingUp className="h-4 w-4" />
              Check Investment Readiness
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => router.push("/analyses")}
            >
              <ArrowLeft className="h-4 w-4" />
              All Analyses
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => router.push("/upload")}
            >
              <Upload className="h-4 w-4" />
              Upload New Version
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
