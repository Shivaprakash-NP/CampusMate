"use client"

import React, { useState } from 'react'
import moment from 'moment'
import { X, Plus } from 'lucide-react'
import type { StudyTopic } from '@/shared/generated-plan'

import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskSidebarProps {
  selectedDate: Date | null;
  onClose: () => void;
  tasksForSelectedDate: Task[];
  topicsForSelectedDate: StudyTopic[];
  onToggleTask: (dateKey: string, taskId: string) => void;
  onAddTask: (e: React.FormEvent, dateKey: string, text: string) => void;
}

export const TaskSidebar = ({
  selectedDate,
  onClose,
  tasksForSelectedDate,
  topicsForSelectedDate,
  onToggleTask,
  onAddTask
}: TaskSidebarProps) => {
  const [newTaskText, setNewTaskText] = useState("")
  const selectedDateKey = selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !selectedDateKey) return;
    onAddTask(e, selectedDateKey, newTaskText);
    setNewTaskText("");
  };

  if (!selectedDate) return null;

  return (
    // Changed bg to #0b1220
    <div className="w-[340px] bg-[#0b1220] flex flex-col border-l border-slate-800 animate-in slide-in-from-right duration-500 ease-out shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
      
      {/* HEADER */}
      <div className="px-6 py-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-200">Day Details</h2>
          <div className="flex items-center gap-2">
             <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                {moment(selectedDate).format('dddd, MMM D')}
             </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="h-8 w-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-10 custom-scrollbar">
        
        {/* SECTION: TOPICS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-slate-400">
                <h3 className="text-[10px] font-black uppercase tracking-[0.15em]">Topics</h3>
             </div>
             <span className="text-[10px] text-slate-500 font-medium">{topicsForSelectedDate.length} Modules</span>
          </div>
          
          <Accordion type="multiple" className="w-full space-y-2">
            {topicsForSelectedDate.map((topic, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-none bg-slate-800/30 rounded-lg px-4 transition-colors hover:bg-slate-800/60">
                <AccordionTrigger className="py-4 hover:no-underline group">
                  <div className="flex flex-col items-start text-left gap-1">
                    {/* High Priority Accent: Purple */}
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">{topic.subject}</span>
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{topic.topic}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
                  {topic.subtopics && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {topic.subtopics.map((s, i) => (
                        <span key={i} className="text-[9px] bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-500">
                     <span className="h-1 w-1 rounded-full bg-slate-600" />
                     <span>Estimated session: {topic.estimated_hours}h</span>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <Separator className="bg-slate-800" />

        {/* SECTION: TASKS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-slate-400">
                <h3 className="text-[10px] font-black uppercase tracking-[0.15em]">Tasks</h3>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="relative group">
            <input
              type="text"
              placeholder="New task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="w-full h-10 bg-slate-800/30 border border-slate-800 rounded-md pl-3 pr-10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-800/50 transition-all"
            />
            <button type="submit" className="absolute right-1 top-1 h-8 w-8 rounded flex items-center justify-center text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 transition-all">
              <Plus className="h-4 w-4" />
            </button>
          </form>

          <div className="space-y-1">
            {tasksForSelectedDate.map(task => (
              <div 
                key={task.id} 
                className={`flex items-center space-x-4 p-3 rounded-xl transition-all group/task ${
                  task.completed ? 'opacity-50' : 'hover:bg-slate-800/40'
                }`}
              >
                <Checkbox 
                  id={task.id}
                  checked={task.completed}
                  onCheckedChange={() => onToggleTask(selectedDateKey, task.id)}
                  className="h-5 w-5 rounded-md border-slate-600 data-[state=checked]:bg-cyan-400 data-[state=checked]:border-cyan-400 transition-all"
                />
                <label
                  htmlFor={task.id}
                  className={`text-sm font-medium cursor-pointer transition-all ${
                    task.completed ? 'line-through text-slate-500' : 'text-slate-200 group-hover/task:text-white'
                  }`}
                >
                  {task.text}
                </label>
              </div>
            ))}
            
            {tasksForSelectedDate.length === 0 && (
               <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-slate-500 font-medium">No tasks defined for this date.</p>
               </div>
            )}
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}} />
    </div>
  )
}