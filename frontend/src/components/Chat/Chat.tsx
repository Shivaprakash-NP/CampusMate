// pages/Chat.tsx
import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import ChatSidebar from "./CharSidebar"; // Fixed typo in your import
import ChatHeader from "./ChatHeader";
import MessageFeed from "./MessageFeed";
import ChatInput from "./ChatInput";
import type { Message, SyllabusContext } from "@/shared/types";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // ADDED: Track initial load to prevent empty state flash
  const [isInitializing, setIsInitializing] = useState(true); 

  const [subjects, setSubjects] = useState<SyllabusContext[]>([]);
  const [activeSubject, setActiveSubject] = useState<SyllabusContext | null>(null);

  useEffect(() => {
    const fetchSyllabuses = async () => {
      try {
        const res = await fetch("/api/syllabus", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);

          const urlParams = new URLSearchParams(window.location.search);
          const topicId = urlParams.get("topicId");
          const topicTitle = urlParams.get("topicTitle");

          if (topicId && topicTitle) {
            setMessages([{
              id: Date.now().toString(),
              role: "ai",
              content: `Hey Sarvesh! 👋\n\nI see you want to dive into **${topicTitle}**. What specific questions do you have about this topic?`
            }]);
          } else if (data.length > 0) {
            // Re-using the handler logic here to ensure consistency
            setActiveSubject(data[0]);
            setMessages([{
              id: Date.now().toString(),
              role: "ai",
              content: `Hey Sarvesh! 👋\n\nContext switched to **${data[0].title}**. What would you like to focus on today?`
            }]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      } finally {
        // ADDED: Turn off initializing flag once API is done
        setIsInitializing(false);
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

  const handleNewChat = () => {
    setActiveSubject(null);
    setMessages([]); // Cleared this out so "What are you working on?" shows naturally in the feed
  };

  // --- STREAMING LOGIC UNTOUCHED ---
  const handleSendMessage = async (userText: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    const topicId = urlParams.get("topicId");

    const userMsgId = Date.now().toString();
    const aiMsgId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: userText },
      { id: aiMsgId, role: "ai", content: "" }
    ]);

    setIsLoading(true);

    try {
      const payload = {
        message: userText,
        syllabusId: activeSubject?.id,
        topicId: topicId
      };

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!response.ok) throw new Error("Failed to connect to CampusMate");
      if (!response.body) throw new Error("No readable stream available");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let fullAiText = "";
      let isFirstChunk = true;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          const cleanChunk = chunk
              .replace(/^data:\s?/gm, '')
              .replace(/\n\n$/gm, '');

          fullAiText += cleanChunk;

          if (fullAiText) {
            if (isFirstChunk) {
              setIsLoading(false);
              isFirstChunk = false;
            }

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === aiMsgId ? { ...msg, content: fullAiText } : msg
                )
            );
          }
        }
      } catch (streamError: any) {
        if (fullAiText.trim().length > 0) {
          console.log("Stream completed gracefully.");
        } else {
          throw streamError;
        }
      }
    } catch (error: any) {
      console.error("DETAILED ERROR:", error);
      setMessages((prev) =>
          prev.map((msg) =>
              msg.id === aiMsgId
                  ? { ...msg, content: `⚠️ Error: ${error.message || "CampusMate is having trouble thinking right now."}` }
                  : msg
          )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="h-screen flex flex-col bg-zinc-950 font-sans text-zinc-100 selection:bg-purple-500/30 overflow-hidden">
        
        <div className={`shrink-0 w-full z-40 transition-all duration-500 ease-in-out origin-top ${
            isFullScreen ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[100px] opacity-100'
        }`}>
          <Navbar />
        </div>

        <div className={`flex-1 flex flex-col min-h-0 transition-all duration-500 ease-in-out ${isFullScreen ? 'p-0' : 'p-2 md:p-4 md:pb-6'}`}>
          <div className={`mx-auto w-full flex-1 flex flex-col min-h-0 transition-all duration-500 ease-in-out ${
              isFullScreen ? 'max-w-none gap-0' : 'max-w-5xl'
          }`}>

            <div className={`flex min-h-0 flex-1 overflow-hidden border bg-zinc-900/30 backdrop-blur-sm shadow-2xl relative transition-all duration-500 ease-in-out ${
                isFullScreen ? 'rounded-none border-transparent' : 'rounded-2xl border-zinc-800/60'
            }`}>

              <ChatSidebar
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  isFullScreen={isFullScreen}
                  subjects={subjects}
                  activeSubject={activeSubject}
                  onSelectSubject={handleSubjectChange}
                  onNewChat={handleNewChat}
              />

              <div className="flex min-w-0 flex-1 flex-col relative bg-transparent">
                <ChatHeader
                    setIsSidebarOpen={setIsSidebarOpen}
                    isFullScreen={isFullScreen}
                    setIsFullScreen={setIsFullScreen}
                />

                <MessageFeed 
                  messages={messages} 
                  isLoading={isLoading} 
                  isInitializing={isInitializing} // Pass it down
                />

                <ChatInput
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    isFullScreen={isFullScreen}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}