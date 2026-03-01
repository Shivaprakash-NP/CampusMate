// components/ChatMessage.tsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Bot, User } from "lucide-react";
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
      // eslint-disable-next-line no-console
      console.error("Copy failed:", err);
    }
  };

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

  // Standard inline code
  return (
    <code className="rounded bg-white/10 px-1.5 py-0.5 text-[#38bdf8]" {...props}>
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
          className={`relative rounded-2xl px-5 py-4 text-[15px] leading-relaxed ${
            isUser
              ? "bg-[#2f2f2f] text-white rounded-br-sm shadow-md"
              : "text-white/90 bg-transparent" // AI has no bubble background, looks cleaner
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-white prose-strong:text-white prose-li:marker:text-[#38bdf8]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeBlock, // Maps markdown code blocks to our custom component above
                  // You can customize other markdown elements here if needed!
                  a: ({ node, ...props }: any) => (
                    <a
                      {...props}
                      className="text-[#38bdf8] underline hover:text-white transition-colors"
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