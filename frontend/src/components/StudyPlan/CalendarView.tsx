import React, { useState, useMemo, useEffect } from 'react'
import { Calendar, momentLocalizer, type View, Views } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { ChevronLeft, ChevronRight, Settings2 } from 'lucide-react'
import type { ExamStudyPlan } from '@/shared/generated-plan'
import { TaskSidebar, type Task } from './TaskSIdebar'
import { EditCalendarModal } from './EditCalendarModel'

const localizer = momentLocalizer(moment)

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: any;
  allDay?: boolean;
}

interface CalendarViewProps {
  planData: ExamStudyPlan;
}

const CalendarView = ({ planData }: CalendarViewProps) => {
  const [view, setView] = useState<View>(Views.MONTH)
  
  // DYNAMIC INITIAL DATE: Opens calendar to the month of the first item
  const initialDate = useMemo(() => {
    if (planData?.plan?.length > 0) {
       const todayStr = moment().format('YYYY-MM-DD');
       const hasToday = planData.plan.some(p => p.date === todayStr);
       return hasToday ? new Date() : new Date(planData.plan[0].date);
    }
    return new Date();
  }, [planData]);

  const [date, setDate] = useState(initialDate)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [dailyTasks, setDailyTasks] = useState<Record<string, Task[]>>({})

  // DND States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentPlanData, setCurrentPlanData] = useState<ExamStudyPlan>(planData)

  // Initialize Tasks based on currentPlanData
  useEffect(() => {
    const initialTasks: Record<string, Task[]> = {};
    currentPlanData.plan.forEach(day => {
      const dateKey = moment(day.date).format('YYYY-MM-DD');
      initialTasks[dateKey] = day.tasks.map((taskText, index) => ({
        id: `task-${dateKey}-${index}`,
        text: taskText,
        completed: false
      }));
    });
    setDailyTasks(initialTasks);
  }, [currentPlanData]);

  // Generate Events from currentPlanData
  const events = useMemo<CalendarEvent[]>(() => {
    const calendarEvents: CalendarEvent[] = []
    currentPlanData.plan.forEach((dayPlan) => {
      let currentStartTime = moment(dayPlan.date).set({ hour: 9, minute: 0 })
      dayPlan.topics.forEach((topic, index) => {
        const durationMinutes = topic.estimated_hours * 60
        const endTime = moment(currentStartTime).add(durationMinutes, 'minutes')
        calendarEvents.push({
          id: `${dayPlan.day}-${topic.topic}-${index}`,
          title: `${topic.subject}: ${topic.topic}`,
          start: currentStartTime.toDate(),
          end: endTime.toDate(),
          resource: topic,
          allDay: true,
        })
        currentStartTime = moment(endTime)
      })
    })
    return calendarEvents
  }, [currentPlanData])

  // --- RECONSTRUCT PLAN AFTER DRAG AND DROP ---
  const handleApplyScheduleChanges = (modifiedEvents: CalendarEvent[]) => {
    const topicsByDate: Record<string, any[]> = {};

    modifiedEvents.forEach(event => {
      const newDateKey = moment(event.start).format('YYYY-MM-DD');
      if (!topicsByDate[newDateKey]) {
        topicsByDate[newDateKey] = [];
      }
      topicsByDate[newDateKey].push(event.resource);
    });

    const updatedPlanArray = Object.keys(topicsByDate).map((dateStr, index) => {
      const existingDay = currentPlanData.plan.find(p => p.date === dateStr);
      const computedFocus = topicsByDate[dateStr][0]?.subject || "Custom Focus";

      if (existingDay) {
        return {
          ...existingDay,
          focus: (existingDay as any).focus || computedFocus,
          topics: topicsByDate[dateStr],
        };
      } else {
        return {
          day: currentPlanData.plan.length + index + 1,
          date: dateStr,
          focus: computedFocus,
          topics: topicsByDate[dateStr],
          tasks: [],
        };
      }
    });

    updatedPlanArray.sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());

    setCurrentPlanData(prev => ({
      ...prev,
      plan: updatedPlanArray as typeof prev.plan
    }));
  }

  // Semantic Coloring
  const eventPropGetter = (event: any) => {
    const subject = event.resource?.subject?.toLowerCase() || '';
    let color = '#a1a1aa'; // zinc-400
    let bg = 'rgba(161, 161, 170, 0.1)';
    let borderColor = 'rgba(161, 161, 170, 0.2)';

    if (subject.includes('exam') || subject.includes('os') || subject.includes('operating')) {
      color = '#c084fc'; // purple-400
      bg = 'rgba(168, 85, 247, 0.1)';
      borderColor = 'rgba(168, 85, 247, 0.2)';
    } else if (subject.includes('dbms') || subject.includes('web')) {
      color = '#34d399'; // emerald-400
      bg = 'rgba(16, 185, 129, 0.1)';
      borderColor = 'rgba(16, 185, 129, 0.2)';
    }

    return {
      style: {
        backgroundColor: bg,
        border: `1px solid ${borderColor}`,
        borderLeft: `3px solid ${color}`,
        color: color,
        fontSize: '0.65rem',
        fontWeight: '500',
        borderRadius: '6px',
        padding: '2px 6px',
        margin: '2px 4px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
      },
    }
  }

  const dayPropGetter = (currentDate: Date) => {
    const isToday = moment(currentDate).isSame(moment(), 'day');
    const isSelected = selectedDate && moment(currentDate).isSame(selectedDate, 'day');

    if (isToday) {
      return { style: { backgroundColor: 'rgba(168, 85, 247, 0.03)', boxShadow: isSelected ? 'inset 0 0 0 1px #a855f7' : 'inset 0 0 0 1px rgba(168, 85, 247, 0.2)' } };
    }
    if (isSelected) {
      return { style: { backgroundColor: 'rgba(255, 255, 255, 0.02)', boxShadow: 'inset 0 0 0 1px rgba(168, 85, 247, 0.4)' } };
    }
    return {}
  }

  const selectedDateKey = selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : "";
  const currentDayMeta = currentPlanData.plan.find(d => d.date === selectedDateKey);
  const currentTopics = currentDayMeta?.topics || [];
  const currentTasks = dailyTasks[selectedDateKey] || [];

  return (
    <>
      <div className="w-full flex flex-col lg:flex-row h-[600px] overflow-hidden relative">
        <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:pr-6 lg:border-r border-zinc-800/60' : ''}`}>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5 w-full">
            <div className="w-full sm:w-auto flex justify-start order-2 sm:order-1">
              <div className="flex items-center rounded-lg bg-zinc-900/80 p-1 border border-zinc-800/80 shadow-sm w-full sm:w-fit">
                <button
                  onClick={() => setView(Views.MONTH)}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${view === Views.MONTH ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'}`}
                >
                  Month
                </button>
                <button
                  onClick={() => setView(Views.WEEK)}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${view === Views.WEEK ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'}`}
                >
                  Week
                </button>
              </div>
            </div>

            <div className="flex-1 flex justify-center items-center gap-3 order-1 sm:order-2 w-full sm:w-auto">
              <button
                onClick={() => setDate(moment(date).subtract(1, view as any).toDate())}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-[15px] font-semibold tracking-tight text-zinc-100 min-w-[140px] text-center">
                {moment(date).format('MMMM YYYY')}
              </span>
              <button
                onClick={() => setDate(moment(date).add(1, view as any).toDate())}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="w-full sm:w-auto flex justify-end order-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 hover:text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.1)]"
              >
                <Settings2 className="w-4 h-4" />
                Edit Plan
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden rounded-lg border border-zinc-800/40 bg-zinc-950/20">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              eventPropGetter={eventPropGetter}
              dayPropGetter={dayPropGetter}
              toolbar={false}
              selectable={true}
              onSelectSlot={(info) => { setSelectedDate(info.start); setIsSidebarOpen(true); }}
              onSelectEvent={(ev) => { setSelectedDate(ev.start); setIsSidebarOpen(true); }}
              style={{ height: '100%' }}
            />
          </div>
        </div>

        {isSidebarOpen && selectedDate && (
          <div className="w-full lg:w-80 shrink-0 lg:pl-6 mt-6 lg:mt-0 animate-in slide-in-from-right-4 fade-in duration-300">
            <TaskSidebar
              selectedDate={selectedDate}
              onClose={() => setIsSidebarOpen(false)}
              tasksForSelectedDate={currentTasks}
              topicsForSelectedDate={currentTopics}
              onToggleTask={(dateKey, taskId) => {
                setDailyTasks(prev => ({ ...prev, [dateKey]: prev[dateKey].map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) }))
              }}
              onAddTask={(e, dateKey, text) => {
                const newTask = { id: `task-${dateKey}-${Date.now()}`, text, completed: false };
                setDailyTasks(prev => ({ ...prev, [dateKey]: [...(prev[dateKey] || []), newTask] }));
              }}
            />
          </div>
        )}

        <style dangerouslySetInnerHTML={{
          __html: `
          .rbc-calendar { color: #f4f4f5; font-family: inherit; }
          .rbc-month-view, .rbc-time-view { border: none !important; background: transparent !important; } 
          .rbc-header { border-bottom: 1px solid rgba(39, 39, 42, 0.6) !important; padding: 10px 0 !important; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; border-left: none !important; color: #a1a1aa; font-weight: 600; }
          .rbc-time-view .rbc-time-gutter { display: none !important; }
          .rbc-time-view .rbc-time-content { display: none !important; }
          .rbc-time-view .rbc-time-header-gutter { display: none !important; }
          .rbc-time-view .rbc-time-header { flex: 1; border-bottom: none !important; min-height: 420px; }
          .rbc-time-header-content { border-left: none !important; }
          .rbc-time-header .rbc-day-bg { border-left: 1px solid rgba(39, 39, 42, 0.4) !important; }
          .rbc-day-bg + .rbc-day-bg { border-left: 1px solid rgba(39, 39, 42, 0.4) !important; }
          .rbc-month-row + .rbc-month-row { border-top: 1px solid rgba(39, 39, 42, 0.4) !important; }
          .rbc-day-bg:hover { background-color: rgba(255, 255, 255, 0.02) !important; cursor: pointer; }
          .rbc-off-range-bg { background: transparent !important; }
          .rbc-off-range { color: #52525b !important; } 
          .rbc-date-cell { padding-right: 8px; padding-top: 6px; font-size: 0.75rem; color: #d4d4d8; font-weight: 500; }
          .rbc-now .rbc-date-cell { color: #c084fc !important; font-weight: 700; }
          .rbc-show-more { color: #c084fc !important; font-size: 0.65rem !important; font-weight: 600 !important; background: transparent !important; padding-top: 4px; }
          .rbc-event { padding: 0 !important; background-color: transparent !important; }
        ` }} />
      </div>

      <EditCalendarModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialEvents={events}
        onApply={handleApplyScheduleChanges}
      />
    </>
  )
}

export default CalendarView