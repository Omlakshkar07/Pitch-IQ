"use client"

import Link from "next/link"
import { Play, Search, Bell, ChevronDown, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FlickeringGrid } from "@/components/magicui/flickering-grid"
import { CyberneticBentoGrid } from "@/components/ui/cybernetic-bento-grid"
import { HowItWorks } from "@/components/ui/how-it-works"
import { TestimonialsSection } from "@/components/ui/testimonials"
import { Logos3 } from "@/components/ui/logos3"
import { Footer } from "@/components/ui/footer-section"
import { Navbar } from "@/components/ui/navbar"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pt-24">
        {/* Background */}
        <FlickeringGrid
          className="absolute inset-0 z-0 size-full"
          squareSize={4}
          gridGap={6}
          color="#9CFF1E"
          maxOpacity={0.15} /* Slightly reduced since neon green is quite bright */
          flickerChance={0.1}
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-primary" />
              AI-Powered Deal Intelligence
            </div>

            {/* Main Headline */}
            <h1 className="mb-6 max-w-4xl text-balance text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              From Pitch Deck to
              <br />
              Term Sheet
            </h1>

            {/* Subtext */}
            <p className="mb-10 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              AI-powered deal intelligence platform helping founders perfect their pitch, understand their valuation, and connect with the right investors
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="h-12 rounded-full bg-primary px-8 text-base font-medium text-white hover:bg-primary/90"
              >
                <Link href="/signup">Start Your Free Analysis</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-border bg-transparent px-8 text-base font-medium text-foreground hover:bg-card"
              >
                <Play className="mr-2 h-4 w-4 fill-current" />
                Watch How It Works
              </Button>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mt-16 flex justify-center">
            <div className="dashboard-card w-full max-w-4xl overflow-hidden p-6">
              {/* Dashboard Header */}
              <div className="mb-6 flex items-center justify-between">
                {/* Left - Logo & Nav */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">P</div>
                    <span className="text-sm font-medium text-foreground">PitchIQ Admin</span>
                  </div>
                  <div className="hidden items-center gap-4 text-xs text-muted-foreground md:flex">
                    <span className="text-foreground">Portfolio Overview</span>
                    <span>Deal Flow</span>
                    <span>Analytics</span>
                    <span>Founders</span>
                    <span>Settings</span>
                  </div>
                </div>
                {/* Right - User */}
                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-muted" />
                    <span className="hidden text-xs text-muted-foreground md:block">Alex Partner</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-4">
                {/* Greeting */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Good morning, Alex</h2>
                  <p className="text-xs text-muted-foreground">Monitor your portfolio readiness, track founder progress, and identify investment opportunities.</p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {/* Portfolio Avg Score */}
                  <div className="rounded-xl bg-card/80 p-4 ring-1 ring-white/10">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Portfolio Avg Score</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">72/100</div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-500">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>+5 this quarter</span>
                    </div>
                  </div>

                  {/* Active Founders */}
                  <div className="rounded-xl bg-card/80 p-4 ring-1 ring-white/10">
                    <span className="text-xs text-muted-foreground">Active Founders</span>
                    <div className="mt-2 text-2xl font-bold text-foreground">47 founders</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-green-500">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>12 new this month</span>
                    </div>
                  </div>

                  {/* Deals Reviewed */}
                  <div className="rounded-xl bg-card/80 p-4 ring-1 ring-white/10">
                    <span className="text-xs text-muted-foreground">Deals Reviewed</span>
                    <div className="mt-2 text-2xl font-bold text-foreground">156 pitches</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-green-500">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>This month</span>
                    </div>
                  </div>

                  {/* Investment-Ready Startups (Orange Accent) */}
                  <div className="accent-card rounded-xl p-4 ring-1 ring-white/10">
                    <span className="text-xs text-white/80">Investment-Ready Startups</span>
                    <div className="mt-2 text-2xl font-bold text-white">8 startups</div>
                    <div className="text-xs text-white/70">(85+ score)</div>
                    {/* Small static chart */}
                    <div className="mt-3 flex items-end gap-1 h-8">
                      {[40, 60, 45, 70, 50, 80, 65, 85].map((h, i) => (
                        <div key={i} className="flex-1 bg-white/30 rounded-t-sm hover:bg-white/50 transition-colors" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>

                  {/* Avg Review Time */}
                  <div className="rounded-xl bg-card/80 p-4 ring-1 ring-white/10">
                    <span className="text-xs text-muted-foreground">Avg Review Time</span>
                    <div className="mt-2 text-2xl font-bold text-foreground">2.3 minutes</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-green-500">
                      <ArrowDownRight className="h-3 w-3" />
                      <span>58% vs manual</span>
                    </div>
                  </div>

                  {/* Success Rate */}
                  <div className="rounded-xl bg-card/80 p-4 ring-1 ring-white/10">
                    <span className="text-xs text-muted-foreground">Success Rate</span>
                    <div className="mt-2 text-2xl font-bold text-foreground">34% funded</div>
                    <div className="mt-1 text-xs text-muted-foreground">of 85+ scored founders</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section (New) */}
      <Logos3 />

      {/* Features Section */}
      <div id="platform">
        <CyberneticBentoGrid />
      </div>

      {/* How It Works Section */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Footer spacer */}
      <Footer />
    </div>
  )
}
