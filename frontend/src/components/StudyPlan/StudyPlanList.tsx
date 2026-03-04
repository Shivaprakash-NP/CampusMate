"use client"

import React, { useState } from "react"
import { Plus, MoreVertical, Trash2, Pencil, Calendar, LayoutTemplate } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import Navbar from "../Navbar" // Ensure this path is correct

// Shadcn Components
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress1" // Assuming this is standard shadcn path
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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

// --- Animation Variants ---
// FIX: Added the explicitly typed ": Variants" to both objects to resolve the TS error
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
}

export default function StudyPlans() {
  const [plans, setPlans] = useState<StudyPlanSummary[]>(INITIAL_PLANS)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newPlanName, setNewPlanName] = useState("")

  // --- Handlers UNTOUCHED ---
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

  // Refactored: Text-only status without Badge or Dot
  const StatusIndicator = ({ status }: { status: PlanStatus }) => {
    if (status === 'completed') {
      return (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
          Completed
        </span>
      )
    }
    if (status === 'active') {
      return (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#818cf8]">
          Active
        </span>
      )
    }
    return (
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        Draft
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-cyan-500/30 text-zinc-100 flex flex-col">

      {/* Sticky Navbar Wrapper */}
      <div className="sticky top-0 z-40 w-full">
        <Navbar />
      </div>

      {/* Main Content Layout */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8 md:gap-10">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 tracking-tight">
              Study Plans
            </h1>
            <p className="text-sm text-zinc-400 max-w-md">
              Manage your generated study tracks and roadmaps.
            </p>
          </div>

          <Button
            size="sm"

            className="h-9 bg-zinc-300 text-zinc-950 hover:bg-zinc-300 font-semibold transition-all"

          >
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </Button>
        </motion.div>

        {/* Minimalist Flat List Wrapped in Subtle Container */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          {/* Subtle Column Headers (Desktop Only) */}
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 mb-4 shadow-sm">
                  <LayoutTemplate className="h-5 w-5 text-zinc-400" />
                </div>
                <h3 className="text-sm font-medium text-zinc-200 mb-1">No study plans yet</h3>
                <p className="text-sm text-zinc-500 text-center max-w-sm">
                  Create your first roadmap to begin organizing your subjects and tracking progress.
                </p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col divide-y divide-zinc-800/50"
              >
                {plans.map((plan) => (
                  <motion.div
                    variants={itemVariants}
                    key={plan.id}
                    className="group flex flex-col md:grid md:grid-cols-[1fr_120px_100px_160px_40px] md:items-center gap-4 md:gap-6 py-4 px-4 md:px-5 transition-colors duration-200 hover:bg-zinc-800/40"
                  >

                    {/* Title & Description */}
                    <div className="flex min-w-0 flex-col gap-1">
                      <h3 className="text-sm font-medium text-zinc-200 tracking-tight group-hover:text-cyan-400 transition-colors cursor-pointer truncate">
                        {plan.title}
                      </h3>
                      <p className="text-[13px] text-zinc-500 truncate">
                        {plan.description}
                      </p>
                    </div>

                    {/* Target Date */}
                    <div className="flex items-center gap-1.5 text-[13px] text-zinc-500">
                      <Calendar className="h-3.5 w-3.5 text-zinc-600 md:hidden" />
                      <span>{plan.targetDate}</span>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center">
                      <StatusIndicator status={plan.status} />
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 bg-zinc-100`}
                          style={{ width: `${plan.progress}%` }}
                        />
                      </div>
                      <span className="text-[12px] font-medium text-zinc-500 w-9 text-right tabular-nums">
                        {plan.progress}%
                      </span>
                    </div>

                    {/* Actions Menu */}
                    <div className="hidden md:flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border border-zinc-800 text-zinc-200 shadow-xl rounded-lg">
                          <DropdownMenuItem className="cursor-pointer text-sm font-medium focus:bg-zinc-800 focus:text-zinc-100 transition-colors">
                            <Pencil className="mr-2 h-4 w-4 text-zinc-400" />
                            <span>Edit plan</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-zinc-800" />
                          <DropdownMenuItem
                            onClick={() => handleDelete(plan.id)}
                            className="cursor-pointer text-sm font-medium text-red-400 focus:bg-red-950/50 focus:text-red-300 transition-colors"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete plan</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Mobile Actions (Visible only on small screens) */}
                    <div className="flex md:hidden items-center justify-between mt-2 pt-4 border-t border-zinc-800/50">
                      <Button variant="ghost" size="sm" className="text-zinc-400 h-8 px-2">
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(plan.id)} className="text-red-400 hover:text-red-300 hover:bg-red-950/30 h-8 px-2">
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>

                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      {/* CREATE NEW PLAN DIALOG */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-100">New Study Plan</DialogTitle>
            <DialogDescription className="text-sm text-zinc-400 mt-1.5">
              Name your roadmap to begin generating your schedule.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateNew} className="space-y-6 pt-4">
            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-[13px] font-medium text-zinc-300">
                Plan Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. System Design Interview..."
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                className="h-10 bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-indigo-400 focus-visible:border-cyan-500 transition-all rounded-lg"
                autoFocus
              />
            </div>

            <DialogFooter className="gap-3 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateModalOpen(false)}
                className="h-10 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 font-medium rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newPlanName.trim()}
                className="h-10 bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm transition-all rounded-lg disabled:opacity-50 disabled:bg-cyan-600"
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