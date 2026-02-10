"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, BarChart3, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setError("")
    setLoading(true)
    try {
      login(email, password)
      toast.success("Welcome back!")
      router.push("/dashboard")
    } catch {
      setError("Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function fillDemo() {
    setEmail("demo@startup.com")
    setPassword("password123")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">Pitch Analyzer</span>
          </Link>
        </div>
        <Card className="border-border shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
            <CardDescription>Sign in to continue analyzing your decks</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Demo credentials box */}
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Demo Account Available</p>
                <p className="text-muted-foreground">
                  demo@startup.com / password123
                </p>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="mt-1 text-xs font-medium text-primary hover:underline"
                >
                  Click to fill credentials
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@startup.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <span className="cursor-not-allowed text-xs text-muted-foreground">Forgot password?</span>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!email || !password || loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign Up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
