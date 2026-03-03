"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserProfile, Deck, DeckAnalysis, InvestmentReadinessData, ValuationData } from "./types"
import { StorageService } from "./storage"
import { signOut } from "firebase/auth"
import { auth } from "./firebase"

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  hasCompletedOnboarding: boolean
  /**
   * Set the authenticated user after Firebase login.
   * This replaces the old insecure login(email, password) pattern.
   */
  login: (user: { id: string; email: string; name: string }) => void
  logout: () => void
  updateProfile: (data: Partial<UserProfile>) => void
  completeOnboarding: (data: Partial<UserProfile>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,

      login: (userData: { id: string; email: string; name: string }) => {
        const user: UserProfile = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          startupName: "",
          sector: "",
          stage: "",
          location: "",
          createdAt: new Date().toISOString(),
        }
        set({ user, isAuthenticated: true })
      },

      logout: () => {
        // Sign out from Firebase
        signOut(auth).catch(console.error)
        // Clear session cookie
        if (typeof document !== 'undefined') {
          document.cookie = '__session=; path=/; max-age=0; SameSite=Lax'
        }
        set({ user: null, isAuthenticated: false, hasCompletedOnboarding: false })
      },

      updateProfile: (data: Partial<UserProfile>) => {
        const { user } = get()
        if (user) {
          const updatedUser = { ...user, ...data }
          set({ user: updatedUser })
        }
      },

      completeOnboarding: (data: Partial<UserProfile>) => {
        const { user } = get()
        if (user) {
          const updatedUser = { ...user, ...data }
          set({ user: updatedUser, hasCompletedOnboarding: true })
        }
      },
    }),
    {
      name: "pitchanalyzer-auth",
    }
  )
)

interface DecksState {
  decks: Deck[]
  analyses: DeckAnalysis[]
  loadFromStorage: () => void
  addDeck: (deck: Deck) => void
  updateDeck: (id: string, data: Partial<Deck>) => void
  deleteDeck: (id: string) => void
  addAnalysis: (analysis: DeckAnalysis) => void
  getAnalysisForDeck: (deckId: string) => DeckAnalysis | undefined
}

export const useDecksStore = create<DecksState>()((set, get) => ({
  decks: [],
  analyses: [],

  loadFromStorage: () => {
    set({
      decks: StorageService.loadDecks(),
      analyses: StorageService.loadAnalyses(),
    })
  },

  addDeck: (deck: Deck) => {
    StorageService.saveDeck(deck)
    set({ decks: StorageService.loadDecks() })
  },

  updateDeck: (id: string, data: Partial<Deck>) => {
    const decks = StorageService.loadDecks()
    const idx = decks.findIndex((d) => d.id === id)
    if (idx >= 0) {
      decks[idx] = { ...decks[idx], ...data }
      StorageService.saveDecks(decks)
      set({ decks })
    }
  },

  deleteDeck: (id: string) => {
    StorageService.deleteDeck(id)
    set({
      decks: StorageService.loadDecks(),
      analyses: StorageService.loadAnalyses(),
    })
  },

  addAnalysis: (analysis: DeckAnalysis) => {
    StorageService.saveAnalysis(analysis)
    set({ analyses: StorageService.loadAnalyses() })
  },

  getAnalysisForDeck: (deckId: string) => {
    return get().analyses.find((a) => a.deckId === deckId)
  },
}))

/* ─────────────── Investment Readiness Store ─────────────── */

interface ReadinessState {
  readinessResults: InvestmentReadinessData[]
  loadFromStorage: () => void
  addReadiness: (data: InvestmentReadinessData) => void
  getLatestReadiness: () => InvestmentReadinessData | undefined
}

export const useReadinessStore = create<ReadinessState>()((set, get) => ({
  readinessResults: [],

  loadFromStorage: () => {
    set({ readinessResults: StorageService.loadAllReadiness() })
  },

  addReadiness: (data: InvestmentReadinessData) => {
    StorageService.saveReadinessData(data)
    set({ readinessResults: StorageService.loadAllReadiness() })
  },

  getLatestReadiness: () => {
    const results = get().readinessResults
    if (results.length === 0) return undefined
    return [...results].sort(
      (a, b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime()
    )[0]
  },
}))

/* ─────────────── Valuation Store ─────────────── */

interface ValuationState {
  valuationResults: ValuationData[]
  loadFromStorage: () => void
  addValuation: (data: ValuationData) => void
  getLatestValuation: () => ValuationData | undefined
}

export const useValuationStore = create<ValuationState>()((set, get) => ({
  valuationResults: [],

  loadFromStorage: () => {
    set({ valuationResults: StorageService.loadAllValuations() })
  },

  addValuation: (data: ValuationData) => {
    StorageService.saveValuationData(data)
    set({ valuationResults: StorageService.loadAllValuations() })
  },

  getLatestValuation: () => {
    const results = get().valuationResults
    if (results.length === 0) return undefined
    return [...results].sort(
      (a, b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime()
    )[0]
  },
}))
