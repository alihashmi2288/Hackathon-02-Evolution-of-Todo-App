"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth";
import { useChatWidget } from "@/hooks/useChatWidget";
import { ChatWidgetButton } from "./ChatWidgetButton";
import { ChatWidgetWindow } from "./ChatWidgetWindow";

const HIDDEN_PATHS = ["/chat", "/login", "/register"];

export function FloatingChatWidget() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isOpen } = useChatWidget();

  // Hide when not authenticated or on excluded pages
  if (!session?.user || HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && <ChatWidgetWindow />}
      </AnimatePresence>
      <ChatWidgetButton />
    </>
  );
}
