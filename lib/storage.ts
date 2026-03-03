import type { UserProfile, Deck, DeckAnalysis, InvestmentReadinessData, ValuationData } from "./types"

const PREFIX = "pitchanalyzer_"

function save<T>(key: string, data: T): void {
  try {
    const json = JSON.stringify(data)
    localStorage.setItem(PREFIX + key, json)
  } catch {
    console.error("Failed to save to localStorage")
  }
}

function load<T>(key: string): T | null {
  try {
    const json = localStorage.getItem(PREFIX + key)
    return json ? JSON.parse(json) : null
  } catch {
    console.error("Failed to load from localStorage")
    return null
  }
}

function remove(key: string): void {
  localStorage.removeItem(PREFIX + key)
}

export const StorageService = {
  save,
  load,
  remove,

  clearAll(): void {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key))
  },

  saveUser(user: UserProfile): void {
    save("user", user)
    save("auth", { isAuthenticated: true })
  },

  loadUser(): UserProfile | null {
    return load<UserProfile>("user")
  },

  saveDecks(decks: Deck[]): void {
    save("decks", decks)
  },

  loadDecks(): Deck[] {
    return load<Deck[]>("decks") || []
  },

  saveDeck(deck: Deck): void {
    const decks = this.loadDecks()
    const index = decks.findIndex((d) => d.id === deck.id)
    if (index >= 0) {
      decks[index] = deck
    } else {
      decks.push(deck)
    }
    this.saveDecks(decks)
  },

  deleteDeck(deckId: string): void {
    const decks = this.loadDecks().filter((d) => d.id !== deckId)
    this.saveDecks(decks)
    const analyses = this.loadAnalyses().filter((a) => a.deckId !== deckId)
    save("analyses", analyses)
  },

  saveAnalysis(analysis: DeckAnalysis): void {
    const analyses = this.loadAnalyses()
    const index = analyses.findIndex((a) => a.id === analysis.id)
    if (index >= 0) {
      analyses[index] = analysis
    } else {
      analyses.push(analysis)
    }
    save("analyses", analyses)
  },

  loadAnalyses(): DeckAnalysis[] {
    return load<DeckAnalysis[]>("analyses") || []
  },

  getAnalysisForDeck(deckId: string): DeckAnalysis | null {
    const analyses = this.loadAnalyses()
    return analyses.find((a) => a.deckId === deckId) || null
  },

  saveReadinessData(data: InvestmentReadinessData): void {
    const all = this.loadAllReadiness()
    const index = all.findIndex((r) => r.id === data.id)
    if (index >= 0) {
      all[index] = data
    } else {
      all.push(data)
    }
    save("readiness", all)
  },

  loadAllReadiness(): InvestmentReadinessData[] {
    return load<InvestmentReadinessData[]>("readiness") || []
  },

  getLatestReadiness(): InvestmentReadinessData | null {
    const all = this.loadAllReadiness()
    if (all.length === 0) return null
    return all.sort(
      (a, b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime()
    )[0]
  },

  saveValuationData(data: ValuationData): void {
    const all = this.loadAllValuations()
    const index = all.findIndex((v) => v.id === data.id)
    if (index >= 0) {
      all[index] = data
    } else {
      all.push(data)
    }
    save("valuations", all)
  },

  loadAllValuations(): ValuationData[] {
    return load<ValuationData[]>("valuations") || []
  },

  getLatestValuation(): ValuationData | null {
    const all = this.loadAllValuations()
    if (all.length === 0) return null
    return all.sort(
      (a, b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime()
    )[0]
  },

  exportAllData(): string {
    const data = {
      user: this.loadUser(),
      decks: this.loadDecks(),
      analyses: this.loadAnalyses(),
      readiness: this.loadAllReadiness(),
      valuations: this.loadAllValuations(),
    }
    return JSON.stringify(data, null, 2)
  },
}
