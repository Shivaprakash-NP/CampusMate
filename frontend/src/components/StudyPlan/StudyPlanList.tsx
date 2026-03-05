"use client"

import React, { useState } from "react"
import { Plus, Trash2, LayoutTemplate, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import Navbar from "../Navbar" 
import StudyPlanUpload from "./StudyPlanUpload"
import StudyPlanDetail from "./StudyPlan" // Import the detailed view

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

// --- Types ---
type PlanStatus = "active" | "draft" | "completed"

interface StudyPlanSummary {
  id: string
  title: string
  description: string
  targetDate: string
  progress: number
  status: PlanStatus
  fullData?: any // Stores backend response for the calendar
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
]

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
}

export default function StudyPlans() {
  const [plans, setPlans] = useState<StudyPlanSummary[]>(INITIAL_PLANS)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newPlanName, setNewPlanName] = useState("")
  
  // Navigation States
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [activePlanTitle, setActivePlanTitle] = useState("")
  const [activePlanId, setActivePlanId] = useState<string | null>(null) // Tracks detailed view

  // --- Handlers ---
  const handleDelete = (id: string) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== id))
    if (activePlanId === id) setActivePlanId(null)
  }

  const handleStartConfiguration = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlanName.trim()) return

    setActivePlanTitle(newPlanName)
    setIsCreateModalOpen(false)
    setIsConfiguring(true) 
  }

  const handleFinalSubmit = (configData: any) => {
    // Save the backend configuration to fullData
    const newPlan: StudyPlanSummary = {
      id: `plan-${Date.now()}`,
      title: activePlanTitle,
      description: `Plan generated successfully`,
      targetDate: configData.examStartDate || "TBD",
      progress: 0,
      status: "active",
      fullData: configData 
    }

    setPlans([newPlan, ...plans])
    setIsConfiguring(false)
    setNewPlanName("")
    setActivePlanId(newPlan.id) // Automatically open the new plan
  }

  const StatusIndicator = ({ status }: { status: PlanStatus }) => {
    const styles = {
      completed: "text-emerald-400",
      active: "text-[#818cf8]",
      draft: "text-zinc-500"
    }
    return (
      <span className={`text-[11px] font-semibold uppercase tracking-wider ${styles[status]}`}>
        {status}
      </span>
    )
  }

  // --- ROUTING RENDERER ---
  // If a plan is selected, render the detailed view component entirely.
  if (activePlanId) {
    const selectedPlan = plans.find((p) => p.id === activePlanId)
    return (
      <StudyPlanDetail 
        planSummary={selectedPlan} 
        planData={selectedPlan?.fullData} 
        onBack={() => setActivePlanId(null)} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-zinc-800 text-zinc-100 flex flex-col">
      <div className="sticky top-0 z-40 w-full">
        <Navbar />
      </div>

      <AnimatePresence mode="wait">
        {isConfiguring ? (
          // CONFIGURATION VIEW
          <motion.div
            key="config-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
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
          </motion.div>
        ) : (
          // DASHBOARD LIST VIEW
          <motion.main
            key="list-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8 md:gap-10"
          >
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

              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden shadow-sm backdrop-blur-sm">
                {plans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <LayoutTemplate className="h-10 w-10 text-zinc-600 mb-4" />
                    <h3 className="text-sm font-medium text-zinc-200">No study plans yet</h3>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col divide-y divide-zinc-800/50"
                  >
                    <AnimatePresence mode="popLayout">
                      {plans.map((plan) => (
                        <motion.div
                          key={plan.id}
                          layout
                          variants={itemVariants}
                          initial="hidden"
                          animate="show"
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => setActivePlanId(plan.id)}
                          className="group flex flex-col md:grid md:grid-cols-[1fr_120px_100px_160px_40px] md:items-center gap-4 md:gap-6 py-4 px-4 md:px-5 hover:bg-zinc-800/40 transition-colors cursor-pointer"
                        >
                          <div className="flex min-w-0 flex-col gap-1">
                            <h3 className="text-sm font-medium text-zinc-200 group-hover:text-zinc-50 transition-colors truncate">{plan.title}</h3>
                            <p className="text-[13px] text-zinc-500 truncate">{plan.description}</p>
                          </div>
                          <div className="text-[13px] text-zinc-500">{plan.targetDate}</div>
                          <StatusIndicator status={plan.status} />
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${plan.progress}%` }}
                                className="h-full bg-zinc-200" 
                              />
                            </div>
                            <span className="text-[12px] text-zinc-500">{plan.progress}%</span>
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" 
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent opening the plan when deleting
                                handleDelete(plan.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

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