"use client"

import React, { useState } from "react"
import { Plus, MoreVertical, Trash2, Pencil } from "lucide-react"
import Navbar from "../Navbar" // Ensure this path is correct

// Shadcn Components
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress1"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// --- Types & Mock Data ---
type PlanStatus = "active" | "draft" | "completed"

interface StudyPlanSummary {
  id: string
  title: string
  description: string
  targetDate: string
  progress: number
  status: PlanStatus
}

const INITIAL_PLANS: StudyPlanSummary[] = [
  {
    id: "plan-1",
    title: "Semester Final Prep",
    description: "Core subjects: OS, DBMS, Web Development",
    targetDate: "Apr 20, 2026",
    progress: 65,
    status: "active",
  },
  {
    id: "plan-2",
    title: "AWS Cloud Practitioner",
    description: "Certification study track and practice exams",
    targetDate: "Jun 15, 2026",
    progress: 12,
    status: "active",
  },
  {
    id: "plan-3",
    title: "Midterm Revision",
    description: "Data Structures & Algorithms intense review",
    targetDate: "Oct 30, 2025",
    progress: 100,
    status: "completed",
  },
]

export default function StudyPlans() {
  const [plans, setPlans] = useState<StudyPlanSummary[]>(INITIAL_PLANS)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newPlanName, setNewPlanName] = useState("")

  // --- Handlers ---
  const handleDelete = (id: string) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== id))
  }

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlanName.trim()) return

    const newPlan: StudyPlanSummary = {
      id: `plan-${Date.now()}`,
      title: newPlanName,
      description: "Custom study roadmap",
      targetDate: "TBD",
      progress: 0,
      status: "draft",
    }

    setPlans([newPlan, ...plans])
    setNewPlanName("")
    setIsCreateModalOpen(false)
  }

  // Ultra-minimal status dot
  const StatusIndicator = ({ status }: { status: PlanStatus }) => {
    if (status === 'completed') {
      return (
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]"></span>
          <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">{status}</span>
        </div>
      )
    }
    if (status === 'active') {
      return (
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38bdf8] opacity-60"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#38bdf8]"></span>
          </span>
          <span className="text-[11px] font-medium text-[#38bdf8] uppercase tracking-wider">{status}</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-white/20"></span>
        <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">{status}</span>
      </div>
    )
  }

  return (
    // 1. EXACT PAGE WRAPPER FROM DASHBOARD
    <div className="min-h-screen bg-[#0b1a22] p-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        
        {/* 2. EXACT NAVBAR CONTAINER */}
        <div className="rounded-xl border border-white/10 bg-[#0b1220]">
          <Navbar />
        </div>

        {/* 3. MAIN CONTENT CONTAINER */}
        <div className="rounded-xl border border-white/10 bg-[#0b1220] p-6 md:p-8 min-h-[80vh]">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-white">Study Plans</h1>
              <p className="text-sm text-white/50">Manage your generated study tracks and roadmaps.</p>
            </div>
            
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-[#0b1220] font-semibold h-9 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          </div>

          {/* Minimalist Flat List (No table headers, no side margins) */}
          <div className="flex flex-col divide-y divide-white/10 border-t border-white/10">
            {plans.length === 0 ? (
              <div className="py-12 text-center text-white/40 text-sm">
                No study plans found. Create your first roadmap to begin.
              </div>
            ) : (
              plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 transition-colors hover:bg-white/[0.02]"
                >
                  
                  {/* Title & Description */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <h3 className="text-sm font-medium text-white group-hover:text-[#38bdf8] transition-colors cursor-pointer truncate">
                      {plan.title}
                    </h3>
                    <p className="text-xs text-white/40 truncate pr-4">
                      {plan.description}
                    </p>
                  </div>

                  {/* Target Date */}
                  <div className="hidden md:block w-32 text-xs text-white/40 shrink-0">
                    {plan.targetDate}
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="w-24 shrink-0">
                    <StatusIndicator status={plan.status} />
                  </div>

                  {/* Progress Bar & Menu */}
                  <div className="flex items-center gap-6 shrink-0 mt-2 md:mt-0">
                    
                    <div className="flex items-center gap-3 w-32">
                      <Progress 
                        value={plan.progress} 
                        className="h-1 bg-white/10" 
                        indicatorColor={plan.status === 'completed' ? 'bg-[#34d399]' : 'bg-[#38bdf8]'} 
                      />
                      <span className="text-[10px] font-medium text-white/50 w-6 text-right">
                        {plan.progress}%
                      </span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/5">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-[#0b1220] border-white/10 text-white/80 shadow-2xl">
                        <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white">
                          <Pencil className="mr-2 h-4 w-4 text-white/50" />
                          <span>Edit settings</span>
                        </DropdownMenuItem>
                        <div className="h-px bg-white/10 my-1" />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(plan.id)}
                          className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-400 focus:bg-red-500/10 focus:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete plan</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* CREATE NEW PLAN DIALOG (Styled for dark theme) */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-[#0b1220] border-white/10 text-white shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">New Study Plan</DialogTitle>
            <DialogDescription className="text-xs text-white/50 mt-1.5">
              Name your roadmap to begin generating your schedule.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateNew} className="space-y-6 pt-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium text-white/50">
                Plan Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. System Design Interview..."
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                className="h-9 bg-transparent border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-[#38bdf8]/50 focus-visible:border-[#38bdf8]/50 transition-all rounded-md"
                autoFocus
              />
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsCreateModalOpen(false)}
                className="h-9 text-white/50 hover:text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!newPlanName.trim()}
                className="h-9 bg-white hover:bg-white/90 text-[#0b1220] font-semibold"
              >
                Create Plan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}