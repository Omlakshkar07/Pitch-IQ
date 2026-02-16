"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserProfile, SignupData, Deck, DeckAnalysis, InvestmentReadinessData, ValuationData } from "./types"
import { StorageService } from "./storage"
import { createDemoUser, SAMPLE_DECKS, SAMPLE_ANALYSES } from "./mock-data"

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  hasCompletedOnboarding: boolean
  login: (email: string, password: string) => void
  signup: (data: SignupData) => void
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

      login: (email: string, password: string) => {
        if (email === "demo@startup.com" && password === "password123") {
          const user = createDemoUser()
          StorageService.saveUser(user)
          StorageService.savePassword(email, password)
          const existingDecks = StorageService.loadDecks()
          if (existingDecks.length === 0) {
            StorageService.saveDecks(SAMPLE_DECKS)
            SAMPLE_ANALYSES.forEach((a) => StorageService.saveAnalysis(a))
          }
          set({ user, isAuthenticated: true, hasCompletedOnboarding: true })
          return
        }

        const storedUser = StorageService.loadUser()
        if (storedUser && storedUser.email === email && StorageService.verifyPassword(email, password)) {
          set({ user: storedUser, isAuthenticated: true })
          return
        }

        throw new Error("Invalid email or password")
      },

      signup: (data: SignupData) => {
        const user: UserProfile = {
          id: `user_${Date.now()}`,
          name: data.name,
          email: data.email,
          startupName: "",
          sector: "",
          stage: "",
          location: "",
          createdAt: new Date().toISOString(),
        }
        StorageService.saveUser(user)
        StorageService.savePassword(data.email, data.password)
        set({ user, isAuthenticated: true, hasCompletedOnboarding: false })
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, hasCompletedOnboarding: false })
      },

      updateProfile: (data: Partial<UserProfile>) => {
        const { user } = get()
        if (user) {
          const updatedUser = { ...user, ...data }
          set({ user: updatedUser })
          StorageService.saveUser(updatedUser)
        }
      },

      completeOnboarding: (data: Partial<UserProfile>) => {
        const { user } = get()
        if (user) {
          const updatedUser = { ...user, ...data }
          set({ user: updatedUser, hasCompletedOnboarding: true })
          StorageService.saveUser(updatedUser)
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
