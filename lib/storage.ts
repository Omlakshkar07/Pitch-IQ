import type { UserProfile, Deck, DeckAnalysis } from "./types"

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

  savePassword(email: string, password: string): void {
    const passwords = load<Record<string, string>>("passwords") || {}
    passwords[email] = password
    save("passwords", passwords)
  },

  verifyPassword(email: string, password: string): boolean {
    const passwords = load<Record<string, string>>("passwords") || {}
    return passwords[email] === password
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

  exportAllData(): string {
    const data = {
      user: this.loadUser(),
      decks: this.loadDecks(),
      analyses: this.loadAnalyses(),
    }
    return JSON.stringify(data, null, 2)
  },
}
