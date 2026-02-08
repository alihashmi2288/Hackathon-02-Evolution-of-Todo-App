"use client";

import React, { useEffect, useRef } from "react";
import { Bot, Send, Loader2, X, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useChatWidget } from "@/hooks/useChatWidget";

export function ChatWidgetWindow() {
  const { messages, isLoading, input, setInput, setIsOpen, sendMessage } =
    useChatWidget();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setIsOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[min(500px,calc(100vh-8rem))] bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-indigo-600/20 to-purple-600/20">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-semibold text-white">AI Assistant</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/50 hover:text-white transition-colors cursor-pointer"
          aria-label="Close chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-white/40 mt-8">
            <Bot className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">How can I help you today?</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={clsx(
              "flex gap-2 max-w-[90%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div
              className={clsx(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                msg.role === "user"
                  ? "bg-indigo-500 text-white"
                  : "bg-white/10 text-indigo-300"
              )}
            >
              {msg.role === "user" ? (
                <UserIcon size={12} />
              ) : (
                <Bot size={12} />
              )}
            </div>
            <div
              className={clsx(
                "px-3 py-2 rounded-2xl text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-sm"
                  : "bg-white/10 text-white/90 rounded-tl-sm"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 mr-auto max-w-[90%]">
            <div className="w-6 h-6 rounded-full bg-white/10 text-indigo-300 flex items-center justify-center flex-shrink-0">
              <Bot size={12} />
            </div>
            <div className="bg-white/10 px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-indigo-300" />
              <span className="text-white/50 text-sm">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
