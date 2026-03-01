// pages/Chat.tsx
import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import ChatSidebar from "./CharSidebar";
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
        const res = await fetch("/api/syllabus", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);

          // 1. Check if we arrived with a specific topic context
          const urlParams = new URLSearchParams(window.location.search);
          const topicId = urlParams.get("topicId");
          const topicTitle = urlParams.get("topicTitle");

          if (topicId && topicTitle) {
            // Provide a highly specific greeting for the topic
            setMessages([{
              id: Date.now().toString(),
              role: "ai",
              content: `Hey Shivaprakash! 👋\n\nI see you want to dive into **${topicTitle}**. What specific questions do you have about this topic?`
            }]);

            // Optional: Find which syllabus contains this topicId and setActiveSubject(foundSyllabus)
          } else if (data.length > 0) {
            // Default behavior if no specific topic was clicked
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
      content: `Hey Shivaprakash! 👋\n\nContext switched to **${subject.title}**. What would you like to focus on today?`
    }]);
  };

  const handleNewChat = () => {
    setActiveSubject(null);
    setMessages([{
      id: Date.now().toString(),
      role: "ai",
      content: "Hey Shivaprakash! 👋\n\nYou've started a new general chat. How can I help you today?"
    }]);
  };

  // --- THE BULLETPROOF STREAMING LOGIC ---
  const handleSendMessage = async (userText: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    const topicId = urlParams.get("topicId");

    // Create unique IDs for both messages
    const userMsgId = Date.now().toString();
    const aiMsgId = (Date.now() + 1).toString();

    // Immediately add the User message AND an empty AI placeholder
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

          // Safely strip the SSE wrapper while PRESERVING newlines for Markdown
          const cleanChunk = chunk
              .replace(/^data:\s?/gm, '')
              .replace(/\n\n$/gm, '');

          fullAiText += cleanChunk;

          if (fullAiText) {
            // The moment we get actual text, turn off the loading spinner!
            if (isFirstChunk) {
              setIsLoading(false);
              isFirstChunk = false;
            }

            // Update ONLY the AI placeholder message with the newly appended text
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === aiMsgId ? { ...msg, content: fullAiText } : msg
                )
            );
          }
        }
      } catch (streamError: any) {
        // TOMCAT DISCONNECT CATCH
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
                onNewChat={handleNewChat}
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