"use client";

/**
 * Individual notification item component.
 *
 * Task Reference: T069 [US3] - Create NotificationItem component
 * Task Reference: T115 [US10] - Add snooze options to notification item
 * Feature: 006-recurring-reminders
 *
 * Displays a single notification with type icon, content, and actions.
 */

import { useState } from "react";
import { formatRelativeTime, formatNotificationType } from "@/types/notification";
import type { NotificationResponse } from "@/types/notification";

interface NotificationItemProps {
  notification: NotificationResponse;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (notification: NotificationResponse) => void;
  /** T115 [US10] - Snooze callback for reminder notifications */
  onSnooze?: (reminderId: string, minutes: number) => Promise<void>;
}

/** Snooze duration options - T115 [US10] */
const SNOOZE_OPTIONS = [
  { label: "5 minutes", minutes: 5 },
  { label: "15 minutes", minutes: 15 },
  { label: "30 minutes", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
];

/**
 * Get icon for notification type.
 */
function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "reminder":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-amber-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
      );
    case "daily_digest":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-blue-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
      );
    case "recurring_due":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-green-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
          />
        </svg>
      );
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-gray-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
          />
        </svg>
      );
  }
}

/**
 * Single notification item with actions.
 *
 * Task Reference: T069 [US3], T115 [US10]
 */
export function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onClick,
  onSnooze,
}: NotificationItemProps) {
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const [isSnoozing, setIsSnoozing] = useState(false);

  const handleClick = () => {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
    onClick(notification);
  };

  /** T115 [US10] - Handle snooze selection */
  const handleSnooze = async (minutes: number) => {
    if (!notification.reminder_id || !onSnooze) return;

    setIsSnoozing(true);
    try {
      await onSnooze(notification.reminder_id, minutes);
      setShowSnoozeMenu(false);
    } finally {
      setIsSnoozing(false);
    }
  };

  /** Can this notification be snoozed? */
  const canSnooze = notification.type === "reminder" && notification.reminder_id && onSnooze;

  return (
    <div
      className={`flex gap-3 p-3 border-b border-white/10 last:border-b-0 cursor-pointer transition-colors ${notification.read
          ? "bg-transparent hover:bg-white/5"
          : "bg-accent-500/10 hover:bg-accent-500/20"
        }`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        <NotificationIcon type={notification.type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm ${notification.read ? "text-primary-200" : "font-medium text-white"
              }`}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <span className="shrink-0 w-2 h-2 mt-1.5 bg-blue-500 rounded-full" />
          )}
        </div>
        <p className="mt-0.5 text-sm text-primary-300 line-clamp-2">
          {notification.body}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-primary-400">
          <span>{formatNotificationType(notification.type)}</span>
          <span>•</span>
          <span>{formatRelativeTime(notification.created_at)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-start gap-1 shrink-0">
        {/* T115 [US10] - Snooze button for reminder notifications */}
        {canSnooze && (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSnoozeMenu(!showSnoozeMenu);
              }}
              disabled={isSnoozing}
              className="p-1 text-primary-400 hover:text-amber-400 rounded transition-colors disabled:opacity-50"
              aria-label="Snooze reminder"
              title="Snooze"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </button>

            {/* Snooze menu dropdown */}
            {showSnoozeMenu && (
              <div
                className="absolute right-0 mt-1 w-32 glass-card rounded-md shadow-lg border border-white/20 py-1 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1 text-xs font-medium text-primary-400 border-b border-white/10">
                  Snooze for
                </div>
                {SNOOZE_OPTIONS.map((option) => (
                  <button
                    key={option.minutes}
                    type="button"
                    onClick={() => handleSnooze(option.minutes)}
                    disabled={isSnoozing}
                    className="w-full px-2 py-1.5 text-left text-sm text-primary-200 hover:bg-white/10 disabled:opacity-50"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="p-1 text-primary-400 hover:text-danger-400 rounded transition-colors"
          aria-label="Delete notification"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
