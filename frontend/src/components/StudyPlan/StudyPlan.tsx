"use client"

import { useState, useMemo } from "react"
import { Calendar, LayoutList, Target, Clock, Zap, CheckCircle, CircleDashed, ArrowRight, ArrowLeft } from "lucide-react"
import moment from "moment"
import Navbar from "../Navbar"
import { CAMPUSMATE_PLAN, type ExamStudyPlan } from "@/shared/generated-plan"
import CalendarView from "./CalendarView"

interface StudyPlanProps {
  planSummary?: any;
  planData?: any; // This receives your backend data object
  onBack?: () => void;
}

const StudyPlanHeader = ({ view, setView, onBack, title }: { view: 'text' | 'calendar', setView: (v: 'text' | 'calendar') => void, onBack?: () => void, title?: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-zinc-800/60">
    <div className="flex flex-col gap-1.5">
      {onBack && (
        <button 
          onClick={onBack} 
          className="flex items-center text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors w-fit mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> 
          Back to Plans
        </button>
      )}
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
        {title || "Study Plan"}
      </h1>
      <p className="text-sm text-zinc-400">
        Your personalized study roadmap
      </p>
    </div>

    <div className="flex items-center rounded-lg bg-zinc-900/80 p-1 border border-zinc-800/80 shadow-sm w-fit">
      <button
        onClick={() => setView('text')}
        className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${view === 'text'
            ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50'
            : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
          }`}
      >
        <LayoutList className="size-4" />
        Overview
      </button>

      <button
        onClick={() => setView('calendar')}
        className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${view === 'calendar'
            ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50'
            : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
          }`}
      >
        <Calendar className="size-4" />
        Calendar
      </button>
    </div>
  </div>
)

const PlanOverview = ({ title, startDate, endDate }: { title?: string, startDate?: string, endDate?: string }) => {
  // Dynamically calculate progress based on backend dates
  const start = startDate ? moment(startDate) : moment();
  const end = endDate ? moment(endDate) : moment().add(30, 'days');
  const today = moment();

  const totalDays = Math.max(1, end.diff(start, 'days') + 1);
  const completedDays = Math.max(0, today.diff(start, 'days'));
  const percentage = Math.min(100, Math.max(0, Math.round((completedDays / totalDays) * 100)));

  return (
    <div className="flex flex-col gap-8 py-2">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 shadow-sm">
            <Target className="size-5 text-zinc-300" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
              Active Plan
            </span>
            <span className="text-lg font-medium tracking-tight text-zinc-100">
              {title || "Semester Final Prep"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 md:gap-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Calendar className="size-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wider">Timeline</span>
            </div>
            <span className="text-sm font-medium text-zinc-200">
              {start.format('MMM DD')} - {end.format('MMM DD')}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Clock className="size-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wider">Intensity</span>
            </div>
            <span className="text-sm font-medium text-zinc-200">Adaptive</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Zap className="size-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wider">Focus Score</span>
            </div>
            <span className="text-sm font-medium text-zinc-200">Optimal</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-300">Overall Progress</span>
          <span className="text-zinc-500 font-medium tabular-nums">{percentage}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80 shadow-inner">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

const TodaysFocus = ({ normalizedPlan }: { normalizedPlan: ExamStudyPlan }) => {
  const todayStr = moment().format('YYYY-MM-DD');
  
  // Find today's plan, if not found, jump to the first day of the schedule
  let currentDayPlan = normalizedPlan.plan.find(p => p.date === todayStr);
  if (!currentDayPlan && normalizedPlan.plan.length > 0) {
    currentDayPlan = normalizedPlan.plan[0];
  }

  const items = currentDayPlan?.topics?.map((t, index) => ({
    topic: t.subject,
    sub: t.topic,
    status: index === 0 ? "IN PROGRESS" : "QUEUED",
    active: index === 0,
  })) || [];

  const displayDate = currentDayPlan ? moment(currentDayPlan.date).format('dddd, MMM D') : moment().format('dddd, MMM D');
  const isActuallyToday = currentDayPlan?.date === todayStr;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          {isActuallyToday ? "Today's Focus" : "Next Focus"}
        </h2>
        <span className="text-xs font-medium text-zinc-500">
          {displayDate}
        </span>
      </div>

      <div className="flex flex-col rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden divide-y divide-zinc-800/50">
        {items.length > 0 ? items.map(item => (
          <div
            key={item.topic + item.sub}
            className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-colors hover:bg-zinc-800/40 cursor-pointer`}
          >
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex-shrink-0">
                {item.active ? (
                  <CheckCircle className="size-4 text-purple-400" />
                ) : (
                  <CircleDashed className="size-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[13px] font-medium transition-colors ${item.active ? 'text-zinc-100' : 'text-zinc-300 group-hover:text-zinc-200'}`}>
                  {item.topic}
                </span>
                <span className="text-xs text-zinc-500">{item.sub}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-auto ml-7 sm:ml-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                {item.status}
              </span>
              <button className="text-zinc-600 hover:text-zinc-300 transition-colors">
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )) : (
          <div className="p-6 text-center text-sm text-zinc-500 font-medium">
            No topics scheduled for this date.
          </div>
        )}
      </div>
    </div>
  )
}

const UpcomingSchedule = ({ normalizedPlan }: { normalizedPlan: ExamStudyPlan }) => {
  const todayStr = moment().format('YYYY-MM-DD');
  // Get upcoming days (excluding today) and take the next 3
  const upcomingDays = normalizedPlan.plan.filter(p => p.date > todayStr).slice(0, 3);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-zinc-100 pl-1">
        Looking Ahead
      </h2>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        {upcomingDays.length > 0 ? upcomingDays.map((day) => {
          const displayLabel = moment(day.date).calendar(null, {
            nextDay: '[Tomorrow]',
            nextWeek: 'ddd',
            sameElse: 'MMM D'
          });
          const firstTopic = day.topics?.[0];

          return (
            <div
              key={day.date}
              className="group flex flex-col gap-3 p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20 hover:bg-zinc-900/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  {displayLabel}
                </span>
                <ArrowRight className="size-3.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">
                  {firstTopic?.subject || "Study Session"}
                </span>
                <span className="text-xs text-zinc-500 line-clamp-1">
                  {firstTopic?.topic || "Assigned portions"}
                </span>
              </div>
            </div>
          )
        }) : (
           <div className="col-span-3 p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20 text-center text-zinc-500 text-sm">
             No upcoming schedules found.
           </div>
        )}
      </div>
    </div>
  )
}

const StudyPlan = ({ planSummary, planData, onBack }: StudyPlanProps) => {
  const [view, setView] = useState<'text' | 'calendar'>('text')

  // Adapter: Convert the backend schedulePerDayList object into the ExamStudyPlan interface
  const normalizedPlanData: ExamStudyPlan = useMemo(() => {
    if (!planData || !planData.schedulePerDayList) {
      return CAMPUSMATE_PLAN; // Fallback to dummy data if not available yet
    }

    // Fix: Provide the missing required fields for the ExamStudyPlan interface
    return {
      exam_date: planData.endDate || "",
      total_days: planData.schedulePerDayList.length,
      daily_study_hours: 2, // Assuming a default of 2 hours, you can update this if your backend provides it
      strategy: "Adaptive Backend Plan",
      plan: planData.schedulePerDayList.map((dayItem: any, index: number) => ({
        day: index + 1,
        date: dayItem.date,
        focus: "Daily Study Focus",
        tasks: [],
        topics: (dayItem.topics || []).map((t: any) => ({
          subject: t.title || t.subjectName || t.subject || "Topic Focus", 
          topic: t.description || t.topicName || t.topic || "Study Session",
          estimated_hours: t.duration || t.estimatedHours || t.estimated_hours || 2,
          subtopics: t.subtopics || []
        }))
      }))
    };
  }, [planData]);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 flex flex-col">

      {!onBack && (
        <div className="sticky top-0 z-40 w-full">
          <Navbar />
        </div>
      )}

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8 md:gap-10">

        <StudyPlanHeader 
          view={view} 
          setView={setView} 
          onBack={onBack} 
          title={planSummary?.title || planData?.title} 
        />

        <div className="w-full">
          {view === 'text' ? (
            <div className="flex flex-col gap-10 w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
              <PlanOverview 
                 title={planSummary?.title || planData?.title} 
                 startDate={planData?.startDate}
                 endDate={planData?.endDate}
              />
              <TodaysFocus normalizedPlan={normalizedPlanData} />
              <UpcomingSchedule normalizedPlan={normalizedPlanData} />
            </div>
          ) : (
            <div className="w-full rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-2 sm:p-6 shadow-sm backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300 ease-out">
              <CalendarView planData={normalizedPlanData} />
            </div>
          )}
        </div>

      </main>
    </div>
  )
}

export default StudyPlan