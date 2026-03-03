"use client"

import React from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  FileText,
  BarChart,
  Clock,
  TrendingUp,
  Upload,
  List,
  GitCompare,
  ArrowUpRight,
  Gauge,
  IndianRupee,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/store"
import { auth } from "@/lib/firebase"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = React.useState<{ decks: any[], analyses: any[], latestReadiness: any }>({ decks: [], analyses: [], latestReadiness: null })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) { setLoading(false); return; }
        const idToken = await currentUser.getIdToken()
        const res = await fetch('/api/dashboard', {
          headers: { 'Authorization': `Bearer ${idToken}` },
        })
        const d = await res.json()
        setData({
          decks: Array.isArray(d.decks) ? d.decks : [],
          analyses: Array.isArray(d.analyses) ? d.analyses : [],
          latestReadiness: d.latestReadiness ?? null,
        })
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const { decks = [], analyses = [], latestReadiness = null } = data ?? {}

  const completedDecks = (decks ?? []).filter((d) => d.status === "completed")
  const latestDeck = completedDecks.sort(
    (a, b) => new Date(b.uploaded_at || b.uploadDate).getTime() - new Date(a.uploaded_at || a.uploadDate).getTime()
  )[0]
  const latestAnalysis = latestDeck
    ? analyses.find((a) => a.deck_id === latestDeck.id || a.deckId === latestDeck.id)
    : undefined

  const avgScore =
    analyses.length > 0
      ? Math.round(analyses.reduce((sum, a) => sum + (a.overall_score || a.overallScore || 0), 0) / analyses.length)
      : 0

  const previousAnalysis =
    analyses.length >= 2
      ? analyses.sort(
        (a, b) => new Date(b.analyzed_at || b.analyzedAt).getTime() - new Date(a.analyzed_at || a.analyzedAt).getTime()
      )[1]
      : undefined

  const scoreDelta =
    latestAnalysis && previousAnalysis
      ? (latestAnalysis.overall_score || latestAnalysis.overallScore || 0) - (previousAnalysis.overall_score || previousAnalysis.overallScore || 0)
      : 0

  // Chart data
  const chartData = completedDecks
    .map((deck, i) => {
      const analysis = analyses.find((a) => a.deck_id === deck.id || a.deckId === deck.id)
      return {
        name: `v${i + 1}`,
        score: analysis?.overall_score || analysis?.overallScore || 0,
      }
    })
    .reverse()

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground animate-pulse">Loading dashboard...</div>
  }

  if (decks.length === 0) {
    return (
      <div>
        <h1 className="mb-1 text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mb-8 text-muted-foreground">
          Welcome, {user?.name}! Upload your first deck to get started.
        </p>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-4 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">No pitch decks analyzed yet</h2>
          <p className="mb-6 max-w-sm text-muted-foreground">
            Upload your first deck to get personalized insights and track your investment readiness.
          </p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Your First Deck
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Deck
          </Link>
        </Button>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-white/10 bg-black/20 backdrop-blur-md rounded-2xl shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {latestReadiness ? "Investment Readiness" : "Readiness Score"}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {latestReadiness?.overallScore ?? latestAnalysis?.overallScore ?? 0}
                  <span className="text-base font-normal text-muted-foreground">/100</span>
                </p>
                {latestReadiness ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {latestReadiness.readinessLevel}
                  </p>
                ) : scoreDelta !== 0 ? (
                  <p className={`mt-1 flex items-center text-xs ${scoreDelta > 0 ? "text-primary" : "text-destructive"}`}>
                    <TrendingUp className={`mr-1 h-3 w-3 ${scoreDelta < 0 ? "rotate-180" : ""}`} />
                    {scoreDelta > 0 ? "+" : ""}
                    {scoreDelta} from last deck
                  </p>
                ) : null}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Gauge className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20 backdrop-blur-md rounded-2xl shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Decks Analyzed</p>
                <p className="text-3xl font-bold text-foreground">{completedDecks.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">Total analyses</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20 backdrop-blur-md rounded-2xl shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-3xl font-bold text-foreground">
                  {avgScore}
                  <span className="text-base font-normal text-muted-foreground">/100</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Across all decks</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BarChart className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20 backdrop-blur-md rounded-2xl shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Upload</p>
                <p className="text-xl font-bold text-foreground">
                  {latestDeck
                    ? formatDistanceToNow(new Date(latestDeck.uploaded_at || latestDeck.uploadDate), { addSuffix: true })
                    : "N/A"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Last activity</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest analysis */}
      {latestDeck && latestAnalysis && (
        <Card className="mb-8 border-white/10 bg-black/20 backdrop-blur-md rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Latest Pitch Deck Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-foreground">{latestDeck.filename}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(latestDeck.uploaded_at || latestDeck.uploadDate), { addSuffix: true })}
                </p>
                <Badge
                  variant="secondary"
                  className="mt-2 bg-primary/10 text-primary"
                >
                  Completed
                </Badge>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary">
                  <span className="text-lg font-bold text-foreground">{latestAnalysis.overall_score || latestAnalysis.overallScore || 0}</span>
                </div>
                <div className="flex gap-1.5">
                  {Object.entries(latestAnalysis.flags || {}).map(([key, flag]) => (
                    <div
                      key={key}
                      className={`h-3 w-3 rounded-full ${flag === "green"
                        ? "bg-primary"
                        : flag === "amber"
                          ? "bg-[hsl(var(--flag-amber))]"
                          : "bg-destructive"
                        }`}
                      title={`${key}: ${flag}`}
                    />
                  ))}
                </div>
              </div>
              <Button asChild variant="outline" className="bg-transparent">
                <Link href={`/analysis/${latestAnalysis.id}`}>
                  View Full Analysis
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score progress chart */}
      {chartData.length > 1 && (
        <Card className="mb-8 border-white/10 bg-black/20 backdrop-blur-md rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Readiness Score Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(220 9% 46%)" }} />
                  <YAxis domain={[0, 100]} className="text-xs" tick={{ fill: "hsl(220 9% 46%)" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 100%)",
                      border: "1px solid hsl(220 13% 91%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(160 84% 39%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(160 84% 39%)", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Link href="/upload" className="group">
          <Card className="border-white/10 bg-black/20 backdrop-blur-md rounded-2xl shadow-xl transition-all hover:bg-black/30 hover:shadow-2xl hover:scale-[1.02]">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground">Upload New Deck</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/analyses" className="group">
          <Card className="border-white/10 bg-black/20 backdrop-blur-md rounded-2xl shadow-xl transition-all hover:bg-black/30 hover:shadow-2xl hover:scale-[1.02]">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <List className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">View All Analyses</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/investment-readiness" className="group">
          <Card className="border-white/10 bg-black/20 backdrop-blur-md rounded-2xl shadow-xl transition-all hover:bg-black/30 hover:shadow-2xl hover:scale-[1.02]">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground">Investment Readiness</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/valuation" className="group">
          <Card className="border-white/10 bg-black/20 backdrop-blur-md rounded-2xl shadow-xl transition-all hover:bg-black/30 hover:shadow-2xl hover:scale-[1.02]">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <IndianRupee className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground">Valuation Estimate</p>
            </CardContent>
          </Card>
        </Link>

        {completedDecks.length >= 2 ? (
          <Link href="/compare" className="group">
            <Card className="border-white/10 bg-black/20 backdrop-blur-md rounded-2xl shadow-xl transition-all hover:bg-black/30 hover:shadow-2xl hover:scale-[1.02]">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <GitCompare className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-semibold text-foreground">Compare Decks</p>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <div>
            <Card className="border-white/10 bg-black/20 backdrop-blur-md rounded-2xl opacity-60">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <GitCompare className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-semibold text-foreground">Compare Decks</p>
                <Badge variant="secondary" className="mt-2">
                  {"Need 2+ decks"}
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
