"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"

const SECTORS = [
  "AI/ML",
  "SaaS",
  "FinTech",
  "EdTech",
  "HealthTech",
  "E-commerce",
  "D2C",
  "B2B",
  "Marketplace",
  "Other",
]
const STAGES = ["Idea Stage", "Pre-seed", "Seed", "Series A"]
const LOCATIONS = [
  "Mumbai",
  "Bangalore",
  "Delhi NCR",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Other",
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, completeOnboarding } = useAuthStore()
  const [step, setStep] = useState(1)
  const [startup, setStartup] = useState({
    name: "",
    desc: "",
    sector: "",
    stage: "",
    location: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const canNext1 = startup.name.trim().length > 0
  const canNext2 = startup.sector && startup.stage && startup.location

  const handleComplete = async () => {
    if (!user || !startup.name || !startup.sector || !startup.stage || !startup.location) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const idToken = await currentUser.getIdToken();

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          startupName: startup.name,
          description: startup.desc,
          sector: startup.sector,
          stage: startup.stage,
          location: startup.location,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      // Update local Zustand state
      completeOnboarding(startup)
      toast.success("Profile setup complete! Welcome to Pitch Analyzer.")
      router.push("/dashboard")
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Pitch Analyzer</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-sm text-muted-foreground">
              <span>Step {step} of 3</span>
              <span>{Math.round((step / 3) * 100)}% complete</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="mb-1 text-2xl font-semibold text-foreground">Tell us about your startup</h2>
                <p className="mb-6 text-muted-foreground">
                  {"We'll use this to personalize your experience."}
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="startupName">Startup Name *</Label>
                    <Input
                      id="startupName"
                      placeholder="e.g. TechVenture AI"
                      value={startup.name}
                      onChange={(e) => setStartup((d) => ({ ...d, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">
                      Brief Description{" "}
                      <span className="text-muted-foreground">(optional, max 200 chars)</span>
                    </Label>
                    <Textarea
                      id="desc"
                      placeholder="What does your startup do?"
                      value={startup.desc}
                      onChange={(e) =>
                        setStartup((d) => ({ ...d, desc: e.target.value.slice(0, 200) }))
                      }
                      maxLength={200}
                      rows={3}
                    />
                    <p className="text-right text-xs text-muted-foreground">
                      {startup.desc.length}/200
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canNext1}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="mb-1 text-2xl font-semibold text-foreground">
                  Help us personalize your experience
                </h2>
                <p className="mb-6 text-muted-foreground">
                  Select the options that best describe your startup.
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sector *</Label>
                    <Select
                      value={startup.sector}
                      onValueChange={(v) => setStartup((d) => ({ ...d, sector: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTORS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Stage *</Label>
                    <Select
                      value={startup.stage}
                      onValueChange={(v) => setStartup((d) => ({ ...d, stage: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location *</Label>
                    <Select
                      value={startup.location}
                      onValueChange={(v) => setStartup((d) => ({ ...d, location: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your location" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)} className="bg-transparent">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canNext2}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <Card className="border-border">
              <CardContent className="pt-6">
                <h2 className="mb-1 text-2xl font-semibold text-foreground">Confirm your details</h2>
                <p className="mb-6 text-muted-foreground">
                  Review the information below before getting started.
                </p>
                <div className="space-y-4">
                  <div className="rounded-lg border border-border p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Startup Name</span>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-foreground">{startup.name}</p>
                    {startup.desc && (
                      <p className="mt-1 text-sm text-muted-foreground">{startup.desc}</p>
                    )}
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Details</span>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Sector</p>
                        <p className="text-sm font-medium text-foreground">{startup.sector}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Stage</p>
                        <p className="text-sm font-medium text-foreground">{startup.stage}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm font-medium text-foreground">{startup.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)} className="bg-transparent">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
