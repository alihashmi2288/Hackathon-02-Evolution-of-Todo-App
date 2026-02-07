"use client";

/**
 * Todos page header with notification center.
 *
 * Task Reference: T072 [US3] - Add NotificationBell to app header
 * Task Reference: T101 [US7] - Add Settings link to navigation
 * Feature: 006-recurring-reminders
 *
 * Client component that handles notification center state.
 */

import { useState, useCallback } from "react";
import Link from "next/link";
import { NotificationCenter } from "@/components/notifications";
import { SignOutButton } from "@/components/auth/SignOutButton";

interface TodosHeaderProps {
  /** User email to display */
  userEmail: string;
  /** User name if available */
  userName?: string | null;
}

/**
 * Header component for todos page with notifications.
 *
 * Task Reference: T072 [US3]
 */
export function TodosHeader({ userEmail, userName }: TodosHeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setIsNotificationOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsNotificationOpen(false);
  }, []);

  // Get display name - prefer name, fallback to email username
  const displayName = userName || userEmail.split("@")[0];

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-800 to-primary-950 flex items-center justify-center shadow-lg group-hover:shadow-primary-900/40 transition-all duration-300">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-display text-lg font-bold text-white tracking-tight hidden sm:block">
                ClearDay
              </span>
            </Link>

            {/* Page title on larger screens */}
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-primary-200/60">
              <h1 className="text-sm font-medium text-primary-200 bg-white/10 px-2 py-0.5 rounded-md">
                My Tasks
              </h1>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Notification Center */}
            <NotificationCenter
              isOpen={isNotificationOpen}
              onToggle={handleToggle}
              onClose={handleClose}
            />

            {/* Settings - T101 [US7] */}
            <Link
              href="/settings"
              className="p-2.5 rounded-xl text-primary-200 hover:text-white hover:bg-white/10 transition-all"
              title="Settings"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>

            {/* AI Chat Link */}
            <Link
              href="/chat"
              className="p-2.5 rounded-xl text-primary-200 hover:text-white hover:bg-white/10 transition-all"
              title="AI Assistant"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </Link>

            {/* User info and sign out */}
            <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-primary-200/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center text-sm font-semibold text-accent-900">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-white max-w-[120px] truncate">
                  {displayName}
                </span>
              </div>
              <SignOutButton variant="ghost" size="sm" />
            </div>

            {/* Mobile sign out */}
            <div className="sm:hidden">
              <SignOutButton variant="ghost" size="sm" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
