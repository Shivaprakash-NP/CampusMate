// components/ChatHeader.tsx
import React from "react";
import { Menu, Share, Minimize, Maximize } from "lucide-react";

type Props = {
  setIsSidebarOpen: (val: boolean) => void;
  isFullScreen: boolean;
  setIsFullScreen: (val: boolean) => void;
};

export default function ChatHeader({ setIsSidebarOpen, isFullScreen, setIsFullScreen }: Props) {
  return (
    <div className="flex shrink-0 items-center justify-between px-4 py-3 md:px-6 border-b border-zinc-800/60 bg-zinc-950/30 backdrop-blur-md transition-all duration-500 z-10">
      
      {/* Left side: Mobile Menu Toggle & Brand */}
      <div className="flex items-center gap-2 md:gap-3">
        <button 
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 transition-colors" 
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-2.5 px-1 py-1.5 cursor-default">
          {/* Cyan AI Indicator */}
          <span className="flex h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
          <span className="text-sm md:text-base font-semibold tracking-tight text-zinc-100">
            CampusMate AI
          </span>
        </div>
      </div>
      
      {/* Right side: Action Tools */}
      <div className="flex items-center gap-2 md:gap-3">
        
        
        {/* Fullscreen Toggle */}
        <button 
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 transition-all duration-200"
          title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
        >
          {isFullScreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}