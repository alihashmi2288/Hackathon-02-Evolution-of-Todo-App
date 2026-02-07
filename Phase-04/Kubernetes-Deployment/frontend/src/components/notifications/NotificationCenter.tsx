"use client";

/**
 * Notification center dropdown component.
 *
 * Task Reference: T070 [US3] - Create NotificationCenter dropdown/panel
 * Task Reference: T116 [US10] - Implement snooze action
 * Feature: 006-recurring-reminders
 *
 * Displays a list of notifications with actions to mark as read, delete,
 * snooze reminders, and navigate to related todos.
 */

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NotificationBell } from "./NotificationBell";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";
import { api } from "@/services/api";
import type { NotificationResponse } from "@/types/notification";

interface NotificationCenterProps {
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Callback to toggle open state */
  onToggle: () => void;
  /** Callback when dropdown should close */
  onClose: () => void;
}

/**
 * Notification center with bell icon and dropdown panel.
 *
 * Task Reference: T070 [US3]
 */
export function NotificationCenter({
  isOpen,
  onToggle,
  onClose,
}: NotificationCenterProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
  } = useNotifications();

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  /**
   * Handle notification click - navigate to todo if applicable.
   * Task Reference: T073 [US3] - Click-through navigation
   */
  const handleNotificationClick = useCallback(
    (notification: NotificationResponse) => {
      if (notification.todo_id) {
        // Navigate to todos page with the specific todo highlighted
        router.push(`/todos?highlight=${notification.todo_id}`);
        onClose();
      }
    },
    [router, onClose]
  );

  /**
   * Handle mark as read.
   */
  const handleMarkRead = useCallback(
    async (id: string) => {
      await markAsRead(id);
    },
    [markAsRead]
  );

  /**
   * Handle delete notification.
   */
  const handleDelete = useCallback(
    async (id: string) => {
      await deleteNotification(id);
    },
    [deleteNotification]
  );

  /**
   * Handle snooze reminder - T116 [US10]
   */
  const handleSnooze = useCallback(
    async (reminderId: string, minutes: number) => {
      try {
        await api.request(`/reminders/${reminderId}/snooze`, {
          method: "POST",
          body: JSON.stringify({ snooze_minutes: minutes }),
        });
        // Refresh notifications after snooze
        await fetchNotifications();
      } catch (err) {
        console.error("Failed to snooze reminder:", err);
      }
    },
    [fetchNotifications]
  );

  /**
   * Handle mark all as read.
   */
  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  return (
    <div className="relative" ref={dropdownRef}>
      <NotificationBell
        unreadCount={unreadCount}
        onClick={onToggle}
        isOpen={isOpen}
      />

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-primary-950/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
            <h3 className="text-sm font-semibold text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-primary-300 hover:text-white font-medium transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-primary-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 mb-2 text-primary-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                  />
                </svg>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                    onClick={handleNotificationClick}
                    onSnooze={handleSnooze}
                  />
                ))}

                {/* Load more button */}
                {hasMore && (
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={isLoading}
                    className="w-full py-3 text-sm text-primary-300 hover:bg-white/5 border-t border-white/10 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? "Loading..." : "Load more"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
