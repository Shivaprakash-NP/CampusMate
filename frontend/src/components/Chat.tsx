import React, { useState } from "react";
import { 
  Send, 
  Paperclip, 
  Plus, 
  Menu,
  FileText,
  User,
  MoreVertical
} from "lucide-react";
import Navbar from "../components/Navbar";

// Mock data
const CONTEXTS = [
  { id: "1", title: "IP Syllabus.pdf", active: true },
  { id: "2", title: "Operating Systems", active: false },
  { id: "3", title: "Data Structures", active: false },
];

const MOCK_MESSAGES = [
  {
    id: "m1",
    role: "ai",
    content: "Hi there! I have analyzed the **IP Syllabus.pdf**. What would you like to know about HTML & CSS, TypeScript, or Servlet Programming?",
  },
  {
    id: "m2",
    role: "user",
    content: "Can you summarize the HTML5 topics I need to study?",
  },
  {
    id: "m3",
    role: "ai",
    content: "Certainly! Based on your syllabus, here are the key HTML5 topics you need to cover:\n\n• **HTTP Protocol**: Understanding Request and Response Messages.\n• **HTML5 Basics**: Working with Tables, Lists, Images, and Forms.\n• **Tailwind CSS**: Layouts, Typography, and Animation integration.\n\nWould you like me to generate a quick practice quiz on these?",
  }
];

export default function Chat() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = { id: Date.now().toString(), role: "user", content: inputValue };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + 1,
          role: "ai",
          content: "This is a simulated response. In production, this will be connected to your AI backend!",
        },
      ]);
    }, 1000);
  };

  return (
    // FIX 1: Strict h-screen with flex-col to eliminate the black space at the bottom
    <div className="flex h-screen flex-col bg-[#0b1a22] p-2 md:p-4 font-sans overflow-hidden">
      
      {/* Wrapper to match Dashboard width */}
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-3 md:gap-4">
        
        {/* FIX 2: Added your Navbar component exactly like the Dashboard */}
        <div className="shrink-0 rounded-xl border border-white/10 bg-[#0b1220]">
          <Navbar />
        </div>

        {/* Chat Layout Container - takes remaining height */}
        <div className="flex min-h-0 flex-1 gap-3 md:gap-4 relative">
          
          {/* LEFT SIDEBAR - Desktop (Hidden on Mobile unless toggled) */}
          <div 
            className={`${
              isSidebarOpen ? "absolute z-20 flex h-full w-64 shadow-2xl" : "hidden"
            } md:relative md:flex md:w-64 md:shadow-none shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0b1220] transition-all`}
          >
            <div className="flex flex-col gap-4 p-4">
              <button className="flex w-full items-center gap-2 rounded-lg bg-[#38bdf8]/10 px-4 py-2.5 text-sm font-medium text-[#38bdf8] transition-colors hover:bg-[#38bdf8]/20">
                <Plus className="h-4 w-4" />
                New Chat
              </button>
            </div>

            <div className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
              Syllabus Contexts
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-4">
              {CONTEXTS.map((ctx) => (
                <button
                  key={ctx.id}
                  className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    ctx.active
                      ? "bg-white/10 text-[#38bdf8]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <FileText className={`h-4 w-4 shrink-0 ${ctx.active ? "text-[#38bdf8]" : "text-white/40"}`} />
                  <span className="truncate">{ctx.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* MOBILE SIDEBAR OVERLAY */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 z-10 bg-black/50 md:hidden" 
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* MAIN CHAT AREA */}
          <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-white/10 bg-[#0b1220]">
            
            {/* Chat Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-3">
                <button 
                  className="md:hidden rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    Chatting about: <span className="text-[#38bdf8]">IP Syllabus.pdf</span>
                  </h2>
                </div>
              </div>
              <button className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  // FIX 4: Added items-center so the avatar aligns vertically to the center of the bubble
                  className={`flex w-full gap-3 md:gap-4 items-center ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  
                  {/* FIX 3: Removed the AI Bot Avatar completely */}
                  
                  {/* Message Bubble */}
                  <div 
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm md:text-base leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#14232d] text-white border border-white/5 rounded-tr-sm"
                        : "bg-transparent text-white/90 px-0" // Removed padding for AI text to align flush left
                    }`}
                  >
                    {msg.role === "ai" ? (
                      <div className="space-y-2 whitespace-pre-wrap">
                        {msg.content.split('\n').map((line, i) => {
                          if (line.includes('**')) {
                            const parts = line.split('**');
                            return (
                              <p key={i}>
                                {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part)}
                              </p>
                            );
                          }
                          return <p key={i}>{line}</p>;
                        })}
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>

                  {/* FIX 4: Made user avatar larger (h-10 w-10) and centered via the parent's items-center */}
                  {msg.role === "user" && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/5">
                      <User className="h-5 w-5 text-white/70" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="shrink-0 p-3 md:p-4 border-t border-white/5 bg-[#0b1220]/50">
              <form 
                onSubmit={handleSendMessage}
                className="mx-auto flex w-full max-w-4xl items-end gap-2 rounded-2xl border border-white/10 bg-[#14232d] p-2 focus-within:border-[#38bdf8]/50 transition-colors shadow-lg"
              >
                <button 
                  type="button"
                  className="mb-1 shrink-0 rounded-full p-2 text-white/40 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask anything about your syllabus..."
                  className="max-h-32 min-h-[44px] w-full resize-none bg-transparent py-3 text-sm text-white placeholder-white/40 focus:outline-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                
                <button 
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="mb-1 shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#38bdf8] text-[#0b1220] transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </form>
              <div className="mt-2 text-center text-[10px] text-white/30">
                AI can make mistakes. Verify important information from your actual syllabus.
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}