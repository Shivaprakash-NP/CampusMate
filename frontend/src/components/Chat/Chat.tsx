// pages/Chat.tsx
import React, { useState, useEffect } from "react";
import Navbar from "../Navbar"; 
import ChatSidebar from "./CharSidebar"
import ChatHeader from "./ChatHeader";
import MessageFeed from "./MessageFeed";
import ChatInput from "./ChatInput";
import type { Message, SyllabusContext } from "@/shared/types";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const [subjects, setSubjects] = useState<SyllabusContext[]>([]);
  const [activeSubject, setActiveSubject] = useState<SyllabusContext | null>(null);

  useEffect(() => {
    const fetchSyllabuses = async () => {
      try {
        const res = await fetch("/api/syllabus");
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
          if (data.length > 0) {
            handleSubjectChange(data[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      }
    };
    fetchSyllabuses();
  }, []);

  const handleSubjectChange = (subject: SyllabusContext) => {
    setActiveSubject(subject);
    setMessages([{
      id: Date.now().toString(),
      role: "ai",
      content: `Hey Sarvesh! 👋\n\nContext switched to **${subject.title}**. What would you like to focus on today?`
    }]);
  };

  const handleSendMessage = async (userText: string) => {
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: userText };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, syllabusId: activeSubject?.id })
      });
      const data = await response.json();

      if (response.ok && data.reply) {
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: "ai", content: data.reply }]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error: any) {
      setMessages((prev) => [...prev, { 
        id: Date.now().toString(), role: "ai", 
        content: `⚠️ Error: ${error.message || "CampusMate is having trouble thinking right now."}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#0b1a22] font-sans transition-all duration-500 ease-in-out ${isFullScreen ? 'p-0' : 'p-2 md:p-4'}`}>
      <div className={`mx-auto flex flex-col transition-all duration-500 ease-in-out ${
        isFullScreen ? 'h-screen max-w-none gap-0' : 'h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)] max-w-7xl gap-3 md:gap-4'
      }`}>
        
        <div className={`shrink-0 rounded-xl bg-[#0b1220] transition-all duration-500 ease-in-out overflow-hidden origin-top ${
          isFullScreen ? 'max-h-0 opacity-0 border-transparent m-0' : 'max-h-[100px] opacity-100 border border-white/10'
        }`}>
          <Navbar />
        </div>

        <div className={`flex min-h-0 flex-1 overflow-hidden border border-white/10 bg-[#0b1220] shadow-2xl relative transition-all duration-500 ${
          isFullScreen ? 'rounded-none border-transparent' : 'rounded-xl'
        }`}>
          
          <ChatSidebar 
            isSidebarOpen={isSidebarOpen} 
            setIsSidebarOpen={setIsSidebarOpen} 
            isFullScreen={isFullScreen}
            subjects={subjects}
            activeSubject={activeSubject}
            onSelectSubject={handleSubjectChange}
            onNewChat={() => setMessages([])}
          />

          <div className="flex min-w-0 flex-1 flex-col relative bg-[#0b1220]">
            <ChatHeader 
              setIsSidebarOpen={setIsSidebarOpen} 
              isFullScreen={isFullScreen} 
              setIsFullScreen={setIsFullScreen} 
            />
            
            <MessageFeed messages={messages} isLoading={isLoading} />
            
            <ChatInput 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
              isFullScreen={isFullScreen} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}