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
  
  // Hide entirely only if in full screen mode
  if (isFullScreen) return null;

  return (
    <div className={`
      relative flex h-full shrink-0 flex-col bg-[#0b1220] transition-all duration-300 ease-in-out border-r border-white/5 overflow-hidden
      ${isSidebarOpen ? "w-[260px]" : "w-[68px]"}
    `}>
      <div className="flex flex-col h-full min-w-[68px]">
        
        {/* Top Row: Hamburger & Search */}
        <div className={`flex items-center h-14 px-3 ${isSidebarOpen ? "justify-between" : "justify-center"}`}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white/50 transition-colors hover:text-white/90 p-2 rounded-lg hover:bg-white/5 shrink-0"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {isSidebarOpen && (
            <button 
              className="text-white/50 transition-colors hover:text-white/90 p-2 rounded-lg hover:bg-white/5 shrink-0"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Bottom Row: New Chat Button */}
        <div className="px-3 mt-2">
          <button 
            onClick={onNewChat} 
            title={!isSidebarOpen ? "New chat" : undefined}
            className={`flex w-full items-center rounded-lg text-white/90 transition-colors hover:bg-white/5
              ${isSidebarOpen ? "gap-3 px-3 py-2 text-sm" : "justify-center py-2"}
            `}
          >
            <Plus className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="whitespace-nowrap">New chat</span>}
          </button>
        </div>

        {/* Syllabus Contexts */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 mt-2">
          {isSidebarOpen && (
            <div className="mb-3 px-2 text-xs font-semibold text-white/40 whitespace-nowrap">
              Syllabus Contexts
            </div>
          )}
          
          <div className="flex flex-col gap-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => onSelectSubject(subject)}
                title={!isSidebarOpen ? subject.title : undefined}
                className={`flex items-center rounded-lg transition-colors w-full
                  ${isSidebarOpen ? "gap-3 px-3 py-2 text-sm" : "justify-center py-2"}
                  ${activeSubject?.id === subject.id 
                    ? "bg-white/10 text-white font-medium" 
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <FolderOpen className="h-5 w-5 shrink-0" />
                {isSidebarOpen && (
                  <span className="truncate text-left">{subject.title}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}