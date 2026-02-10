"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import {
  FileText,
  Upload,
  Search,
  Eye,
  Trash2,
  GitCompare,
  Download,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDecksStore } from "@/lib/store"
import { toast } from "sonner"

type SortField = "date" | "score" | "name"

function statusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-primary/10 text-primary border-0">Completed</Badge>
    case "analyzing":
      return <Badge className="bg-[hsl(var(--flag-amber))]/10 text-[hsl(var(--flag-amber))] border-0">Analyzing</Badge>
    case "failed":
      return <Badge className="bg-destructive/10 text-destructive border-0">Failed</Badge>
    default:
      return <Badge variant="secondary">Pending</Badge>
  }
}

function scoreBadgeColor(score: number): string {
  if (score >= 75) return "bg-primary/10 text-primary"
  if (score >= 50) return "bg-[hsl(var(--flag-amber))]/10 text-[hsl(var(--flag-amber))]"
  return "bg-destructive/10 text-destructive"
}

export default function AnalysesPage() {
  const router = useRouter()
  const { decks, analyses, deleteDeck } = useDecksStore()
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortField>("date")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const deckList = useMemo(() => {
    let items = decks.map((deck) => {
      const analysis = analyses.find((a) => a.deckId === deck.id)
      return { deck, analysis }
    })

    if (search) {
      items = items.filter((d) =>
        d.deck.filename.toLowerCase().includes(search.toLowerCase())
      )
    }

    items.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.deck.uploadDate).getTime() - new Date(a.deck.uploadDate).getTime()
      }
      if (sortBy === "score") {
        return (b.analysis?.overallScore || 0) - (a.analysis?.overallScore || 0)
      }
      return a.deck.filename.localeCompare(b.deck.filename)
    })

    return items
  }, [decks, analyses, search, sortBy])

  function toggleSelect(deckId: string) {
    const next = new Set(selected)
    if (next.has(deckId)) {
      next.delete(deckId)
    } else {
      if (next.size >= 2) {
        const first = [...next][0]
        next.delete(first)
      }
      next.add(deckId)
    }
    setSelected(next)
  }

  function handleDelete() {
    if (deleteId) {
      deleteDeck(deleteId)
      setSelected((s) => {
        const n = new Set(s)
        n.delete(deleteId)
        return n
      })
      setDeleteId(null)
      toast.success("Deck deleted successfully")
    }
  }

  function handleCompare() {
    const ids = [...selected]
    if (ids.length === 2) {
      router.push(`/compare?deck1=${ids[0]}&deck2=${ids[1]}`)
    }
  }

  if (decks.length === 0) {
    return (
      <div>
        <h1 className="mb-1 text-2xl font-bold text-foreground">My Pitch Deck Analyses</h1>
        <p className="mb-8 text-muted-foreground">View and manage your analyzed decks.</p>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-4 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">No pitch decks analyzed yet</h2>
          <p className="mb-6 max-w-sm text-muted-foreground">
            Upload your first deck to get started with AI-powered insights.
          </p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Your First Deck
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <nav className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-foreground">Analyses</span>
      </nav>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Pitch Deck Analyses</h1>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload New Deck
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-transparent">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy("date")}>Date</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("score")}>Score</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("name")}>Name</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Deck list */}
      <div className="space-y-3">
        {deckList.map(({ deck, analysis }) => (
          <Card
            key={deck.id}
            className={`cursor-pointer border-border transition-colors hover:bg-accent/50 ${
              selected.has(deck.id) ? "ring-2 ring-primary" : ""
            }`}
          >
            <CardContent className="flex items-center gap-4 py-4">
              {/* Checkbox */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSelect(deck.id)
                }}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                  selected.has(deck.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-muted-foreground"
                }`}
                aria-label={`Select ${deck.filename} for comparison`}
              >
                {selected.has(deck.id) && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* File icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>

              {/* Info */}
              <div
                className="flex-1 cursor-pointer min-w-0"
                onClick={() => analysis && router.push(`/analysis/${analysis.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && analysis && router.push(`/analysis/${analysis.id}`)}
              >
                <p className="truncate font-medium text-foreground">{deck.filename}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(deck.uploadDate), { addSuffix: true })}
                </p>
              </div>

              {/* Score */}
              {analysis && (
                <Badge className={`${scoreBadgeColor(analysis.overallScore)} border-0 text-sm font-bold`}>
                  {analysis.overallScore}/100
                </Badge>
              )}

              {/* Status */}
              {statusBadge(deck.status)}

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {analysis && (
                    <DropdownMenuItem onClick={() => router.push(`/analysis/${analysis.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Analysis
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => toggleSelect(deck.id)}>
                    <GitCompare className="mr-2 h-4 w-4" />
                    Compare
                  </DropdownMenuItem>
                  {analysis && (
                    <DropdownMenuItem
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(analysis, null, 2)], {
                          type: "application/json",
                        })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = `${deck.filename}_analysis.json`
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteId(deck.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compare floating button */}
      {selected.size === 2 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <Button
            onClick={handleCompare}
            className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
            size="lg"
          >
            <GitCompare className="mr-2 h-4 w-4" />
            Compare Selected (2)
          </Button>
        </div>
      )}

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pitch Deck</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this deck and its analysis? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
