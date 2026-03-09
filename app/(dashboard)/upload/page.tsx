"use client";

import React from "react";

import { useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CloudUpload,
  FileText,
  X,
  Info,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useAuthStore, useDecksStore } from "@/lib/store";
import type { Deck } from "@/lib/types";
import { analyzePitchDeck } from "@/lib/api";
import { toast } from "sonner";

const VALID_TYPES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
const VALID_EXTENSIONS = [".pdf", ".ppt", ".pptx"];
const MAX_SIZE = 50 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

type UploadState = "idle" | "selected" | "uploading" | "processing" | "done";

export default function UploadPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { addDeck, addAnalysis } = useDecksStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [error, setError] = useState("");

  const [formErrors, setFormErrors] = useState<{ name?: string, email?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean, email?: boolean }>({});

  function validateName(name: string) {
    if (!name.trim()) return "Founder's name is required";
    if (name.length < 2 || name.length > 100) return "Minimum 2 and maximum 100 characters";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Please enter a valid name (letters only)";
    return null;
  }

  function validateEmail(email: string) {
    if (!email.trim()) return "Founder's email is required";
    if (email.length > 254) return "Email too long";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address";
    return null;
  }

  // Optional metadata
  const [meta, setMeta] = useState({
    sector: "",
    stage: "",
    revenue: "",
    teamSize: "",
    foundingYear: "",
    location: "",
    incorporationStatus: "",
    fundraisingStatus: "",
    fundRaised: false,
    founderName: "",
    founderEmail: "",
    founderPhone: "",
    analysisMode: "",
  });

  function validateFile(f: File): string | null {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!VALID_TYPES.includes(f.type) && !VALID_EXTENSIONS.includes(ext)) {
      return "Invalid file type. Please upload a PDF, PPT, or PPTX file.";
    }
    if (f.size > MAX_SIZE) {
      return "File is too large. Maximum size is 50MB.";
    }
    return null;
  }

  function handleFile(f: File) {
    setError("");
    const err = validateFile(f);
    if (err) {
      setError(err);
      return;
    }
    setFile(f);
    setUploadState("selected");
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function removeFile() {
    setFile(null);
    setUploadState("idle");
    setProgress(0);
    setError("");
  }

  async function handleStartAnalysis() {
    if (!file || !user) return;

    const nameErr = validateName(meta.founderName);
    const emailErr = validateEmail(meta.founderEmail);
    if (nameErr || emailErr) {
      setFormErrors({ name: nameErr || undefined, email: emailErr || undefined });
      setTouched({ name: true, email: true });
      if (nameErr) document.getElementById("founderName")?.focus();
      else if (emailErr) document.getElementById("founderEmail")?.focus();
      return;
    }

    try {
      setUploadState("uploading");
      setProgress(0);

      // Simulate upload progress bar while backend processes
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 5, 90));
      }, 1_500);

      setUploadState("processing");

      // Single call: backend creates deck, runs ML analysis, saves to DB atomically
      const result = await analyzePitchDeck({
        file,
        sector: meta.sector,
        stage: meta.stage,
        revenue: meta.revenue || undefined,
        team_size: meta.teamSize || undefined,
        founded_year: meta.foundingYear || undefined,
        location: meta.location || undefined,
        incorporation_status: meta.incorporationStatus || undefined,
        fundraising_status: meta.fundraisingStatus || undefined,
        fund_raised: meta.fundRaised,
        founder_name: meta.founderName || undefined,
        founder_email: meta.founderEmail || undefined,
        founder_phone: meta.founderPhone || undefined,
        analysis_mode: meta.analysisMode || undefined,
      });

      clearInterval(progressInterval);
      setProgress(100);

      // Sync to local store for immediate UI responsiveness  
      const deck: Deck = {
        id: result.deckId,
        userId: user.id,
        filename: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        status: "completed",
        sector: meta.sector || undefined,
        stage: meta.stage || undefined,
      };
      addDeck(deck);
      addAnalysis(result.analysis);

      setUploadState("done");
      toast.success("Analysis complete!");

      setTimeout(() => {
        router.push(`/analysis/${result.analysis.id}`);
      }, 1000);
    } catch (error) {
      console.error("Analysis failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Analysis failed. Please try again.",
      );
      setUploadState("selected");
      toast.error("Analysis failed. Please try again.");
    }
  }

  return (
    <div>
      <div className="mb-2">
        <nav className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground">Upload</span>
        </nav>
        <h1 className="text-2xl font-bold text-foreground">
          Upload Pitch Deck
        </h1>
        <p className="text-muted-foreground">
          Supported: PDF, PPT, PPTX (max 50MB)
        </p>
      </div>

      {/* Info banner */}
      {showInfo && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p className="flex-1 text-sm text-muted-foreground">
            Your deck is encrypted and stored only in your browser. Analysis
            takes 2-3 minutes.
          </p>
          <button
            type="button"
            onClick={() => setShowInfo(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </button>
        </div>
      )}

      {/* Upload area */}
      <Card className="mb-6 border-white/10 bg-black/20 backdrop-blur-md rounded-2xl shadow-xl">
        <CardContent className="pt-6">
          {uploadState === "idle" && (
            <div
              role="button"
              tabIndex={0}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) =>
                e.key === "Enter" && fileInputRef.current?.click()
              }
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/30"
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.ppt,.pptx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <CloudUpload
                className={`mb-4 h-16 w-16 ${dragOver ? "text-primary" : "text-muted-foreground"}`}
              />
              <p className="mb-2 text-lg text-foreground">
                {dragOver
                  ? "Drop file to upload"
                  : "Drag and drop your pitch deck here"}
              </p>
              <p className="mb-4 text-sm text-muted-foreground">or</p>
              <Button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse Files
              </Button>
            </div>
          )}

          {uploadState === "selected" && file && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border border-border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatBytes(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Remove file</span>
                </button>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-sm text-primary hover:underline"
              >
                Change File
              </button>
            </div>
          )}

          {uploadState === "uploading" && (
            <div className="space-y-4 py-8 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
              <p className="font-medium text-foreground">Uploading...</p>
              <div className="mx-auto max-w-xs">
                <Progress value={progress} className="h-2" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {progress}%
                </p>
              </div>
            </div>
          )}

          {uploadState === "processing" && (
            <div className="space-y-4 py-8 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-primary" />
              <p className="font-medium text-foreground">Upload successful!</p>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Analyzing your deck... (may take up to 90s on first run)
                </p>
              </div>
            </div>
          )}

          {uploadState === "done" && (
            <div className="space-y-4 py-8 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-primary" />
              <p className="font-medium text-foreground">Analysis Complete!</p>
              <p className="text-sm text-muted-foreground">
                Redirecting to results...
              </p>
            </div>
          )}

          {error && (
            <p className="mt-4 text-center text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Metadata form */}
      {(uploadState === "idle" || uploadState === "selected") && (
        <Card className="mb-6 border-white/10 bg-black/20 backdrop-blur-md rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-base text-foreground">
              Startup Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sector">
                  Industry Sector <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sector"
                  placeholder="e.g., AI/ML, SaaS"
                  value={meta.sector}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, sector: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">
                  Funding Stage <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stage"
                  placeholder="e.g., Seed, Series A"
                  value={meta.stage}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, stage: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenue">Annual Revenue (INR)</Label>
                <Input
                  id="revenue"
                  type="number"
                  placeholder="Optional"
                  value={meta.revenue}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, revenue: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamSize">Current Team Size</Label>
                <Input
                  id="teamSize"
                  type="number"
                  placeholder="Optional"
                  value={meta.teamSize}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, teamSize: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="foundingYear">Year Founded</Label>
                <Input
                  id="foundingYear"
                  type="number"
                  placeholder="Optional"
                  value={meta.foundingYear}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, foundingYear: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">HQ Location</Label>
                <Input
                  id="location"
                  placeholder="Optional"
                  value={meta.location}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, location: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="incorporationStatus">
                  Incorporation Status
                </Label>
                <Input
                  id="incorporationStatus"
                  placeholder="Optional"
                  value={meta.incorporationStatus}
                  onChange={(e) =>
                    setMeta((m) => ({
                      ...m,
                      incorporationStatus: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fundraisingStatus">Fundraising Status</Label>
                <Input
                  id="fundraisingStatus"
                  placeholder="Optional"
                  value={meta.fundraisingStatus}
                  onChange={(e) =>
                    setMeta((m) => ({
                      ...m,
                      fundraisingStatus: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between space-y-0 rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="fundRaised">Fund Raised</Label>
                  <p className="text-sm text-muted-foreground">
                    Have you raised any funding before?
                  </p>
                </div>
                <Switch
                  id="fundRaised"
                  checked={meta.fundRaised}
                  onCheckedChange={(checked) =>
                    setMeta((m) => ({ ...m, fundRaised: checked }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="founderName" className={touched.name && formErrors.name ? "text-destructive" : ""}>
                  Founder's Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="founderName"
                  placeholder="Your full name"
                  value={meta.founderName}
                  className={touched.name && formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, name: true }));
                    setFormErrors((e) => ({ ...e, name: validateName(meta.founderName) || undefined }));
                  }}
                  onChange={(e) => {
                    setMeta((m) => ({ ...m, founderName: e.target.value }));
                    if (touched.name) {
                      setFormErrors((err) => ({ ...err, name: validateName(e.target.value) || undefined }));
                    }
                  }}
                />
                {touched.name && formErrors.name && (
                  <p className="text-sm font-medium text-destructive">{formErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="founderEmail" className={touched.email && formErrors.email ? "text-destructive" : ""}>
                  Founder's Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="founderEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={meta.founderEmail}
                  className={touched.email && formErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, email: true }));
                    setFormErrors((e) => ({ ...e, email: validateEmail(meta.founderEmail) || undefined }));
                  }}
                  onChange={(e) => {
                    setMeta((m) => ({ ...m, founderEmail: e.target.value }));
                    if (touched.email) {
                      setFormErrors((err) => ({ ...err, email: validateEmail(e.target.value) || undefined }));
                    }
                  }}
                />
                {touched.email && formErrors.email && (
                  <p className="text-sm font-medium text-destructive">{formErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="founderPhone">Founder Phone</Label>
                <Input
                  id="founderPhone"
                  type="tel"
                  placeholder="Optional"
                  value={meta.founderPhone}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, founderPhone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="analysisMode">Analysis Mode</Label>
                <Input
                  id="analysisMode"
                  placeholder="Optional"
                  value={meta.analysisMode}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, analysisMode: e.target.value }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom actions */}
      {(uploadState === "idle" || uploadState === "selected") && (
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Link>
          <Button
            onClick={handleStartAnalysis}
            disabled={
              uploadState !== "selected" ||
              !meta.sector ||
              !meta.stage ||
              !meta.founderName ||
              !meta.founderEmail ||
              !!(touched.name && validateName(meta.founderName)) ||
              !!(touched.email && validateEmail(meta.founderEmail))
            }
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Start Analysis
          </Button>
        </div>
      )}
    </div>
  );
}
