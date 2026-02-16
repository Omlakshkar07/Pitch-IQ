"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  IndianRupee,
  Loader2,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuthStore, useValuationStore } from "@/lib/store"
import { getValuationBenchmark } from "@/lib/api"
import type { ValuationData } from "@/lib/types"
import type { ValuationBenchmarkResponse } from "@/lib/api"

const SECTORS = [
  "Technology", "Healthcare", "Fintech", "EdTech", "E-commerce",
  "SaaS", "AI/ML", "CleanTech", "AgriTech", "Logistics",
  "Real Estate", "Media", "Gaming", "FoodTech", "Other",
]

const STAGES = [
  "Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Growth",
]

function confidenceBadge(level: string) {
  switch (level) {
    case "High":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
    case "Medium":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40"
    default:
      return "bg-red-500/20 text-red-400 border-red-500/40"
  }
}

function formatCrores(value: number): string {
  return `${value.toFixed(1)} Cr`
}

export default function ValuationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const { addValuation } = useValuationStore()

  const [sector, setSector] = useState(searchParams.get("sector") || user?.sector || "")
  const [stage, setStage] = useState(searchParams.get("stage") || user?.stage || "")
  const [revenue, setRevenue] = useState("")
  const [arr, setArr] = useState("")
  const [mrr, setMrr] = useState("")
  const [revenueGrowthRate, setRevenueGrowthRate] = useState("")
  const [customerCount, setCustomerCount] = useState("")
  const [customerGrowthRate, setCustomerGrowthRate] = useState("")
  const [burnRate, setBurnRate] = useState("")
  const [runwayMonths, setRunwayMonths] = useState("")
  const [teamSize, setTeamSize] = useState(user?.teamSize?.toString() || "")
  const [grossMargin, setGrossMargin] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<ValuationBenchmarkResponse | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sector || !stage) {
      setError("Sector and stage are required.")
      return
    }
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await getValuationBenchmark({
        sector,
        stage,
        revenue: revenue ? Number(revenue) : undefined,
        arr: arr ? Number(arr) : undefined,
        mrr: mrr ? Number(mrr) : undefined,
        revenue_growth_rate: revenueGrowthRate ? Number(revenueGrowthRate) : undefined,
        customer_count: customerCount ? Number(customerCount) : undefined,
        customer_growth_rate: customerGrowthRate ? Number(customerGrowthRate) : undefined,
        burn_rate: burnRate ? Number(burnRate) : undefined,
        runway_months: runwayMonths ? Number(runwayMonths) : undefined,
        team_size: teamSize ? Number(teamSize) : undefined,
        gross_margin: grossMargin ? Number(grossMargin) : undefined,
      })

      setResult(response)

      const stored: ValuationData = {
        id: `valuation_${Date.now()}`,
        sector,
        stage,
        valuationBand: response.valuation_band,
        confidenceLevel: response.confidence_level,
        methodology: response.methodology,
        revenueMultiple: response.revenue_multiple,
        comparableCompanies: response.comparable_companies,
        keyFactors: response.key_factors,
        valuationTips: response.valuation_tips,
        disclaimer: response.disclaimer,
        calculatedAt: new Date().toISOString(),
      }
      addValuation(stored)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get valuation benchmark")
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setResult(null)
    setError("")
  }

  if (result) {
    const band = result.valuation_band
    const range = band.high - band.low
    const medianPosition = range > 0 ? ((band.median - band.low) / range) * 100 : 50

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
          <h1 className="text-2xl font-bold text-foreground">Valuation Benchmark Results</h1>
          <p className="text-muted-foreground">
            {sector} — {stage}
          </p>
        </div>

        {/* Valuation Range */}
        <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-primary/5">
          <CardContent className="p-6 md:p-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Estimated Valuation Range ({band.currency})
              </h2>
              <Badge variant="outline" className={`text-sm ${confidenceBadge(result.confidence_level)}`}>
                {result.confidence_level} Confidence
              </Badge>
            </div>

            {/* Valuation bar */}
            <div className="mb-6">
              <div className="relative mb-2 h-8 w-full overflow-hidden rounded-full bg-muted/30">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/30 via-primary/40 to-emerald-500/30" />
                <div
                  className="absolute top-0 h-full w-1 bg-foreground"
                  style={{ left: `${medianPosition}%` }}
                />
                <div
                  className="absolute -top-6 text-xs font-bold text-foreground"
                  style={{ left: `${medianPosition}%`, transform: "translateX(-50%)" }}
                >
                  {formatCrores(band.median)}
                </div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Low: <strong className="text-foreground">{formatCrores(band.low)}</strong></span>
                <span>Median: <strong className="text-foreground">{formatCrores(band.median)}</strong></span>
                <span>High: <strong className="text-foreground">{formatCrores(band.high)}</strong></span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border/50 bg-card/50 p-4 text-center">
                <p className="text-xs text-muted-foreground">Revenue Multiple</p>
                <p className="mt-1 text-2xl font-bold text-primary">{result.revenue_multiple}x</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/50 p-4 text-center">
                <p className="text-xs text-muted-foreground">Methodology</p>
                <p className="mt-1 text-sm font-medium text-foreground">{result.methodology}</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/50 p-4 text-center">
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{result.confidence_level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparable Companies */}
        {result.comparable_companies.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Comparable Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Valuation</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Sector</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.comparable_companies.map((company, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.valuation}</TableCell>
                      <TableCell>{company.stage}</TableCell>
                      <TableCell>{company.sector}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Key Factors */}
        {result.key_factors.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Key Valuation Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.key_factors.map((factor, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {factor}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        {result.valuation_tips.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Valuation Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.valuation_tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        {result.disclaimer && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            {result.disclaimer}
          </div>
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
                onClick={() => router.push("/investment-readiness")}
              >
                Check Investment Readiness
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
          <IndianRupee className="h-6 w-6 text-primary" />
          Valuation Benchmarking
        </h1>
        <p className="text-muted-foreground">
          Get a valuation estimate based on sector benchmarks and your financial metrics.
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sector">
                  Sector <span className="text-destructive">*</span>
                </Label>
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
                <Label htmlFor="stage">
                  Stage <span className="text-destructive">*</span>
                </Label>
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

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="revenue">Revenue (INR)</Label>
                <Input
                  id="revenue"
                  type="number"
                  placeholder="e.g. 5000000"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arr">ARR (INR)</Label>
                <Input
                  id="arr"
                  type="number"
                  placeholder="e.g. 60000000"
                  value={arr}
                  onChange={(e) => setArr(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mrr">MRR (INR)</Label>
                <Input
                  id="mrr"
                  type="number"
                  placeholder="e.g. 5000000"
                  value={mrr}
                  onChange={(e) => setMrr(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="revenueGrowthRate">Revenue Growth Rate (%)</Label>
                <Input
                  id="revenueGrowthRate"
                  type="number"
                  placeholder="e.g. 20"
                  value={revenueGrowthRate}
                  onChange={(e) => setRevenueGrowthRate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerCount">Customer Count</Label>
                <Input
                  id="customerCount"
                  type="number"
                  placeholder="e.g. 500"
                  value={customerCount}
                  onChange={(e) => setCustomerCount(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerGrowthRate">Customer Growth Rate (%)</Label>
                <Input
                  id="customerGrowthRate"
                  type="number"
                  placeholder="e.g. 10"
                  value={customerGrowthRate}
                  onChange={(e) => setCustomerGrowthRate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grossMargin">Gross Margin (%)</Label>
                <Input
                  id="grossMargin"
                  type="number"
                  placeholder="e.g. 70"
                  value={grossMargin}
                  onChange={(e) => setGrossMargin(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
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
              <div className="space-y-2">
                <Label htmlFor="runwayMonths">Runway (months)</Label>
                <Input
                  id="runwayMonths"
                  type="number"
                  placeholder="e.g. 18"
                  value={runwayMonths}
                  onChange={(e) => setRunwayMonths(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamSize">Team Size</Label>
                <Input
                  id="teamSize"
                  type="number"
                  placeholder="e.g. 15"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
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
                  <IndianRupee className="mr-2 h-4 w-4" />
                  Get Valuation Benchmark
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
