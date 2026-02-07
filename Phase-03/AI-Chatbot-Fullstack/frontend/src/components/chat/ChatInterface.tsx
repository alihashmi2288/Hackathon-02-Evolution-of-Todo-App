"use client";

/**
 * Chat interface component for the AI Todo Chatbot.
 *
 * Task Reference: T024, T025, T026 (007-ai-todo-chatbot)
 * Feature: 007-ai-todo-chatbot
 */

import React, { useState, useEffect, useRef } from "react";
import { Send, User as UserIcon, Bot, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, ApiClientError } from "@/services/api";
import clsx from "clsx";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Load conversation history on mount
    useEffect(() => {
        async function loadHistory() {
            try {
                const history = await api.chat.getHistory();
                if (history.messages.length > 0) {
                    setMessages(
                        history.messages.map((m) => ({
                            role: m.role as "user" | "assistant",
                            content: m.content,
                        }))
                    );
                }
                setConversationId(history.conversation_id);
            } catch (error) {
                // If 401, the api client handles redirect. Otherwise silently start fresh.
                console.error("Failed to load chat history:", error);
            } finally {
                setHistoryLoaded(true);
            }
        }
        loadHistory();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user" as const, content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await api.chat.sendMessage({
                message: userMessage.content,
                conversation_id: conversationId ?? undefined,
            });

            // Track conversation_id from first response
            if (!conversationId) {
                setConversationId(response.conversation_id);
            }

            const assistantMessage = { role: "assistant" as const, content: response.response };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            let errorText = "Sorry, I encountered an error. Please try again.";
            if (error instanceof ApiClientError) {
                if (error.status === 401) {
                    errorText = "Your session has expired. Please log in again.";
                } else if (error.status >= 500) {
                    errorText = "The server encountered an error. Please try again in a moment.";
                }
            }
            const errorMessage = {
                role: "assistant" as const,
                content: errorText,
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!historyLoaded) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-2 shadow-sm">
                <Bot className="w-6 h-6" />
                <h2 className="font-semibold text-lg">AI Assistant</h2>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                <AnimatePresence>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center text-gray-500 mt-12"
                        >
                            <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>How can I help you manage your tasks today?</p>
                        </motion.div>
                    )}

                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={clsx(
                                "flex gap-3 max-w-[85%]",
                                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <div className={clsx(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                                msg.role === "user" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
                            )}>
                                {msg.role === "user" ? <UserIcon size={16} /> : <Bot size={16} />}
                            </div>

                            <div className={clsx(
                                "p-3 rounded-2xl shadow-sm text-sm leading-relaxed",
                                msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                            )}>
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3 mr-auto max-w-[85%]"
                        >
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Bot size={16} />
                            </div>
                            <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                <span className="text-gray-400 text-sm">Thinking...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
