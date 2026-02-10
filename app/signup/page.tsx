"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store"
import { toast } from "sonner"

function getPasswordStrength(pw: string): { label: string; score: number; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { label: "Weak", score: 33, color: "bg-destructive" }
  if (score <= 2) return { label: "Medium", score: 66, color: "bg-[hsl(var(--flag-amber))]" }
  return { label: "Strong", score: 100, color: "bg-primary" }
}

export default function SignUpPage() {
  const router = useRouter()
  const signup = useAuthStore((s) => s.signup)
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const strength = getPasswordStrength(form.password)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Name is required"
    if (!form.email.trim()) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format"
    if (!form.password) e.password = "Password is required"
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters"
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      signup({ name: form.name, email: form.email, password: form.password })
      toast.success("Account created successfully!")
      router.push("/onboarding")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const isValid =
    form.name.trim() &&
    form.email.trim() &&
    form.password.length >= 8 &&
    form.password === form.confirmPassword

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
            <CardTitle className="text-2xl text-foreground">Create an Account</CardTitle>
            <CardDescription>Start analyzing your pitch deck today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@startup.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
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
                {form.password && (
                  <div className="space-y-1">
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className={`h-1.5 rounded-full transition-all ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password strength: <span className="font-medium">{strength.label}</span>
                    </p>
                  </div>
                )}
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!isValid || loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
