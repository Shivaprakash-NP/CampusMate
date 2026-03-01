import { useState } from "react"
import { Calendar, LayoutList } from "lucide-react"
import Navbar from "./Navbar"
import { CAMPUSMATE_PLAN } from "@/shared/generated-plan"
import CalendarView from "./StudyPlan/CalendarView"

const StudyPlanHeader = ({ view, setView }: { view: 'text' | 'calendar', setView: (v: 'text' | 'calendar') => void }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold text-white tracking-tight">
        Study Plan
      </h1>
      <p className="text-sm text-white/60">
        Your personalized study roadmap
      </p>
    </div>

    {/* TOGGLE ICONS WITH MORE SPACING AND SUBTLE SELECTION */}
    <div className="flex items-center gap-4 p-2">
      <button
        onClick={() => setView('text')}
        title="Text View"
        className="p-1 transition-all group"
      >
        <LayoutList 
          size={18} 
          className={`transition-colors duration-200 ${
            view === 'text' 
              ? "text-[#38bdf8]" 
              : "text-white/40 group-hover:text-white/70"
          }`} 
        />
      </button>
      <button
        onClick={() => setView('calendar')}
        title="Calendar View"
        className="p-1 transition-all group"
      >
        <Calendar 
          size={18} 
          className={`transition-colors duration-200 ${
            view === 'calendar' 
              ? "text-[#38bdf8]" 
              : "text-white/40 group-hover:text-white/70"
          }`} 
        />
      </button>
    </div>
  </div>
)

const PlanOverview = () => (
  <div className="rounded-xl border border-white/10 bg-[#14232d] px-5 py-4">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a3240]">
          <div className="h-4 w-4 rounded-sm border border-[#38bdf8]" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wide text-white/50">
            Active Plan
          </span>
          <span className="text-sm font-semibold text-white">
            Semester Final Prep
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-white/50">
            Timeline
          </span>
          <span className="text-xs font-medium text-white">
            Oct 15 - Dec 20
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-white/50">
            Intensity
          </span>
          <span className="text-xs font-medium text-white">
            2.5 Hours / Day
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-white/50">
            Focus Score
          </span>
          <span className="text-xs font-semibold text-[#38bdf8]">94%</span>
        </div>
      </div>
    </div>
  </div>
)

const TodaysFocus = () => {
  const items = [
    {
      topic: "Organic Chemistry: Molecular Orbitals",
      sub: "Chapter 4 Review & Exercises",
      status: "IN PROGRESS",
      active: true,
    },
    {
      topic: "Macroeconomics: Fiscal Policy",
      sub: "Lecture Notes Synthesis",
      status: "QUEUED",
      active: false,
    },
    {
      topic: "Spanish: Verb Conjugations",
      sub: "Irregular Past Tense Drill",
      status: "QUEUED",
      active: false,
    },
  ]

  return (
    <div className="rounded-xl border border-white/15 bg-[#14232d] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 rounded-full bg-[#38bdf8]" />
          <h2 className="text-lg font-semibold text-white">Today's Focus</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-[#182a35] px-3 py-1 text-xs text-white/60">
          Tuesday, Oct 24
        </span>
      </div>
      <div className="mt-6 flex flex-col gap-5">
        {items.map(item => (
          <div
            key={item.topic}
            className="flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <span
                className={`mt-2 h-2.5 w-2.5 rounded-full border ${
                  item.active
                    ? "border-[#38bdf8] bg-[#38bdf8]"
                    : "border-white/25"
                }`}
              />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-white">
                  {item.topic}
                </span>
                <span className="text-xs text-white/50">{item.sub}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {item.status === "IN PROGRESS" ? (
                <span className="rounded-md bg-[#1b3a48] px-2.5 py-1 text-[10px] font-semibold tracking-widest text-[#38bdf8]">
                  IN PROGRESS
                </span>
              ) : (
                <span className="text-[10px] font-semibold tracking-widest text-white/40">
                  QUEUED
                </span>
              )}
              <span className="text-white/30">...</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const UpcomingSchedule = () => {
  const days = [
    {
      label: "Tomorrow",
      title: "Microbio Intro",
      detail: "Cell structures & lab prep",
    },
    {
      label: "Wed",
      title: "Calc Review",
      detail: "Derivatives & Integration",
    },
    {
      label: "Thu",
      title: "Hist Seminar",
      detail: "Reading summary due",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {days.map(day => (
        <div
          key={day.label}
          className="rounded-xl border border-white/10 bg-[#14232d] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="text-[10px] uppercase tracking-widest text-white/50">
              {day.label}
            </span>
            <span className="text-white/30">...</span>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <span className="text-sm font-semibold text-white">{day.title}</span>
            <span className="text-xs text-white/50">{day.detail}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

const PlanProgress = () => {
  const completedDays = 42
  const totalDays = 65
  const percentage = Math.round((completedDays / totalDays) * 100)

  return (
    <div className="rounded-xl border border-white/10 bg-[#14232d] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a3240]">
            <div className="h-3 w-3 rounded-sm border border-[#38bdf8]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-white">
              Plan Progress
            </span>
            <span className="text-xs text-white/50">
              Current milestone completion
            </span>
          </div>
        </div>
        <span className="text-lg font-semibold text-[#38bdf8]">
          {percentage}%
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <div className="h-1.5 w-full rounded-full bg-white/10">
          <div
            className="h-1.5 rounded-full bg-[#38bdf8]"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-end">
          <span className="text-[10px] uppercase tracking-widest text-white/40">
            {completedDays} / {totalDays} days completed
          </span>
        </div>
      </div>
    </div>
  )
}



const StudyPlan = () => {
  const [view, setView] = useState<'text' | 'calendar'>('text')

  return (
    <div className="min-h-screen bg-[#0b1a22] p-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="rounded-xl border border-white/10 bg-[#0b1220]">
          <Navbar />
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0b1220] p-6 space-y-6">
          <StudyPlanHeader view={view} setView={setView} />
          
          <PlanOverview />

          {view === 'text' ? (
            <div className="space-y-6 animate-in fade-in">
              <TodaysFocus />
              <UpcomingSchedule />
              <PlanProgress />
            </div>
          ) : (
            <CalendarView planData={CAMPUSMATE_PLAN} />
          )}
        </div>
      </div>
    </div>
  )
}

export default StudyPlan