"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { api, ApiClientError } from "@/services/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetContextValue {
  messages: Message[];
  conversationId: string | null;
  isOpen: boolean;
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  setIsOpen: (value: boolean) => void;
  toggleOpen: () => void;
  sendMessage: () => Promise<void>;
}

const ChatWidgetContext = createContext<ChatWidgetContextValue | null>(null);

export function ChatWidgetProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const historyLoadedRef = useRef(false);

  const loadHistory = useCallback(async () => {
    if (historyLoadedRef.current) return;
    historyLoadedRef.current = true;
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
    } catch {
      // Silently start fresh on error
    }
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) loadHistory();
      return next;
    });
  }, [loadHistory]);

  const handleSetIsOpen = useCallback(
    (value: boolean) => {
      setIsOpen(value);
      if (value) loadHistory();
    },
    [loadHistory]
  );

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.chat.sendMessage({
        message: trimmed,
        conversation_id: conversationId ?? undefined,
      });

      if (!conversationId) {
        setConversationId(response.conversation_id);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.response },
      ]);
    } catch (error) {
      let errorText = "Sorry, I encountered an error. Please try again.";
      if (error instanceof ApiClientError) {
        if (error.status === 401) {
          errorText = "Your session has expired. Please log in again.";
        } else if (error.status >= 500) {
          errorText = "The server encountered an error. Please try again in a moment.";
        }
      }
      setMessages((prev) => [...prev, { role: "assistant", content: errorText }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, conversationId]);

  return (
    <ChatWidgetContext.Provider
      value={{
        messages,
        conversationId,
        isOpen,
        isLoading,
        input,
        setInput,
        setIsOpen: handleSetIsOpen,
        toggleOpen,
        sendMessage,
      }}
    >
      {children}
    </ChatWidgetContext.Provider>
  );
}

export function useChatWidget(): ChatWidgetContextValue {
  const context = useContext(ChatWidgetContext);
  if (!context) {
    throw new Error("useChatWidget must be used within a ChatWidgetProvider");
  }
  return context;
}
