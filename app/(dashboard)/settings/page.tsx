"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, SlidersHorizontal, Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useAuthStore } from "@/lib/store"
import { StorageService } from "@/lib/storage"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const SECTORS = ["AI/ML", "SaaS", "FinTech", "EdTech", "HealthTech", "E-commerce", "D2C", "B2B", "Marketplace", "Other"]
const STAGES = ["Idea Stage", "Pre-seed", "Seed", "Series A"]
const LOCATIONS = ["Mumbai", "Bangalore", "Delhi NCR", "Pune", "Hyderabad", "Chennai", "Kolkata", "Other"]

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: Settings },
] as const

type TabId = (typeof tabs)[number]["id"]

export default function SettingsPage() {
  const router = useRouter()
  const { user, updateProfile, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabId>("profile")
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteText, setDeleteText] = useState("")
  const [clearConfirm, setClearConfirm] = useState(false)

  // Profile form state
  const [profile, setProfile] = useState({
    name: user?.name || "",
    startupName: user?.startupName || "",
    sector: user?.sector || "",
    stage: user?.stage || "",
    location: user?.location || "",
    teamSize: user?.teamSize?.toString() || "",
    website: user?.website || "",
  })

  // Preferences
  const [prefs, setPrefs] = useState({
    tooltips: true,
    percentiles: true,
    animateCharts: true,
  })

  // Notifications
  const [notifs, setNotifs] = useState({
    analysisComplete: true,
    weeklySummary: false,
    tips: true,
    scoreImprovements: true,
    newFeatures: true,
  })

  function saveProfile() {
    updateProfile({
      name: profile.name,
      startupName: profile.startupName,
      sector: profile.sector,
      stage: profile.stage,
      location: profile.location,
      teamSize: profile.teamSize ? Number(profile.teamSize) : undefined,
      website: profile.website,
    })
    toast.success("Profile updated successfully")
  }

  function handleExportData() {
    const data = StorageService.exportAllData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "pitchanalyzer_export.json"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Data export started")
  }

  function handleClearData() {
    StorageService.clearAll()
    setClearConfirm(false)
    toast.success("All data cleared")
  }

  function handleDeleteAccount() {
    StorageService.clearAll()
    logout()
    setDeleteConfirm(false)
    router.push("/")
  }

  return (
    <div>
      <nav className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-foreground">Settings</span>
      </nav>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Settings</h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Tab navigation */}
        <div className="flex flex-row gap-1 lg:w-48 lg:flex-col">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Profile</CardTitle>
                <CardDescription>Manage your personal and startup information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ""} disabled />
                    <p className="text-xs text-muted-foreground">Cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Startup Name</Label>
                    <Input
                      value={profile.startupName}
                      onChange={(e) => setProfile((p) => ({ ...p, startupName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sector</Label>
                    <Select value={profile.sector} onValueChange={(v) => setProfile((p) => ({ ...p, sector: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                      <SelectContent>
                        {SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Stage</Label>
                    <Select value={profile.stage} onValueChange={(v) => setProfile((p) => ({ ...p, stage: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                      <SelectContent>
                        {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select value={profile.location} onValueChange={(v) => setProfile((p) => ({ ...p, location: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Team Size</Label>
                    <Input
                      type="number"
                      value={profile.teamSize}
                      onChange={(e) => setProfile((p) => ({ ...p, teamSize: e.target.value }))}
                      placeholder="e.g. 5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website (optional)</Label>
                    <Input
                      type="url"
                      value={profile.website}
                      onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveProfile} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Preferences</CardTitle>
                <CardDescription>Customize your dashboard experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-4 text-sm font-medium text-foreground">Display Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Theme</p>
                        <p className="text-xs text-muted-foreground">Light mode is currently the default</p>
                      </div>
                      <Select defaultValue="light" disabled>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-sm font-medium text-foreground">Data Display</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Show Detailed Tooltips</p>
                        <p className="text-xs text-muted-foreground">Display helpful tooltips on hover</p>
                      </div>
                      <Switch checked={prefs.tooltips} onCheckedChange={(v) => setPrefs((p) => ({ ...p, tooltips: v }))} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Show Percentile Rankings</p>
                        <p className="text-xs text-muted-foreground">Compare your scores with other startups</p>
                      </div>
                      <Switch checked={prefs.percentiles} onCheckedChange={(v) => setPrefs((p) => ({ ...p, percentiles: v }))} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Animate Charts</p>
                        <p className="text-xs text-muted-foreground">Enable chart animations and transitions</p>
                      </div>
                      <Switch checked={prefs.animateCharts} onCheckedChange={(v) => setPrefs((p) => ({ ...p, animateCharts: v }))} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => toast.success("Preferences saved")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Notifications</CardTitle>
                <CardDescription>Manage your notification preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-4 text-sm font-medium text-foreground">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Analysis Complete</p>
                        <p className="text-xs text-muted-foreground">Get notified when your analysis is ready</p>
                      </div>
                      <Switch checked={notifs.analysisComplete} onCheckedChange={(v) => setNotifs((n) => ({ ...n, analysisComplete: v }))} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Weekly Progress Summary</p>
                        <p className="text-xs text-muted-foreground">Weekly recap of your progress</p>
                      </div>
                      <Switch checked={notifs.weeklySummary} onCheckedChange={(v) => setNotifs((n) => ({ ...n, weeklySummary: v }))} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Tips & Recommendations</p>
                        <p className="text-xs text-muted-foreground">Helpful tips to improve your deck</p>
                      </div>
                      <Switch checked={notifs.tips} onCheckedChange={(v) => setNotifs((n) => ({ ...n, tips: v }))} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-sm font-medium text-foreground">In-App Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Show Score Improvements</p>
                        <p className="text-xs text-muted-foreground">Highlight when your scores improve</p>
                      </div>
                      <Switch checked={notifs.scoreImprovements} onCheckedChange={(v) => setNotifs((n) => ({ ...n, scoreImprovements: v }))} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Show New Features</p>
                        <p className="text-xs text-muted-foreground">Get notified about new platform features</p>
                      </div>
                      <Switch checked={notifs.newFeatures} onCheckedChange={(v) => setNotifs((n) => ({ ...n, newFeatures: v }))} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => toast.success("Notification settings saved")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Password</CardTitle>
                  <CardDescription>Change your account password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="Enter current password" />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="Enter new password" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => toast.success("Password changed")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Data Management</CardTitle>
                  <CardDescription>Export or clear your data.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={handleExportData} className="bg-transparent">
                    Export Data
                  </Button>
                  <Button
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                    onClick={() => setClearConfirm(true)}
                  >
                    Clear All Data
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Permanently delete your account and all data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    This action cannot be undone. All your decks, analyses, and settings will be permanently removed.
                  </p>
                  <Button
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                    onClick={() => setDeleteConfirm(true)}
                  >
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Clear data dialog */}
      <AlertDialog open={clearConfirm} onOpenChange={setClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all your decks, analyses, and preferences. Your account will remain but all data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete account dialog */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Type <span className="font-bold">DELETE</span> to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            placeholder='Type "DELETE" to confirm'
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteText("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteText !== "DELETE"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
