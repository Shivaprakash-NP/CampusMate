import React, { useState, useEffect, useRef } from "react";
import {
  Plus, Search, FolderOpen, Mic, AudioLines, Share, Menu,
  Copy, ThumbsUp, ThumbsDown, RotateCcw, MoreHorizontal, Loader2
} from "lucide-react";
import ReactMarkdown from "react-markdown";

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
        const res = await fetch("/api/syllabus", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
          if (data.length > 0) {
            setActiveSubject({ id: data[0].id, title: data[0].title });
            // Set an initial greeting based on their first syllabus
            setMessages([{
              id: "welcome",
              role: "ai",
              content: `Hey 👋\n\nI see you are studying **${data[0].title}**. What would you like to focus on today?`
            }]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      }
    };
    fetchSyllabuses();
  }, []);

  // 2. The Bulletproof Streaming Handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue(""); // Clear input immediately

    // Add user message to UI
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: userText };

    // Create a placeholder for the AI message that we will update piece-by-piece
    const aiMsgId = (Date.now() + 1).toString();
    const emptyAiMsg: Message = { id: aiMsgId, role: "ai", content: "" };

    // Put both the user message and the empty AI message into the chat window
    setMessages((prev) => [...prev, newUserMsg, emptyAiMsg]);
    setIsLoading(true);

    try {
      const payload = {
        message: userText,
        syllabusId: activeSubject?.id
      };

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include", // Essential for sending the JWT cookie!
      });

      if (!response.ok) {
        throw new Error("Failed to connect to CampusMate");
      }

      if (!response.body) throw new Error("No response body");

      // Set up the stream reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullAiText = "";

      try {
        // Read the stream continuously until it's done
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log("Stream finished gracefully.");
            break;
          }

          // Decode the raw byte chunk into text
          const chunk = decoder.decode(value, { stream: true });

          // Safely strip the SSE wrapper while PRESERVING newlines for Markdown
          const cleanChunk = chunk
              .replace(/^data:\s?/gm, '')
              .replace(/\n\n$/gm, '');

          fullAiText += cleanChunk;

          // Update ONLY the AI placeholder message with the newly appended text
          setMessages((prev) =>
              prev.map((msg) =>
                  msg.id === aiMsgId ? { ...msg, content: fullAiText } : msg
              )
          );
        }
      } catch (streamError) {
        // TOMCAT DISCONNECT CATCH
        console.warn("Stream closed abruptly, but text was received:", streamError);
        if (!fullAiText.trim()) {
          throw streamError;
        }
      }

    } catch (error: any) {
      console.error("DETAILED ERROR:", error);
      setMessages((prev) =>
          prev.map((msg) =>
              msg.id === aiMsgId ? { ...msg, content: `⚠️ Error: ${error.message || "CampusMate is having trouble thinking right now."}` } : msg
          )
      );
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
                onClick={() => setMessages([])}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <Plus className="h-4 w-4" />
                New chat
              </div>
              <Search className="h-4 w-4 text-white/50" />
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
        </div>

        {/* MOBILE SIDEBAR OVERLAY */}
        {isSidebarOpen && (
            <div className="fixed inset-0 z-20 bg-black/60 md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* MAIN CHAT AREA */}
        <div className="flex min-w-0 flex-1 flex-col relative">

          {/* Chat Header */}
          <div className="flex shrink-0 items-center justify-between px-4 py-3 md:px-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <button className="md:hidden rounded-md p-1.5 text-white/70 hover:bg-white/10" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-lg font-medium text-white/90 hover:bg-white/5 transition-colors">
                CampusMate AI
              </button>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <button
                  className="hidden md:flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                  title="Share chat"
              >
                <Share className="h-4 w-4" />
              </button>
              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#38bdf8] to-[#818cf8] text-sm font-medium text-white shadow-md transition-transform hover:scale-105">
                SP
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto px-4 pb-48 pt-8">
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

                          {/* MARKDOWN RENDERER WITH CUSTOM TAILWIND STYLES */}
                          <div className="space-y-4">
                            <ReactMarkdown
                                components={{
                                  p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
                                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2" {...props} />,
                                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 mt-6 text-white" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-5 text-white" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-3 mt-4 text-white" {...props} />,
                                  strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                                  code: ({node, inline, ...props}: any) =>
                                      inline
                                          ? <code className="bg-white/10 rounded px-1.5 py-0.5 text-sm font-mono text-[#38bdf8]" {...props} />
                                          : <code className="block bg-[#1e1e1e] rounded-lg p-4 text-sm overflow-x-auto my-4 font-mono text-white/90 border border-white/10" {...props} />,
                                }}
                            >
                              {msg.content}
                            </ReactMarkdown>
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
                        handleSendMessage();
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