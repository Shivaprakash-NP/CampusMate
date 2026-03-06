// components/ChatMessage.tsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import type { Message } from "@/shared/types"; // Adjust path if needed

type Props = {
  message: Message;
};

// A dedicated component for Code Blocks to handle the "Copy" state safely
const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";

  const handleCopy = () => {
    try {
      const text = String(children).replace(/\n$/, "");
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // Modern react-markdown passes inline as a prop or it can be inferred from the match
  if (!inline && match) {
    return (
      <div className="my-5 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-sm">
        {/* Sleek IDE-style Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/50 px-4 py-2">
          <span className="text-xs font-medium text-zinc-400 lowercase tracking-wider">{language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-100"
            aria-label="Copy code"
            type="button"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className={isCopied ? "text-emerald-400" : ""}>{isCopied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
        {/* Code Content */}
        <div className="overflow-x-auto p-4 text-[13px] leading-relaxed text-zinc-300">
          <code className={className} {...props}>
            {children}
          </code>
        </div>
      </div>
    );
  }

  // Standard inline code (e.g., `const x = 5;` inside a paragraph)
  return (
    <code 
      className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[13px] text-cyan-400" 
      {...props}
    >
      {children}
    </code>
  );
};

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex w-full ${isUser ? "max-w-[85%] md:max-w-[75%]" : "max-w-full md:max-w-[85%]"}`}>

        {/* Message Bubble */}
        <div
          className={`relative px-5 py-4 text-[15px] leading-relaxed w-full ${
            isUser
              ? "bg-zinc-800 border border-zinc-700/50 text-zinc-100 rounded-2xl rounded-tr-sm shadow-sm"
              : "text-zinc-300 bg-transparent" // AI has no bubble background, seamlessly integrates into chat feed
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            // Apply a base wrapper for markdown to ensure nothing overflows
            <div className="w-full break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeBlock,
                  // Explicitly map markdown tags to Tailwind classes for perfect formatting
                  p: ({ node, ...props }) => <p className="mb-4 last:mb-0 leading-relaxed text-zinc-300" {...props} />,
                  ul: ({ node, ...props }) => <ul className="mb-4 list-disc pl-5 space-y-2 text-zinc-300 marker:text-zinc-500" {...props} />,
                  ol: ({ node, ...props }) => <ol className="mb-4 list-decimal pl-5 space-y-2 text-zinc-300 marker:text-zinc-500" {...props} />,
                  li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                  h1: ({ node, ...props }) => <h1 className="mt-8 mb-4 text-2xl font-semibold tracking-tight text-zinc-100" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="mt-6 mb-3 text-xl font-semibold tracking-tight text-zinc-100" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="mt-5 mb-3 text-lg font-medium tracking-tight text-zinc-200" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-semibold text-zinc-100" {...props} />,
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      className="font-medium text-cyan-400 underline decoration-cyan-400/30 underline-offset-4 transition-colors hover:text-cyan-300 hover:decoration-cyan-400"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {props.children}
                    </a>
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-2 border-cyan-500/50 bg-zinc-900/50 px-4 py-2 my-4 italic text-zinc-400 rounded-r-lg" {...props} />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}