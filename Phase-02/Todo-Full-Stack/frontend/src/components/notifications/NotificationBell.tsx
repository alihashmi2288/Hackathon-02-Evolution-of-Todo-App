"use client";

/**
 * Notification bell component with unread badge.
 *
 * Task Reference: T068 [US3] - Create NotificationBell component
 * Feature: 006-recurring-reminders
 *
 * Displays a bell icon with an unread count badge.
 */

interface NotificationBellProps {
  /** Number of unread notifications */
  unreadCount: number;
  /** Click handler to open notification center */
  onClick: () => void;
  /** Whether the notification center is open */
  isOpen?: boolean;
}

/**
 * Bell icon button with unread count badge.
 *
 * Task Reference: T068 [US3]
 */
export function NotificationBell({
  unreadCount,
  onClick,
  isOpen = false,
}: NotificationBellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-2 rounded-lg transition-colors ${isOpen
          ? "bg-white/10 text-white"
          : "text-primary-200 hover:bg-white/10 hover:text-white"
        }`}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      {/* Bell icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
        />
      </svg>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
