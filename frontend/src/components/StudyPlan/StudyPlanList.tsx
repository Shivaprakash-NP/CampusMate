// StudyPlans.tsx
"use client"

import React, { useState, useEffect } from "react"
import { Plus, Trash2, LayoutTemplate, ArrowLeft, Loader2 } from "lucide-react"
import StudyPlanUpload from "./StudyPlanUpload"
import StudyPlanDetail from "./StudyPlan"

// Shadcn Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Navbar from "../Navbar"

// --- Types ---
type PlanStatus = "active" | "draft" | "completed"

interface StudyPlanSummary {
  id: string
  title: string
  description: string
  targetDate: string
  progress: number
  status: PlanStatus
  fullData?: any 
}

export default function StudyPlans() {
  const [plans, setPlans] = useState<StudyPlanSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newPlanName, setNewPlanName] = useState("")
  
  // Navigation States
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [activePlanTitle, setActivePlanTitle] = useState("")
  
  // 1. Rename the base state so we can wrap it in a custom setter
  const [activePlanIdState, setActivePlanIdState] = useState<string | null>(null)

  // 2. Read the URL on mount and handle the browser Back/Forward buttons
  useEffect(() => {
    const syncStateFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      setActivePlanIdState(params.get("planId"))
    }

    syncStateFromUrl() // Check URL on initial load
    window.addEventListener("popstate", syncStateFromUrl) // Handle back button

    return () => window.removeEventListener("popstate", syncStateFromUrl)
  }, [])

  // 3. Custom setter that updates BOTH React state and the Browser URL
  const setActivePlanId = (id: string | null) => {
    setActivePlanIdState(id)
    const url = new URL(window.location.href)
    if (id) {
      url.searchParams.set("planId", id)
    } else {
      url.searchParams.delete("planId")
    }
    window.history.pushState({}, "", url)
  }

  // Use this variable everywhere in your JSX just like before
  const activePlanId = activePlanIdState

  // --- FETCH DATA FROM BACKEND ---
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        let token = localStorage.getItem("accessToken") || "";
        if (!token) {
          const match = document.cookie.match(/(?:^|; )accessToken=([^;]*)/);
          if (match) token = match[1];
        }

        const response = await fetch("http://localhost:8080/api/schedule/getSchedule", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include"
        });

        if (!response.ok) throw new Error("Failed to fetch schedules");

        const data = await response.json();
        
        // Map backend data to frontend interface
        const mappedPlans: StudyPlanSummary[] = data.map((plan: any) => {
          let totalTopics = 0;
          let completedTopics = 0;
          
          plan.schedulePerDayList?.forEach((day: any) => {
            day.topics?.forEach((t: any) => {
              totalTopics++;
              if (t.completed) completedTopics++;
            });
          });

          const progressPct = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
          const isCompleted = new Date(plan.endDate) < new Date();

          return {
            id: String(plan.id),
            title: plan.title || plan.Title || `Study Track #${plan.id}`,
            description: `${totalTopics} topics scheduled across ${plan.schedulePerDayList?.length || 0} days`,
            targetDate: plan.endDate,
            progress: progressPct,
            status: isCompleted ? "completed" : "active",
            fullData: plan
          };
        });

        mappedPlans.sort((a, b) => Number(b.id) - Number(a.id));
        setPlans(mappedPlans);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // 4. FIX: Removed "!activePlanId" from this check! 
    // We MUST fetch the list even if we are viewing a specific plan, 
    // otherwise the detail view won't have the data it needs to render.
    if (!isConfiguring) {
      fetchSchedules();
    }
  }, [isConfiguring]);

  // --- Handlers ---
  const handleDelete = async (id: string) => {
    try {
      let token = localStorage.getItem("accessToken") || "";
      if (!token) {
        const match = document.cookie.match(/(?:^|; )accessToken=([^;]*)/);
        if (match) token = match[1];
      }

      const response = await fetch(`http://localhost:8080/api/schedule/delete/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Failed to delete the study plan from the server");
      }

      setPlans((prev) => prev.filter((plan) => plan.id !== id))
      if (activePlanId === id) setActivePlanId(null)
      
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("Failed to delete the study plan. Please try again.");
    }
  }

  const handleStartConfiguration = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlanName.trim()) return

    setActivePlanTitle(newPlanName)
    setIsCreateModalOpen(false)
    setIsConfiguring(true) 
  }

  const handleFinalSubmit = (configData: any) => {
    let totalTopics = 0;
    configData.schedulePerDayList?.forEach((day: any) => {
      totalTopics += (day.topics?.length || 0);
    });

    const newPlan: StudyPlanSummary = {
      id: String(configData.id || Date.now()),
      title: configData.title || configData.Title || activePlanTitle, 
      description: `${totalTopics} topics scheduled across ${configData.schedulePerDayList?.length || 0} days`,
      targetDate: configData.endDate || "TBD",
      progress: 0,
      status: "active",
      fullData: configData 
    }

    setPlans([newPlan, ...plans])
    setIsConfiguring(false)
    setNewPlanName("")
    setActivePlanId(newPlan.id) 
  }

  const StatusIndicator = ({ status }: { status: PlanStatus }) => {
    const styles = {
      completed: "text-emerald-400",
      active: "text-cyan-400",
      draft: "text-zinc-500"
    }
    return (
      <span className={`text-[11px] font-semibold uppercase tracking-wider ${styles[status]}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-zinc-800 text-zinc-100 flex flex-col">
      <div className="sticky top-0 z-40 w-full">
        <Navbar />
      </div>
      
      {/* 5. FIX: Wrap detail view loading in an isLoading check */}
      {activePlanId ? (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
          {(() => {
            const selectedPlan = plans.find((p) => String(p.id) === String(activePlanId));
            
            // Show a loading spinner if the ID exists in the URL but the fetch hasn't finished yet
            if (isLoading) {
              return (
                <div className="flex flex-col items-center justify-center flex-1 py-32 px-4">
                  <Loader2 className="h-8 w-8 text-zinc-600 animate-spin mb-4" />
                  <h3 className="text-sm font-medium text-zinc-400">Loading plan details...</h3>
                </div>
              );
            }

            if (!selectedPlan) {
              return (
                <div className="p-16 flex flex-col items-center justify-center">
                  <p className="text-zinc-500 mb-4">Plan details could not be found.</p>
                  <Button variant="outline" onClick={() => setActivePlanId(null)}>Go Back</Button>
                </div>
              );
            }

            return (
              <StudyPlanDetail 
                planSummary={selectedPlan} 
                planData={selectedPlan.fullData}
                onBack={() => setActivePlanId(null)} 
              />
            );
          })()}
        </div>
      ) : isConfiguring ? (
        <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-300 w-full">
          <div className="max-w-5xl mx-auto px-4 pt-8">
             <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsConfiguring(false)}
              className="text-zinc-400 hover:text-zinc-100 mb-4 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plans
            </Button>
          </div>
          <StudyPlanUpload 
            planTitle={activePlanTitle} 
            onComplete={handleFinalSubmit} 
          />
        </div>
      ) : (
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8 md:gap-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">Study Plans</h1>
              <p className="text-sm text-zinc-400 max-w-md">Manage your generated study tracks and roadmaps.</p>
            </div>

            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="h-9 bg-zinc-200 text-zinc-950 hover:bg-white font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="hidden md:grid grid-cols-[1fr_120px_100px_160px_40px] gap-6 px-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              <span>Plan Name</span>
              <span>Target Date</span>
              <span>Status</span>
              <span>Progress</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden shadow-sm backdrop-blur-sm flex flex-col">
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center flex-1 py-16 px-4">
                  <Loader2 className="h-8 w-8 text-zinc-600 animate-spin mb-4" />
                  <h3 className="text-sm font-medium text-zinc-400">Loading your plans...</h3>
                </div>
              ) : plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 animate-in fade-in duration-500">
                  <LayoutTemplate className="h-10 w-10 text-zinc-700 mb-4" />
                  <h3 className="text-sm font-medium text-zinc-200 mb-1">No study plans yet</h3>
                  <p className="text-xs text-zinc-500 max-w-[250px] text-center mb-6">Create your first study roadmap by uploading a syllabus.</p>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Plan
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-zinc-800/50">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setActivePlanId(plan.id)}
                      className="group flex flex-col md:grid md:grid-cols-[1fr_120px_100px_160px_40px] md:items-center gap-4 md:gap-6 py-4 px-4 md:px-5 hover:bg-zinc-800/40 transition-all duration-200 cursor-pointer animate-in fade-in"
                    >
                      <div className="flex min-w-0 flex-col gap-1">
                        <h3 className="text-sm font-medium text-zinc-200 group-hover:text-zinc-50 transition-colors truncate">{plan.title}</h3>
                        <p className="text-[13px] text-zinc-500 truncate">{plan.description}</p>
                      </div>
                      <div className="text-[13px] text-zinc-500">{plan.targetDate}</div>
                      <StatusIndicator status={plan.status} />
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden shadow-inner">
                          <div 
                            style={{ width: `${plan.progress}%` }}
                            className="h-full bg-zinc-200 transition-all duration-500 ease-out" 
                          />
                        </div>
                        <span className="text-[12px] text-zinc-500 tabular-nums">{plan.progress}%</span>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" 
                          onClick={(e) => {
                            e.stopPropagation(); 
                            handleDelete(plan.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* CREATE PLAN NAME MODAL */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-100 rounded-xl">
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
            <DialogDescription className="text-zinc-400">Step 1: Name your study roadmap.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStartConfiguration} className="space-y-6 pt-4">
            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-zinc-300">Plan Name</Label>
              <Input
                id="name"
                placeholder="e.g. Semester Finals"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus-visible:ring-zinc-600 transition-all"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!newPlanName.trim()} className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold w-full transition-colors">
                Continue to Setup
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}