import React, { useState, useMemo, useEffect } from 'react'
import { Calendar, momentLocalizer, type View, Views } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ExamStudyPlan } from '@/shared/generated-plan'
import { TaskSidebar, type Task } from './TaskSIdebar'

const localizer = momentLocalizer(moment)

interface CalendarEvent {
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
  const [date, setDate] = useState(new Date(2026, 2, 5)) 
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [dailyTasks, setDailyTasks] = useState<Record<string, Task[]>>({})

  useEffect(() => {
    const initialTasks: Record<string, Task[]> = {};
    planData.plan.forEach(day => {
      const dateKey = moment(day.date).format('YYYY-MM-DD');
      initialTasks[dateKey] = day.tasks.map((taskText, index) => ({
        id: `task-${dateKey}-${index}`,
        text: taskText,
        completed: false
      }));
    });
    setDailyTasks(initialTasks);
  }, [planData]);

  const events = useMemo<CalendarEvent[]>(() => {
    const calendarEvents: CalendarEvent[] = []
    planData.plan.forEach((dayPlan) => {
      let currentStartTime = moment(dayPlan.date).set({ hour: 9, minute: 0 })
      dayPlan.topics.forEach((topic, index) => {
        const durationMinutes = topic.estimated_hours * 60
        const endTime = moment(currentStartTime).add(durationMinutes, 'minutes')
        calendarEvents.push({
          id: `${dayPlan.day}-${index}`,
          title: `${topic.subject}: ${topic.topic}`,
          start: currentStartTime.toDate(),
          end: endTime.toDate(),
          resource: topic,
          allDay: true, // Forces events into a single stacked block per day in Week View
        })
        currentStartTime = moment(endTime)
      })
    })
    return calendarEvents
  }, [planData])

  // Semantic Coloring
  const eventPropGetter = (event: any) => {
    const subject = event.resource?.subject?.toLowerCase() || '';
    
    // Default: Slate-300 for normal events
    let color = '#cbd5e1'; 
    let bg = 'rgba(203, 213, 225, 0.05)';

    // High Priority / Core Subjects: Purple
    if (subject.includes('exam') || subject.includes('os') || subject.includes('operating')) {
      color = '#a855f7'; // Purple-500
      bg = 'rgba(168, 85, 247, 0.1)';
    } 
    // Standard Accents: Cyan
    else if (subject.includes('dbms') || subject.includes('web')) {
      color = '#22d3ee'; // Cyan-400
      bg = 'rgba(34, 211, 238, 0.1)';
    }
    
    return {
      style: {
        backgroundColor: bg,
        borderLeft: `2px solid ${color}`,
        color: color,
        fontSize: '0.65rem',
        fontWeight: '600',
        borderRadius: '2px',
        padding: '2px 6px',
        margin: '1px 4px',
      },
    }
  }

  // Selected Date Highlighting 
  const dayPropGetter = (currentDate: Date) => {
    const isToday = moment(currentDate).isSame(moment(), 'day'); //
  const isSelected = selectedDate && moment(currentDate).isSame(selectedDate, 'day');

  if (isToday) {
    return {
      style: {
        backgroundColor: 'rgba(34, 211, 238, 0.05)',
        // Adds a permanent subtle cyan border to the current day
        boxShadow: isSelected ? 'inset 0 0 0 1px #22d3ee' : 'inset 0 0 0 1px rgba(34, 211, 238, 0.2)',
      }
    };
  }
    if (selectedDate && moment(currentDate).isSame(selectedDate, 'day')) {
      return {
       style: {
  backgroundColor: 'rgba(255, 255, 255, 0.02)', // Neutral lift instead of cyan tint
  boxShadow: 'inset 0 0 0 1px rgba(34, 211, 238, 0.15)', // Very faint cyan border
}
      }
    }
    return {}
  }

  const selectedDateKey = selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : "";
  const currentDayMeta = planData.plan.find(d => d.date === selectedDateKey);
  const currentTopics = currentDayMeta?.topics || [];
  const currentTasks = dailyTasks[selectedDateKey] || [];

  return (
    // Changed bg to #0b1220
    <div className="mx-auto flex h-[550px] bg-[#0b1220] border border-slate-800 rounded-xl overflow-hidden relative shadow-2xl">
      <div className={`flex-1 flex flex-col p-4 transition-all duration-300 ${isSidebarOpen ? 'pr-4 border-r border-slate-800' : ''}`}>
        
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setView(Views.MONTH)} 
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${view === Views.MONTH ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-slate-400 bg-slate-800 hover:bg-slate-700'}`}
            >
              Month
            </button>
            <button 
              onClick={() => setView(Views.WEEK)} 
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${view === Views.WEEK ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-slate-400 bg-slate-800 hover:bg-slate-700'}`}
            >
              Week
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold tracking-tight text-slate-200">{moment(date).format('MMMM YYYY')}</span>
            <div className="flex gap-1">
              <button onClick={() => setDate(moment(date).subtract(1, view as any).toDate())} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"><ChevronLeft size={16}/></button>
              <button onClick={() => setDate(moment(date).add(1, view as any).toDate())} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
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
        <TaskSidebar 
          selectedDate={selectedDate}
          onClose={() => setIsSidebarOpen(false)}
          tasksForSelectedDate={currentTasks}
          topicsForSelectedDate={currentTopics}
          onToggleTask={(dateKey, taskId) => {
            setDailyTasks(prev => ({
              ...prev,
              [dateKey]: prev[dateKey].map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
            }))
          }}
          onAddTask={(e, dateKey, text) => {
            const newTask = { id: `task-${dateKey}-${Date.now()}`, text, completed: false };
            setDailyTasks(prev => ({ ...prev, [dateKey]: [...(prev[dateKey] || []), newTask] }));
          }}
        />
      )}
      
      {/* Target Theme & WEEK VIEW HACKS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .rbc-calendar { color: #e2e8f0; font-family: inherit; }
        
        /* Changed background to #0b1220 */
        .rbc-month-view, .rbc-time-view { border: none !important; background: #0b1220 !important; } 
        
        .rbc-header { 
          border-bottom: 1px solid #1e293b !important; 
          padding: 12px 0 !important; 
          font-size: 0.65rem; 
          text-transform: uppercase; 
          letter-spacing: 0.1em; 
          border-left: none !important; 
          color: #94a3b8; 
        }

        /* --- WEEK VIEW HACKS TO REMOVE HOURS & LINES --- */
        .rbc-time-view .rbc-time-gutter { display: none !important; }
        .rbc-time-view .rbc-time-content { display: none !important; }
        .rbc-time-view .rbc-time-header-gutter { display: none !important; }
        .rbc-time-view .rbc-time-header { flex: 1; border-bottom: none !important; min-height: 420px; }
        .rbc-time-header-content { border-left: none !important; }
        .rbc-time-header .rbc-day-bg { border-left: 1px solid #1e293b !important; }

        /* Grid lines: Slate-800 for Month View */
        .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #1e293b !important; }
        .rbc-month-row + .rbc-month-row { border-top: 1px solid #1e293b !important; }

        /* Hover cell: Slight slate lift */
        .rbc-day-bg:hover { background-color: rgba(255, 255, 255, 0.02) !important; cursor: pointer; }

        /* Muted Days */
        .rbc-off-range-bg { background: transparent !important; }
        .rbc-off-range { color: #64748b !important; } 

        .rbc-today { background: rgba(34, 211, 238, 0.03) !important; }

        /* Normal Text: Slate-200 */
        .rbc-date-cell { padding-right: 8px; padding-top: 6px; font-size: 0.75rem; color: #e2e8f0; }
        .rbc-now .rbc-date-cell { color: #22d3ee !important; font-weight: bold; }
        
        .rbc-show-more { color: #22d3ee !important; font-size: 0.65rem !important; font-weight: 700 !important; background: transparent !important; }
      ` }} />
    </div>
  )
}

export default CalendarView