// components/MessageFeed.tsx
import React, { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import ChatMessage from "./ChatMessage";
import type { Message } from "@/shared/types";

type Props = {
  messages: Message[];
  isLoading: boolean;
  isInitializing: boolean; // Added prop
};

export default function MessageFeed({ messages, isLoading, isInitializing }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-40 pt-8 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        
        {/* Only show the empty state if we are NOT initializing and have NO messages */}
        {!isInitializing && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center pt-32 pb-12 animate-in fade-in duration-500">
            {/* Added a subtle icon to make the empty state feel premium */}
           
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
              How can I help you today?
            </h1>
            <p className="text-sm text-zinc-500 mt-2 text-center max-w-sm">
              Ask a general question, or select a syllabus from the sidebar to focus your study session.
            </p>
          </div>
        )}

        {/* Removed redundant mapping wrapper */}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        
        {isLoading && (
          <div className="flex w-full justify-start animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 px-5 py-4 text-[13px] font-medium text-cyan-400 tracking-wide">
              <Loader2 className="h-4 w-4 animate-spin" />
              CampusMate is thinking...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-px w-full" />
      </div>
    </div>
  );
}