"use client"

import React, { useState, useEffect } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop"
import moment from "moment"
import { Check, X, GripHorizontal } from "lucide-react"

import "react-big-calendar/lib/css/react-big-calendar.css"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const localizer = momentLocalizer(moment)

// FIX: Cast Calendar as any to bypass the broken @types overload for the HOC wrapper
const DnDCalendar = withDragAndDrop(Calendar as any)

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: any; 
  allDay?: boolean;
}

interface EditCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEvents: CalendarEvent[];
  onApply: (modifiedEvents: CalendarEvent[]) => void;
}

export function EditCalendarModal({ isOpen, onClose, initialEvents, onApply }: EditCalendarModalProps) {
  const [draftEvents, setDraftEvents] = useState<CalendarEvent[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  // Reset draft events whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftEvents(initialEvents)
      setHasChanges(false)
    }
  }, [isOpen, initialEvents])

  const onEventDrop = ({ event, start, end }: any) => {
    const updatedEvents = draftEvents.map((existingEvent) =>
      existingEvent.id === event.id
        ? { ...existingEvent, start: new Date(start), end: new Date(end) }
        : existingEvent
    )
    setDraftEvents(updatedEvents)
    setHasChanges(true)
  }

  const handleApply = () => {
    onApply(draftEvents)
    onClose()
  }

  // Semantic styling logic
  const eventPropGetter = (event: any) => {
    const subject = event.resource?.subject?.toLowerCase() || ''
    let color = '#cbd5e1' 
    let bg = 'rgba(203, 213, 225, 0.05)'

    if (subject.includes('exam') || subject.includes('os') || subject.includes('operating')) {
      color = '#a855f7'
      bg = 'rgba(168, 85, 247, 0.1)'
    } else if (subject.includes('dbms') || subject.includes('web')) {
      color = '#22d3ee'
      bg = 'rgba(34, 211, 238, 0.1)'
    }
    
    return {
      style: {
        backgroundColor: bg,
        borderLeft: `2px solid ${color}`,
        color: color,
        fontSize: '0.6rem',
        fontWeight: '600',
        borderRadius: '2px',
        padding: '2px 6px',
        cursor: 'grab', 
      },
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] bg-[#0b1220]/95 backdrop-blur-xl border-slate-800 text-slate-200 shadow-2xl p-6">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-800/60 pb-4">
          <div className="space-y-1">
            <DialogTitle className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
              <GripHorizontal className="w-5 h-5 text-cyan-400" />
              Reschedule Plan
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Drag and drop topics to different days. Click apply to save your new schedule.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="h-[400px] mt-4 bg-[#0b1220] border border-slate-800 rounded-lg overflow-hidden">
          {/* @ts-ignore - Bypassing strictly broken React Big Calendar Overloads */}
          <DnDCalendar
            localizer={localizer}
            events={draftEvents}
            // FIX: Using any avoids the object inference overload
            startAccessor={(event: any) => new Date(event.start)}
            endAccessor={(event: any) => new Date(event.end)}
            defaultView="month"
            views={["month"]}
            onEventDrop={onEventDrop}
            resizable={false} 
            eventPropGetter={eventPropGetter}
            toolbar={true} 
            className="dnd-calendar-custom"
          />
        </div>

        <DialogFooter className="pt-4 border-t border-slate-800/60 mt-2">
          <Button variant="ghost" onClick={onClose} className="h-9 text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleApply} 
            disabled={!hasChanges}
            className="h-9 bg-white hover:bg-slate-200 text-slate-900 font-semibold transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4 mr-2" />
            Apply Changes
          </Button>
        </DialogFooter>

        <style dangerouslySetInnerHTML={{ __html: `
          .dnd-calendar-custom .rbc-calendar { color: #e2e8f0; font-family: inherit; font-size: 0.8rem; }
          .dnd-calendar-custom .rbc-month-view { border: none !important; background: transparent; }
          .dnd-calendar-custom .rbc-header { border-bottom: 1px solid #1e293b !important; padding: 8px 0 !important; font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em; border-left: none !important; color: #94a3b8; }
          .dnd-calendar-custom .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #1e293b !important; }
          .dnd-calendar-custom .rbc-month-row + .rbc-month-row { border-top: 1px solid #1e293b !important; }
          .dnd-calendar-custom .rbc-off-range-bg { background: transparent !important; }
          .dnd-calendar-custom .rbc-off-range { color: #64748b !important; } 
          .dnd-calendar-custom .rbc-today { background: rgba(34, 211, 238, 0.03) !important; }
          .dnd-calendar-custom .rbc-date-cell { padding-right: 6px; padding-top: 4px; font-size: 0.7rem; color: #e2e8f0; }
          .dnd-calendar-custom .rbc-now .rbc-date-cell { color: #22d3ee !important; font-weight: bold; }
          .dnd-calendar-custom .rbc-toolbar { padding: 10px; border-bottom: 1px solid #1e293b; margin-bottom: 0; }
          .dnd-calendar-custom .rbc-toolbar button { color: #94a3b8; border-color: #1e293b; font-size: 0.75rem; }
          .dnd-calendar-custom .rbc-toolbar button.rbc-active { background-color: #1e293b; color: white; }
          .rbc-addons-dnd .rbc-addons-dnd-resizable { cursor: grab; }
          .rbc-addons-dnd-drag-preview { opacity: 0.6; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.5)); border: 1px solid #22d3ee !important; }
        `}} />
      </DialogContent>
    </Dialog>
  )
}