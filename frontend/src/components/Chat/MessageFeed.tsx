// components/MessageFeed.tsx
import React, { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import ChatMessage from "./ChatMessage";
import type { Message } from "@/shared/types"

type Props = {
  messages: Message[];
  isLoading: boolean;
};

export default function MessageFeed({ messages, isLoading }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-48 pt-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center pt-32">
            <h1 className="text-3xl font-semibold text-white">What are you working on?</h1>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        
        {isLoading && (
          <div className="flex w-full justify-start animate-in fade-in">
            <div className="flex items-center gap-2 text-sm text-[#38bdf8]">
              <Loader2 className="h-4 w-4 animate-spin" />
              CampusMate is thinking...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}