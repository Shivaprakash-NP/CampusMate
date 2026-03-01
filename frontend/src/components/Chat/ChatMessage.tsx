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
        <div className="my-4 overflow-hidden rounded-lg border border-white/10 bg-[#0b1220]">
          <div className="flex items-center justify-between bg-white/5 px-4 py-1.5">
            <span className="text-xs font-medium text-white/50 lowercase">{language}</span>
            <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-md p-1.5 text-xs text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Copy code"
                type="button"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{isCopied ? "Copied!" : "Copy code"}</span>
            </button>
          </div>
          <div className="overflow-x-auto p-4 text-[13px] leading-relaxed">
            <code className={className} {...props}>
              {children}
            </code>
          </div>
        </div>
    );
  }

  // Standard inline code (e.g., `const x = 5;` inside a paragraph)
  return (
      <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-[#38bdf8]" {...props}>
        {children}
      </code>
  );
};

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
      <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
        <div className="flex max-w-[85%] gap-3 md:gap-4 md:max-w-[75%]">

          {/* Message Bubble */}
          <div
              className={`relative rounded-2xl px-5 py-4 text-[15px] leading-relaxed w-full ${
                  isUser
                      ? "bg-[#2f2f2f] text-white rounded-br-sm shadow-md"
                      : "text-white/90 bg-transparent" // AI has no bubble background
              }`}
          >
            {isUser ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
                // Apply a base wrapper for markdown to ensure nothing overflows
                <div className="w-full space-y-4">
                  <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: CodeBlock,
                        // Explicitly map markdown tags to Tailwind classes for perfect formatting
                        p: ({ node, ...props }) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
                        ul: ({ node, ...props }) => <ul className="mb-4 list-disc pl-5 space-y-1.5" {...props} />,
                        ol: ({ node, ...props }) => <ol className="mb-4 list-decimal pl-5 space-y-1.5" {...props} />,
                        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                        h1: ({ node, ...props }) => <h1 className="mt-6 mb-4 text-2xl font-bold text-white" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="mt-5 mb-3 text-xl font-bold text-white" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="mt-4 mb-3 text-lg font-bold text-white" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                        a: ({ node, ...props }) => (
                            <a
                                {...props}
                                className="text-[#38bdf8] underline transition-colors hover:text-white"
                                target="_blank"
                                rel="noreferrer"
                            >
                              {props.children}
                            </a>
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