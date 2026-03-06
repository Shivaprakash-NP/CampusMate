// StudyPlan.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { Calendar, LayoutList, Target, Clock, Zap, CheckCircle, CircleDashed, ArrowRight, ArrowLeft, PlayCircle, FileText } from "lucide-react"
import moment from "moment"
import Navbar from "../Navbar"
import { type ExamStudyPlan } from "@/shared/generated-plan" 
import CalendarView from "./CalendarView"
import { Checkbox } from "@/components/ui/checkbox" 

interface StudyPlanProps {
  planSummary?: any;
  planData?: any; 
  onBack?: () => void;
}

const StudyPlanHeader = ({ view, setView, onBack, title }: { view: 'text' | 'calendar', setView: (v: 'text' | 'calendar') => void, onBack?: () => void, title?: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-zinc-800/60 transition-all">
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

      <div className="flex items-center rounded-lg bg-zinc-900/80 p-1 border border-zinc-800/80 shadow-sm w-fit shrink-0">
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

const PlanOverview = ({ title, startDate, endDate, progress }: { title?: string, startDate?: string, endDate?: string, progress: number }) => {
  const start = startDate ? moment(startDate) : moment();
  const end = endDate ? moment(endDate) : moment().add(30, 'days');

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
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-300">Topic Completion Progress</span>
            <span className="text-cyan-500 font-medium tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80 shadow-inner">
            <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
  )
}

const TodaysFocus = ({ 
  normalizedPlan, 
  completedTopicIds, 
  onToggleTopic 
}: { 
  normalizedPlan: ExamStudyPlan;
  completedTopicIds: Set<string>;
  onToggleTopic: (topicId: string) => void;
}) => {
  const todayStr = moment().format('YYYY-MM-DD');

  let currentDayPlan = normalizedPlan.plan.find(p => p.date === todayStr);
  if (!currentDayPlan && normalizedPlan.plan.length > 0) {
    currentDayPlan = normalizedPlan.plan[0];
  }

  const items = currentDayPlan?.topics?.map((t: any, index: number) => ({
    id: String(t.id), // Added Database ID
    topic: t.topic, 
    sub: t.subject, 
    active: index === 0,
    resources: t.resources || [] 
  })) || [];

  const displayDate = currentDayPlan ? moment(currentDayPlan.date).format('dddd, MMM D') : moment().format('dddd, MMM D');
  const isActuallyToday = currentDayPlan?.date === todayStr;

  return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            {isActuallyToday ? "Today's Focus" : "Next Focus"}
          </h2>
          <span className="text-xs font-medium text-zinc-500">
          {displayDate}
        </span>
        </div>

        <div className="flex flex-col rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden divide-y divide-zinc-800/50">
          {items.length > 0 ? items.map((item, index) => {
              // Now checks using the backend ID
              const isCompleted = completedTopicIds.has(item.id);

              return (
                <div
                    key={`${item.topic}-${index}`}
                    className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-colors hover:bg-zinc-800/40 cursor-pointer ${isCompleted ? 'opacity-60' : ''}`}
                    onClick={() => onToggleTopic(item.id)}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5 flex-shrink-0">
                      <Checkbox 
                        checked={isCompleted}
                        onCheckedChange={() => onToggleTopic(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded-[4px] border-zinc-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`text-[13px] font-medium transition-colors ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-100 group-hover:text-zinc-200'}`}>
                        {item.topic}
                      </span>
                      
                      {item.sub && (
                        <span className="text-xs text-zinc-500">{item.sub}</span>
                      )}

                    </div>
                  </div>

                  {/* RIGHT SIDE: Resource Icons always visible */}
                  <div className="flex items-center gap-2.5 self-end sm:self-auto ml-7 sm:ml-0">
                    {item.resources.length > 0 && (
                      <div className="flex items-center gap-2.5">
                        {item.resources.map((res: any, rIdx: number) => {
                          if (res.type === 'VIDEO') {
                            return (
                              <a 
                                key={rIdx} 
                                href={res.url || res.fallbackQueryUrl || "#"} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                onClick={(e) => e.stopPropagation()} 
                                className="text-zinc-500 hover:text-cyan-400 transition-colors" 
                                title={res.title || "Watch Video"}
                              >
                                <PlayCircle className="w-[18px] h-[18px]" />
                              </a>
                            );
                          }
                          if (res.type === 'ARTICLE') {
                            return (
                              <a 
                                key={rIdx} 
                                href={res.url || res.fallbackQueryUrl || "#"} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                onClick={(e) => e.stopPropagation()} 
                                className="text-zinc-500 hover:text-cyan-400 transition-colors" 
                                title={res.title || "Read Article"}
                              >
                                <FileText className="w-[18px] h-[18px]" />
                              </a>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )
          }) : (
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
                    <span className="text-sm font-medium text-zinc-200 group-hover:text-cyan-400 transition-colors">
                      {firstTopic?.topic || "Untitled Topic"}
                    </span>
                    {firstTopic?.subject && (
                      <span className="text-xs text-zinc-500 line-clamp-1">
                        {firstTopic.subject}
                      </span>
                    )}
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
  
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(new Set())

  // SET INITIAL STATE FROM BACKEND DATA
  useEffect(() => {
    if (planData && planData.schedulePerDayList) {
      const initialSet = new Set<string>();
      planData.schedulePerDayList.forEach((dayItem: any) => {
        dayItem.topics?.forEach((t: any) => {
          if (t.completed) {
            initialSet.add(String(t.id));
          }
        });
      });
      setCompletedTopicIds(initialSet);
    }
  }, [planData]);

  // TOGGLE API LOGIC
  const toggleTopicCompletion = async (topicId: string) => {
    // 1. Optimistic UI update (feels instant to the user)
    setCompletedTopicIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });

    // 2. Call backend endpoint
    try {
      let token = localStorage.getItem("accessToken") || "";
      if (!token) {
        const match = document.cookie.match(/(?:^|; )accessToken=([^;]*)/);
        if (match) token = match[1];
      }

      const response = await fetch(`http://localhost:8080/api/topics/${topicId}/toggle`, {
        method: "POST", // Toggle endpoint
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) throw new Error("Failed to sync toggle with server");

    } catch (error) {
      console.error("Error toggling topic:", error);
      // Revert optimistic update if API fails
      setCompletedTopicIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(topicId)) {
          newSet.delete(topicId);
        } else {
          newSet.add(topicId);
        }
        return newSet;
      });
    }
  }

  const normalizedPlanData: ExamStudyPlan = useMemo(() => {
    if (!planData || !planData.schedulePerDayList) {
      return { exam_date: "", total_days: 0, daily_study_hours: 0, strategy: "", plan: [] };
    }

    const daysMap = new Map<string, any>();

    planData.schedulePerDayList.forEach((dayItem: any) => {
      const dateKey = dayItem.date ? moment(dayItem.date).format('YYYY-MM-DD') : null;
      if (!dateKey) return;

      const mappedTopics = (dayItem.topics || []).map((t: any) => {
        const rawSubtopics = t.subtopics || t.subTopics || t.tasks || t.modules || [];
        const formattedSubtopics = Array.isArray(rawSubtopics) 
          ? rawSubtopics.map(sub => typeof sub === 'string' ? sub : (sub.title || sub.name || sub.description || "Subtopic"))
          : [];

        return {
          id: t.id, // MAPPED ID FOR TOGGLING
          subject: (t.syllabus && t.syllabus.title) || (t.parentTopic && t.parentTopic.title) || "",
          topic: t.title || t.topicName || t.description || "Untitled Topic",
          estimated_hours: t.duration || t.estimatedHours || t.estimated_hours || 2,
          subtopics: formattedSubtopics,
          resources: t.resources || [] 
        };
      });

      if (daysMap.has(dateKey)) {
        const existingDay = daysMap.get(dateKey);
        existingDay.topics = [...existingDay.topics, ...mappedTopics];
      } else {
        daysMap.set(dateKey, {
          date: dateKey,
          focus: "Daily Study Focus",
          tasks: [],
          topics: mappedTopics
        });
      }
    });

    const mergedPlanArray = Array.from(daysMap.values())
      .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf())
      .map((dayData, index) => ({
        ...dayData,
        day: index + 1
      }));

    return {
      exam_date: planData.endDate || "",
      total_days: mergedPlanArray.length,
      daily_study_hours: 2, 
      strategy: "Adaptive Backend Plan",
      plan: mergedPlanArray
    };
  }, [planData]);

  const totalTopicsCount = useMemo(() => {
    return normalizedPlanData.plan.reduce((total, day) => total + day.topics.length, 0);
  }, [normalizedPlanData]);

  const progressPercentage = totalTopicsCount === 0 
    ? 0 
    : Math.min(100, Math.round((completedTopicIds.size / totalTopicsCount) * 100));

  return (
      <div className="min-h-screen bg-[#09090b] font-sans text-zinc-100 flex flex-col selection:bg-cyan-500/30">

        {!onBack && (
            <div className="sticky top-0 z-40 w-full">
              <Navbar />
            </div>
        )}

        <main 
          className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8 md:gap-10 transition-all duration-300 ease-in-out ${
            view === 'calendar' ? 'max-w-[1600px]' : 'max-w-5xl'
          }`}
        >

          <StudyPlanHeader
              view={view}
              setView={setView}
              onBack={onBack}
              title={planSummary?.title || planData?.title}
          />

          <div className="w-full">
            {view === 'text' ? (
                <div className="flex flex-col gap-10 w-full">
                  <PlanOverview
                      title={planSummary?.title || planData?.title}
                      startDate={planData?.startDate}
                      endDate={planData?.endDate}
                      progress={progressPercentage}
                  />
                  <TodaysFocus 
                    normalizedPlan={normalizedPlanData} 
                    completedTopicIds={completedTopicIds}
                    onToggleTopic={toggleTopicCompletion}
                  />
                  <UpcomingSchedule normalizedPlan={normalizedPlanData} />
                </div>
            ) : (
                <div className="w-full rounded-2xl border border-zinc-800/60 bg-zinc-900/20 p-2 sm:p-6 shadow-xl backdrop-blur-sm">
                  <CalendarView 
                    planData={normalizedPlanData} 
                    completedTopicIds={completedTopicIds}
                    onToggleTopic={toggleTopicCompletion}
                  />
                </div>
            )}
          </div>

        </main>
      </div>
  )
}

export default StudyPlan