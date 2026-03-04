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

  // Semantic styling logic mapped to premium Zinc/Purple/Emerald theme
  const eventPropGetter = (event: any) => {
    const subject = event.resource?.subject?.toLowerCase() || ''

    // Default muted zinc style
    let color = '#a1a1aa' // zinc-400
    let bg = 'rgba(161, 161, 170, 0.1)'
    let borderColor = 'rgba(161, 161, 170, 0.2)'

    if (subject.includes('exam') || subject.includes('os') || subject.includes('operating')) {
      color = '#c084fc' // purple-400
      bg = 'rgba(168, 85, 247, 0.1)'
      borderColor = 'rgba(168, 85, 247, 0.2)'
    } else if (subject.includes('dbms') || subject.includes('web')) {
      color = '#34d399' // emerald-400
      bg = 'rgba(16, 185, 129, 0.1)'
      borderColor = 'rgba(16, 185, 129, 0.2)'
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
        cursor: 'grab',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
      },
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] w-[95vw] bg-zinc-950/95 backdrop-blur-xl border-zinc-800/60 text-zinc-200 shadow-2xl p-4 sm:p-6 rounded-2xl">
        <DialogHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-800/60 pb-4 gap-4">
          <div className="space-y-1.5">
            <DialogTitle className="text-xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 shadow-sm">
                <GripHorizontal className="w-4 h-4 text-zinc-400" />
              </div>
              Reschedule Plan
            </DialogTitle>
            <DialogDescription className="text-[13px] text-zinc-400">
              Drag and drop topics to different days. Click apply to save your new schedule.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="h-[60vh] min-h-[400px] mt-5 bg-zinc-950/50 border border-zinc-800/40 rounded-xl overflow-hidden shadow-inner">
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

        <DialogFooter className="pt-5 border-t border-zinc-800/60 mt-2 gap-3 sm:gap-0 flex-col sm:flex-row">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-10 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 w-full sm:w-auto font-medium"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!hasChanges}
            className="h-10 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold transition-all disabled:opacity-50 disabled:hover:bg-zinc-100 w-full sm:w-auto shadow-sm"
          >
            <Check className="w-4 h-4 mr-2" />
            Apply Changes
          </Button>
        </DialogFooter>

        {/* CSS STYLES FOR REACT-BIG-CALENDAR */}
        <style dangerouslySetInnerHTML={{
          __html: `
          .dnd-calendar-custom .rbc-calendar { color: #f4f4f5; font-family: inherit; font-size: 0.8rem; }
          .dnd-calendar-custom .rbc-month-view { border: none !important; background: transparent; }
          .dnd-calendar-custom .rbc-header { border-bottom: 1px solid rgba(39, 39, 42, 0.6) !important; padding: 10px 0 !important; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; border-left: none !important; color: #a1a1aa; font-weight: 600; }
          .dnd-calendar-custom .rbc-day-bg + .rbc-day-bg { border-left: 1px solid rgba(39, 39, 42, 0.4) !important; }
          .dnd-calendar-custom .rbc-month-row + .rbc-month-row { border-top: 1px solid rgba(39, 39, 42, 0.4) !important; }
          .dnd-calendar-custom .rbc-off-range-bg { background: transparent !important; }
          .dnd-calendar-custom .rbc-off-range { color: #52525b !important; } 
          .dnd-calendar-custom .rbc-today { background: rgba(255, 255, 255, 0.02) !important; }
          .dnd-calendar-custom .rbc-date-cell { padding-right: 8px; padding-top: 6px; font-size: 0.75rem; color: #d4d4d8; font-weight: 500; }
          .dnd-calendar-custom .rbc-now .rbc-date-cell { color: #c084fc !important; font-weight: 700; }
          .dnd-calendar-custom .rbc-toolbar { padding: 12px 16px; border-bottom: 1px solid rgba(39, 39, 42, 0.6); margin-bottom: 0; display: flex; align-items: center; gap: 8px; }
          .dnd-calendar-custom .rbc-toolbar button { color: #a1a1aa; border: 1px solid rgba(39, 39, 42, 0.8); font-size: 0.75rem; padding: 4px 12px; border-radius: 6px; transition: all 0.2s; background: rgba(24, 24, 27, 0.5); font-weight: 500; }
          .dnd-calendar-custom .rbc-toolbar button:hover { color: #f4f4f5; background: rgba(39, 39, 42, 0.8); }
          .dnd-calendar-custom .rbc-toolbar button.rbc-active { background-color: rgba(39, 39, 42, 0.9); color: #f4f4f5; box-shadow: 0 1px 2px rgba(0,0,0,0.2); border-color: rgba(82, 82, 91, 0.5); }
          .dnd-calendar-custom .rbc-toolbar .rbc-toolbar-label { font-weight: 600; color: #f4f4f5; letter-spacing: -0.01em; }
          .rbc-addons-dnd .rbc-addons-dnd-resizable { cursor: grab; }
          .rbc-addons-dnd-drag-preview { opacity: 0.8; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.4)); border: 1px solid rgba(168, 85, 247, 0.5) !important; border-radius: 6px !important; }
          .rbc-event { padding: 0 !important; background-color: transparent !important; }
        `}} />
      </DialogContent>
    </Dialog>
  )
}