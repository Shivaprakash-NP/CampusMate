import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Search, Image as ImageIcon, Grid, Terminal, 
  FolderOpen, Mic, AudioLines, Share, Menu, ChevronDown,
  Copy, ThumbsUp, ThumbsDown, RotateCcw, MoreHorizontal, Loader2
} from "lucide-react";
import Navbar from "../components/Navbar";

// Define our types
type Message = { id: string; role: "user" | "ai"; content: string };
type SyllabusContext = { id: number; title: string };

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Store the real syllabuses from your database
  const [subjects, setSubjects] = useState<SyllabusContext[]>([]);
  const [activeSubject, setActiveSubject] = useState<SyllabusContext | null>(null);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  // 1. Fetch the real syllabus list on mount to populate the sidebar
  useEffect(() => {
    const fetchSyllabuses = async () => {
      try {
        const res = await fetch("/api/syllabus");
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
          if (data.length > 0) {
            setActiveSubject({ id: data[0].id, title: data[0].title });
            // Set an initial greeting based on their first syllabus
            setMessages([{
              id: "welcome",
              role: "ai",
              content: `Hey Sarvesh! 👋\n\nI see you are studying **${data[0].title}**. What would you like to focus on today?`
            }]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      }
    };
    fetchSyllabuses();
  }, []);

  // 2. Handle sending the message to your Spring Boot Backend
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue(""); // Clear input immediately
    
    // Add user message to UI
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: userText };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // Prepare the ChatDto payload
      const payload = {
        message: userText,
        syllabusId: activeSubject?.id // Passes the context to your backend!
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        setMessages((prev) => [
          ...prev, 
          { id: Date.now().toString(), role: "ai", content: data.reply }
        ]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat API Error:", error);
      setMessages((prev) => [
        ...prev, 
        { id: Date.now().toString(), role: "ai", content: "⚠️ CampusMate is having trouble thinking right now. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0b1a22] text-white font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <div 
        className={`${
          isSidebarOpen ? "absolute z-30 flex" : "hidden"
        } md:relative md:flex h-full w-[260px] shrink-0 flex-col bg-[#0b1220] transition-all duration-300 border-r border-white/5`}
      >
        <div className="flex flex-col gap-1 p-3">
          <button 
            onClick={() => setMessages([])} // Clear chat on new chat
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <Plus className="h-4 w-4" />
              New chat
            </div>
            <Search className="h-4 w-4 text-white/50" />
          </button>
          
          <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5">
            <ImageIcon className="h-4 w-4" /> Images
          </button>
          <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5">
            <Terminal className="h-4 w-4" /> Codex
          </button>
        </div>

        {/* Dynamic Subjects List from Backend */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="mb-2 px-3 text-xs font-semibold text-white/40">
            Syllabus Contexts
          </div>
          <div className="flex flex-col gap-0.5">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => {
                  setActiveSubject(subject);
                  setMessages([{
                    id: Date.now().toString(),
                    role: "ai",
                    content: `Context switched to **${subject.title}**. Ask me anything about it!`
                  }]);
                }}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeSubject?.id === subject.id 
                    ? "bg-white/10 text-white font-medium" 
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FolderOpen className="h-4 w-4 shrink-0" />
                <span className="truncate text-left">{subject.title}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="flex items-center gap-3 p-3 text-sm transition-colors hover:bg-white/5 mx-2 mb-2 rounded-lg">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-medium">
            SP
          </div>
          <div className="flex flex-col items-start truncate text-white/90">
            <span className="truncate font-medium">Sarvesh Ponnusamy</span>
            <span className="text-[10px] text-white/50">Go</span>
          </div>
        </button>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* MAIN CHAT AREA */}
      <div className="flex min-w-0 flex-1 flex-col relative">
        <div className="w-full shrink-0"><Navbar /></div>

        <div className="flex shrink-0 items-center justify-between px-4 py-3 md:px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button className="md:hidden rounded-md p-1.5 text-white/70 hover:bg-white/10" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-lg font-medium text-white/90 hover:bg-white/5 transition-colors">
              CampusMate AI <ChevronDown className="h-4 w-4 text-white/50" />
            </button>
          </div>
          <button className="hidden md:flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm font-medium text-white/70 hover:bg-white/5 transition-colors">
            <Share className="h-4 w-4" /> Share
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto px-4 pb-48 pt-4">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center pt-32">
                <h1 className="text-3xl font-semibold text-white">What are you working on?</h1>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "user" ? (
                  <div className="max-w-[85%] md:max-w-[70%] rounded-3xl bg-[#2f2f2f] px-5 py-3 text-[15px] text-white">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full max-w-full text-[15px] leading-relaxed text-white/90 pr-4 animate-in fade-in duration-300">
                    <div className="space-y-4 whitespace-pre-wrap">
                      {msg.content.split('\n').map((line, i) => {
                        if (line.includes('**')) {
                          const parts = line.split('**');
                          return (
                            <p key={i}>
                              {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part)}
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
                )}
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex w-full justify-start animate-in fade-in">
                <div className="flex items-center gap-2 text-sm text-[#38bdf8]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  CampusMate is thinking...
                </div>
              </div>
            )}
            
            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#0b1a22] via-[#0b1a22] to-transparent pb-6 pt-10 px-4">
          <div className="mx-auto w-full max-w-3xl">
            <form onSubmit={handleSendMessage} className="flex w-full items-end gap-2 rounded-3xl bg-[#2f2f2f] px-3 py-3 shadow-lg focus-within:ring-1 focus-within:ring-white/20 transition-all">
              <button type="button" className="shrink-0 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                <Plus className="h-5 w-5" />
              </button>
              
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isLoading ? "Please wait..." : "Ask anything"}
                disabled={isLoading}
                className="max-h-48 min-h-[24px] w-full resize-none self-center bg-transparent px-2 text-[15px] text-white placeholder-white/50 focus:outline-none disabled:opacity-50"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                  <Mic className="h-5 w-5" />
                </button>
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 disabled:bg-white/20 disabled:text-white/50 disabled:hover:scale-100"
                >
                  <AudioLines className="h-4 w-4" />
                </button>
              </div>
            </form>
            <div className="mt-3 text-center text-xs text-white/40">
              CampusMate AI can make mistakes. Check important info.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}