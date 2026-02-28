// components/ChatMessage.tsx
import React from "react";
import { Copy, ThumbsUp, ThumbsDown, RotateCcw, MoreHorizontal } from "lucide-react";
import type { Message } from "@/shared/types";

export default function ChatMessage({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[85%] md:max-w-[70%] rounded-3xl bg-[#2f2f2f] px-5 py-3 text-[15px] text-white">
          {message.content}
        </div>
      </div>
    );
  }

  // AI Message Rendering
  return (
    <div className="flex w-full justify-start">
      <div className="w-full max-w-full text-[15px] leading-relaxed text-white/90 pr-4 animate-in fade-in duration-300">
        <div className="space-y-4 whitespace-pre-wrap">
          {message.content.split('\n').map((line, i) => {
            if (line.includes('**')) {
              const parts = line.split('**');
              return (
                <p key={i}>
                  {parts.map((part, j) => 
                    j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
                  )}
                </p>
              );
            }
            return <p key={i} className="min-h-[1rem]">{line}</p>;
          })}
        </div>
        
        <div className="mt-3 flex items-center gap-3 text-white/40">
          <button className="hover:text-white transition-colors p-1"><Copy className="h-4 w-4" /></button>
          <button className="hover:text-white transition-colors p-1"><ThumbsUp className="h-4 w-4" /></button>
          <button className="hover:text-white transition-colors p-1"><ThumbsDown className="h-4 w-4" /></button>
          <button className="hover:text-white transition-colors p-1"><RotateCcw className="h-4 w-4" /></button>
          <button className="hover:text-white transition-colors p-1"><MoreHorizontal className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}