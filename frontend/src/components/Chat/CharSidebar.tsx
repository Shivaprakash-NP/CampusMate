// components/ChatSidebar.tsx
import React from "react";
import { Plus, Search, FolderOpen, Menu } from "lucide-react";
import type { SyllabusContext } from "@/shared/types";

type Props = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  isFullScreen: boolean;
  subjects: SyllabusContext[];
  activeSubject: SyllabusContext | null;
  onSelectSubject: (subject: SyllabusContext) => void;
  onNewChat: () => void;
};

export default function ChatSidebar({ 
  isSidebarOpen, setIsSidebarOpen, isFullScreen, 
  subjects, activeSubject, onSelectSubject, onNewChat 
}: Props) {

  return (
    <div className={`
      relative flex h-full shrink-0 flex-col bg-zinc-950/50 overflow-hidden
      transition-all duration-500 ease-in-out origin-left z-20
      ${isFullScreen 
        ? "w-0 opacity-0 border-transparent" 
        : isSidebarOpen 
          ? "w-[260px] opacity-100 border-r border-zinc-800/60" 
          : "w-[68px] opacity-100 border-r border-zinc-800/60"
      }
    `}>
      {/* MAGIC TRICK: Inner Canvas locked to 260px. 
        Keeps everything firmly anchored left so icons never jump.
      */}
      <div className="flex flex-col h-full w-[260px]">
        
        {/* Top Row: Hamburger & Search */}
        <div className="flex items-center justify-between h-14 px-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-zinc-400 transition-all duration-200 hover:text-zinc-100 p-2 rounded-lg hover:bg-zinc-800/60 shrink-0"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <button 
            className={`text-zinc-400 transition-all duration-200 hover:text-zinc-100 p-2 rounded-lg hover:bg-zinc-800/60 shrink-0 ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom Row: New Chat Button */}
        <div className="px-3 mt-2">
          {/* Changed width handling: Animates max-width to tightly wrap just the icon when closed */}
          <button 
            onClick={onNewChat} 
            title={!isSidebarOpen ? "New chat" : undefined}
            className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm rounded-lg font-medium transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap
            text-cyan-400
              ${isSidebarOpen ? "max-w-[260px]" : "max-w-[44px]"}
            `}
          >
            <Plus className="h-5 w-5 shrink-0" />
            <span className={`transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}>
              New chat
            </span>
          </button>
        </div>

        {/* Syllabus Contexts */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-6">
          <div className={`mb-3 px-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}>
            Syllabus Contexts
          </div>
          
          <div className="flex flex-col gap-1.5">
            {subjects.map((subject) => {
              const isActive = activeSubject?.id === subject.id;
              return (
                <button
                  key={subject.id}
                  onClick={() => onSelectSubject(subject)}
                  title={!isSidebarOpen ? subject.title : undefined}
                  className={`group flex w-full items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap border
                    ${isSidebarOpen ? "max-w-[260px]" : "max-w-[44px]"}
                    ${isActive 
                      ? "bg-zinc-800/80 text-zinc-100 font-medium border-zinc-700/50 shadow-sm" 
                      : "text-zinc-400 border-transparent hover:bg-zinc-800/40 hover:text-zinc-200"
                    }
                  `}
                >
                  <FolderOpen className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-cyan-400" : "text-zinc-500 group-hover:text-zinc-400"}`} />
                  <span className={`truncate text-left transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}>
                    {subject.title}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}