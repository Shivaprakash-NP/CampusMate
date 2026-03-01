// components/ChatInput.tsx
import React, { useState } from "react";
import { Plus, Mic, Send } from "lucide-react";

type Props = {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isFullScreen: boolean;
};

export default function ChatInput({ onSendMessage, isLoading, isFullScreen }: Props) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

 return (
    <div className={`absolute bottom-0 w-full bg-gradient-to-t from-[#0b1220] via-[#0b1220] to-transparent pb-6 pt-10 px-4 transition-all duration-500 ${
      isFullScreen ? 'rounded-none' : 'rounded-b-xl'
    }`}>
      {/* 1. Changed max-w-3xl to max-w-2xl for a narrower box */}
      <div className="mx-auto w-full max-w-3xl"> 
        
        {/* 2. Reduced padding from px-3 py-3 to px-2 py-2 for a slimmer profile */}
        <form onSubmit={handleSubmit} className="flex w-full items-end gap-2 rounded-3xl bg-[#2f2f2f] px-2 py-2 shadow-lg focus-within:ring-1 focus-within:ring-white/20 transition-all">
          
          <button type="button" className="shrink-0 rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
            <Plus className="h-5 w-5" />
          </button>
          
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isLoading ? "Please wait..." : "Ask anything"}
            disabled={isLoading}
            className="max-h-32 min-h-[20px] w-full resize-none self-center bg-transparent px-2 text-[14px] text-white placeholder-white/50 focus:outline-none disabled:opacity-50"
            rows={1}
            onKeyDown={handleKeyDown}
          />
          
          <div className="flex shrink-0 items-center gap-1">
            <button type="button" className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
              <Mic className="h-5 w-5" />
            </button>
            <button 
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 disabled:bg-white/20 disabled:text-white/50 disabled:hover:scale-100"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
        
        <div className="mt-3 text-center text-xs text-white/40">
          CampusMate AI can make mistakes. Check important info.
        </div>
      </div>
    </div>
  )
}