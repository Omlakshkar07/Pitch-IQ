"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Upload,
  GitCompare,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDecksStore } from "@/lib/store"
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts"

const dimensionLabels = [
  { key: "ideaScore" as const, label: "Market Problem & Opportunity" },
  { key: "scalabilityScore" as const, label: "Solution Differentiation" },
  { key: "teamScore" as const, label: "Team Capability" },
  { key: "tractionScore" as const, label: "Traction & Metrics" },
  { key: "riskScore" as const, label: "Business Model" },
  { key: "marketScore" as const, label: "Risk & Defensibility" },
]

function DeltaBadge({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <span className="flex items-center gap-1 text-sm font-medium text-primary">
        <ArrowUp className="h-3 w-3" />+{delta}
      </span>
    )
  }
  if (delta < 0) {
    return (
      <span className="flex items-center gap-1 text-sm font-medium text-destructive">
        <ArrowDown className="h-3 w-3" />{delta}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-sm text-muted-foreground">
      <Minus className="h-3 w-3" />0
    </span>
  )
}

function ScoreGauge({ score, size = 120 }: { score: number; size?: number }) {
  const data = [{ value: score, fill: "hsl(160 84% 39%)" }]
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          data={data}
        >
          <RadialBar dataKey="value" background={{ fill: "hsl(210 18% 96%)" }} cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  )
}

function readinessLabel(score: number): { label: string; color: string } {
  if (score >= 75) return { label: "Ready", color: "bg-primary/10 text-primary" }
  if (score >= 50) return { label: "Nearly Ready", color: "bg-[hsl(var(--flag-amber))]/10 text-[hsl(var(--flag-amber))]" }
  return { label: "Not Ready", color: "bg-destructive/10 text-destructive" }
}

export default function ComparePage() {
  const searchParams = useSearchParams()
  const { decks, analyses } = useDecksStore()

  const completedDecks = decks.filter((d) => d.status === "completed")

  const [deck1Id, setDeck1Id] = useState(searchParams.get("deck1") || "")
  const [deck2Id, setDeck2Id] = useState(searchParams.get("deck2") || "")

  const deck1 = completedDecks.find((d) => d.id === deck1Id)
  const deck2 = completedDecks.find((d) => d.id === deck2Id)
  const analysis1 = deck1 ? analyses.find((a) => a.deckId === deck1.id) : undefined
  const analysis2 = deck2 ? analyses.find((a) => a.deckId === deck2.id) : undefined

  const canCompare = analysis1 && analysis2

  const improved = useMemo(() => {
    if (!analysis1 || !analysis2) return []
    return dimensionLabels.filter(
      (d) => (analysis2[d.key] as number) > (analysis1[d.key] as number)
    )
  }, [analysis1, analysis2])

  const declined = useMemo(() => {
    if (!analysis1 || !analysis2) return []
    return dimensionLabels.filter(
      (d) => (analysis2[d.key] as number) < (analysis1[d.key] as number)
    )
  }, [analysis1, analysis2])

  if (completedDecks.length < 2) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Compare Pitch Decks</h1>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-4 py-20 text-center">
          <GitCompare className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold text-foreground">Need at least 2 analyzed decks</h2>
          <p className="mb-6 max-w-sm text-muted-foreground">
            Upload and analyze at least two pitch decks to compare them side-by-side.
          </p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload a Deck
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <nav className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-foreground">Compare</span>
      </nav>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Compare Pitch Decks</h1>

      {/* Deck selection */}
      <Card className="mb-8 border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex-1 w-full">
              <Select value={deck1Id} onValueChange={setDeck1Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select First Deck" />
                </SelectTrigger>
                <SelectContent>
                  {completedDecks.map((d) => (
                    <SelectItem key={d.id} value={d.id} disabled={d.id === deck2Id}>
                      {d.filename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm font-medium text-muted-foreground">vs</span>
            <div className="flex-1 w-full">
              <Select value={deck2Id} onValueChange={setDeck2Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Second Deck" />
                </SelectTrigger>
                <SelectContent>
                  {completedDecks.map((d) => (
                    <SelectItem key={d.id} value={d.id} disabled={d.id === deck1Id}>
                      {d.filename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {canCompare && (
        <>
          {/* Overall scores */}
          <Card className="mb-8 border-border">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 items-center gap-4">
                {/* Deck 1 */}
                <div className="flex flex-col items-center text-center">
                  <ScoreGauge score={analysis1.overallScore} />
                  <Badge className={`mt-3 border-0 ${readinessLabel(analysis1.overallScore).color}`}>
                    {readinessLabel(analysis1.overallScore).label}
                  </Badge>
                  <p className="mt-2 text-sm font-medium text-foreground">{deck1!.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(analysis1.analyzedAt), { addSuffix: true })}
                  </p>
                </div>

                {/* Delta */}
                <div className="flex flex-col items-center">
                  <div className="text-center">
                    {(() => {
                      const delta = analysis2.overallScore - analysis1.overallScore
                      if (delta > 0) return (
                        <div className="flex flex-col items-center">
                          <ArrowUp className="h-6 w-6 text-primary" />
                          <span className="text-lg font-bold text-primary">+{delta} points</span>
                        </div>
                      )
                      if (delta < 0) return (
                        <div className="flex flex-col items-center">
                          <ArrowDown className="h-6 w-6 text-destructive" />
                          <span className="text-lg font-bold text-destructive">{delta} points</span>
                        </div>
                      )
                      return (
                        <div className="flex flex-col items-center">
                          <Minus className="h-6 w-6 text-muted-foreground" />
                          <span className="text-lg font-bold text-muted-foreground">No change</span>
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Deck 2 */}
                <div className="flex flex-col items-center text-center">
                  <ScoreGauge score={analysis2.overallScore} />
                  <Badge className={`mt-3 border-0 ${readinessLabel(analysis2.overallScore).color}`}>
                    {readinessLabel(analysis2.overallScore).label}
                  </Badge>
                  <p className="mt-2 text-sm font-medium text-foreground">{deck2!.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(analysis2.analyzedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dimension comparison */}
          <Card className="mb-8 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Dimension Scores Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dimensionLabels.map((dim) => {
                  const s1 = analysis1[dim.key] as number
                  const s2 = analysis2[dim.key] as number
                  const delta = s2 - s1
                  return (
                    <div key={dim.key} className="grid grid-cols-7 items-center gap-2">
                      <div className="col-span-2 text-sm text-foreground">{dim.label}</div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-muted-foreground/40"
                              style={{ width: `${s1}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-sm font-medium text-muted-foreground">{s1}</span>
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <DeltaBadge delta={delta} />
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-muted">
                            <div
                              className={`h-2 rounded-full ${
                                delta > 0 ? "bg-primary" : delta < 0 ? "bg-destructive" : "bg-muted-foreground/40"
                              }`}
                              style={{ width: `${s2}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-sm font-medium text-foreground">{s2}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Improvement / decline cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-primary">
                  <ArrowUp className="h-4 w-4" />
                  What Improved
                </CardTitle>
              </CardHeader>
              <CardContent>
                {improved.length > 0 ? (
                  <ul className="space-y-2">
                    {improved.map((d) => (
                      <li key={d.key} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{d.label}</span>
                        <span className="text-primary">
                          {analysis1[d.key]} → {analysis2[d.key]}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No improvements detected.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-destructive">
                  <ArrowDown className="h-4 w-4" />
                  What Declined
                </CardTitle>
              </CardHeader>
              <CardContent>
                {declined.length > 0 ? (
                  <ul className="space-y-2">
                    {declined.map((d) => (
                      <li key={d.key} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{d.label}</span>
                        <span className="text-destructive">
                          {analysis1[d.key]} → {analysis2[d.key]}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No declines detected.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => { setDeck1Id(""); setDeck2Id("") }} className="bg-transparent">
              Compare Different Decks
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload New Improved Version
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
