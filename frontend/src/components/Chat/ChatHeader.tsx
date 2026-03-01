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
    <div className="flex shrink-0 items-center justify-between px-4 py-3 md:px-6 border-b border-white/10 transition-all duration-500">
      <div className="flex items-center gap-3">
        <button className="md:hidden rounded-md p-1.5 text-white/70 hover:bg-white/10" onClick={() => setIsSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-lg font-medium text-white/90 hover:bg-white/5 transition-colors cursor-default">
          CampusMate AI 
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-4">
        <button className="hidden md:flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors" title="Share chat">
          <Share className="h-4 w-4" />
        </button>
        <button 
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="hidden md:flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
        >
          {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}