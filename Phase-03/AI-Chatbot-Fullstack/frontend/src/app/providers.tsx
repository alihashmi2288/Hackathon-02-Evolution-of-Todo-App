"use client";

/**
 * Client-side providers wrapper.
 *
 * Task Reference: T012 - Add ToastProvider to layout
 * Feature: 004-frontend-todo-ui
 */

import type { ReactNode } from "react";
import { ToastProvider } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
