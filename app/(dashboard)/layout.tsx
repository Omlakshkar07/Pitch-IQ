"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuthStore, useDecksStore, useReadinessStore, useValuationStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuthStore()
  const loadDecks = useDecksStore((s) => s.loadFromStorage)
  const loadReadiness = useReadinessStore((s) => s.loadFromStorage)
  const loadValuations = useValuationStore((s) => s.loadFromStorage)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [firebaseReady, setFirebaseReady] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadDecks()
    loadReadiness()
    loadValuations()
  }, [loadDecks, loadReadiness, loadValuations])

  // Verify real Firebase auth state before granting access
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // No real Firebase session — clear stale state and redirect
        logout()
        router.push("/login")
      } else {
        setFirebaseReady(true)
      }
    })
    return () => unsubscribe()
  }, [logout, router])

  useEffect(() => {
    if (mounted && !isAuthenticated && firebaseReady) {
      router.push("/login")
    }
  }, [mounted, isAuthenticated, firebaseReady, router])

  if (!mounted || !isAuthenticated || !firebaseReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/20"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Close sidebar"
          />
          <div className="relative z-10 h-full w-64">
            <AppSidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile topbar */}
        <div className="flex items-center border-b border-border bg-card px-4 py-3 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <span className="ml-3 font-semibold text-foreground">Pitch Analyzer</span>
        </div>
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
