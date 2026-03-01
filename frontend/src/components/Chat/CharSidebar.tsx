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
      relative flex h-full shrink-0 flex-col bg-[#14232d] overflow-hidden
      transition-all duration-500 ease-in-out origin-left
      ${isFullScreen 
        ? "w-0 opacity-0 border-transparent" 
        : isSidebarOpen 
          ? "w-[260px] opacity-100 border-r border-white/5" 
          : "w-[68px] opacity-100 border-r border-white/5"
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
            className="text-white/50 transition-colors hover:text-white/90 p-2 rounded-lg hover:bg-white/5 shrink-0"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <button 
            className={`text-white/50 transition-colors hover:text-white/90 p-2 rounded-lg hover:bg-white/5 shrink-0 transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
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
            className={`flex w-full items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/90 transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap hover:bg-white/5
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 mt-2">
          <div className={`mb-3 px-2 text-xs font-semibold text-white/40 whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}>
            Syllabus Contexts
          </div>
          
          <div className="flex flex-col gap-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => onSelectSubject(subject)}
                title={!isSidebarOpen ? subject.title : undefined}
                className={`flex w-full items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap
                  ${isSidebarOpen ? "max-w-[260px]" : "max-w-[44px]"}
                  ${activeSubject?.id === subject.id 
                    ? "bg-white/10 text-white font-medium" 
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <FolderOpen className="h-5 w-5 shrink-0" />
                <span className={`truncate text-left transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}>
                  {subject.title}
                </span>
              </button>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}