"use client"

import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { X, MonitorPlay, FileText } from 'lucide-react'
import type { StudyTopic } from '@/shared/generated-plan'

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

interface TaskSidebarProps {
  selectedDate: Date | null;
  onClose: () => void;
  topicsForSelectedDate: StudyTopic[];
  completedTopicIds: Set<string>;
  onToggleTopic: (topicId: string) => void; // Updated Prop Signature
}

export const TaskSidebar = ({
  selectedDate,
  onClose,
  topicsForSelectedDate,
  completedTopicIds,
  onToggleTopic
}: TaskSidebarProps) => {
  const selectedDateKey = selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : "";
  
  const [completedSubtopics, setCompletedSubtopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCompletedSubtopics(new Set());
  }, [selectedDateKey]);

  const handleToggleSubtopic = (topicIdx: number, subIdx: number) => {
    const key = `${selectedDateKey}-${topicIdx}-${subIdx}`;
    setCompletedSubtopics(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (!selectedDate) return null;

  const safeTopics = Array.isArray(topicsForSelectedDate) ? topicsForSelectedDate : [];

  return (
    <div className="w-full h-full bg-[#09090b] flex flex-col z-50">
      
      <div className="px-6 py-6 flex items-start justify-between shrink-0 border-b border-zinc-800/40">
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Day Details</h2>
          <div className="flex items-center gap-2">
             <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
             <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">
                {moment(selectedDate).format('dddd, MMM D')}
             </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="h-8 w-8 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
        
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-1">
             <div className="flex items-center gap-2 text-zinc-500">
                <h3 className="text-[11px] font-bold uppercase tracking-widest">Study Topics</h3>
             </div>
             <span className="text-[11px] text-zinc-500 font-medium px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800/60">
               {safeTopics.length} Modules
             </span>
          </div>
          
          <div className="space-y-3">
            {safeTopics.map((topic, idx) => {
              // Ensure we use the backend topic ID
              const topicId = String((topic as any).id);
              const isMainCompleted = completedTopicIds.has(topicId);
              
              const validSubtopics = Array.isArray(topic.subtopics) 
                ? topic.subtopics.filter(sub => typeof sub === 'string' && sub.trim() !== '')
                : [];
              
              return (
                <div 
                  key={idx} 
                  className={`flex flex-col p-4 rounded-xl border transition-all duration-300 group/topic ${
                    isMainCompleted 
                      ? 'bg-transparent border-transparent opacity-60' 
                      : 'bg-zinc-900/20 border-zinc-800/40 hover:bg-zinc-900/40'
                  }`}
                >
                  
                  {/* MAIN TOPIC */}
                  <div className="flex items-start space-x-3.5">
                    <Checkbox 
                      checked={isMainCompleted}
                      onCheckedChange={() => onToggleTopic(topicId)}
                      className="mt-1 h-[18px] w-[18px] rounded-[4px] border-zinc-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 transition-all"
                    />
                    
                    <div className="flex flex-col gap-1 cursor-pointer flex-1 min-w-0 select-none" onClick={() => onToggleTopic(topicId)}>
                       {topic.subject && (
                         <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider line-clamp-1">{topic.subject}</span>
                       )}
                       <span className={`text-[15px] leading-snug font-medium transition-colors ${isMainCompleted ? 'text-zinc-500' : 'text-zinc-200 group-hover/topic:text-white'}`}>
                         {topic.topic}
                       </span>
                       <div className="flex items-center gap-2 mt-1 text-zinc-500 text-[10px] font-medium uppercase tracking-wider">
                          <span className="h-1 w-1 rounded-full bg-zinc-600" />
                          <span>Est. {topic.estimated_hours}h</span>
                       </div>
                    </div>
                  </div>

                  {/* SUBTOPICS CHECKLIST + ICONS */}
                  {validSubtopics.length > 0 && (
                    <div className={`mt-4 pt-3 border-t border-zinc-800/50 flex flex-col gap-2 transition-opacity ${isMainCompleted ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                      {validSubtopics.map((sub, i) => {
                        const isSubCompleted = completedSubtopics.has(`${selectedDateKey}-${idx}-${i}`);
                        
                        return (
                          <div key={i} className="flex items-start justify-between gap-3 group/sub py-1">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                               <Checkbox 
                                  checked={isSubCompleted}
                                  onCheckedChange={() => handleToggleSubtopic(idx, i)}
                                  className="mt-0.5 h-3.5 w-3.5 rounded-[3px] border-zinc-700 data-[state=checked]:bg-zinc-600 data-[state=checked]:text-white data-[state=checked]:border-zinc-600 transition-all"
                               />
                               <span 
                                 className={`text-[12.5px] leading-snug cursor-pointer transition-colors mt-px select-none ${
                                   isSubCompleted ? 'text-zinc-600' : 'text-zinc-400 group-hover/sub:text-zinc-300'
                                 }`}
                                 onClick={() => handleToggleSubtopic(idx, i)}
                               >
                                 {sub}
                               </span>
                            </div>

                            {/* RESOURCES ACTION ICONS */}
                            <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover/sub:opacity-100 transition-opacity">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); console.log(`Open Video for: ${sub}`) }}
                                 className="p-1.5 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-md transition-all"
                                 title="Watch Video Lecture"
                               >
                                  <MonitorPlay className="h-[14px] w-[14px]" />
                               </button>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); console.log(`Open Article for: ${sub}`) }}
                                 className="p-1.5 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-md transition-all"
                                 title="Read Study Material"
                               >
                                  <FileText className="h-[14px] w-[14px]" />
                               </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  
                </div>
              )
            })}

            {safeTopics.length === 0 && (
               <div className="py-10 text-center flex flex-col items-center justify-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800/60 flex items-center justify-center mb-1">
                    <span className="block h-1.5 w-1.5 rounded-full bg-zinc-600" />
                  </div>
                  <p className="text-[13px] text-zinc-500 font-medium">No topics scheduled for this date.</p>
               </div>
            )}
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #3f3f46; }
      `}} />
    </div>
  )
}