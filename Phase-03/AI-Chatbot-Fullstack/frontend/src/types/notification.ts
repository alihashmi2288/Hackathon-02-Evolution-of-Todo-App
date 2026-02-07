/**
 * Notification types for the notification center.
 *
 * Task Reference: T006 - Create frontend types for notifications
 * Feature: 006-recurring-reminders
 */

/**
 * Type of notification.
 */
export type NotificationType = "reminder" | "daily_digest" | "recurring_due";

/**
 * Response for a single notification.
 */
export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  todo_id: string | null;
  /** Related reminder ID for snooze action - T115 [US10] */
  reminder_id: string | null;
  read: boolean;
  created_at: string;
}

/**
 * Response for notification list with pagination.
 */
export interface NotificationListResponse {
  items: NotificationResponse[];
  total: number;
  unread_count: number;
}

/**
 * Response for unread count.
 */
export interface UnreadCountResponse {
  unread_count: number;
}

/**
 * Request to update a notification.
 */
export interface NotificationUpdate {
  read?: boolean;
}

/**
 * Response for mark all read.
 */
export interface MarkAllReadResponse {
  updated_count: number;
}

/**
 * Web Push subscription from browser.
 */
export interface PushSubscriptionCreate {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Response for push subscription.
 */
export interface PushSubscriptionResponse {
  id: string;
  endpoint: string;
  created_at: string;
}

/**
 * Response for VAPID public key.
 */
export interface VapidKeyResponse {
  public_key: string;
}

/**
 * User preferences for notifications.
 */
export interface UserPreferencesResponse {
  id: string;
  user_id: string;
  timezone: string;
  default_reminder_offset: number | null;
  push_enabled: boolean;
  daily_digest_enabled: boolean;
  daily_digest_time: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Request to update user preferences.
 */
export interface UserPreferencesUpdate {
  timezone?: string;
  default_reminder_offset?: number | null;
  push_enabled?: boolean;
  daily_digest_enabled?: boolean;
  daily_digest_time?: string;
}

/**
 * Timezone option for dropdown.
 */
export interface TimezoneOption {
  id: string;
  label: string;
  offset: string;
}

/**
 * Format notification type for display.
 */
export function formatNotificationType(type: NotificationType): string {
  switch (type) {
    case "reminder":
      return "Reminder";
    case "daily_digest":
      return "Daily Digest";
    case "recurring_due":
      return "Recurring Due";
    default:
      return type;
  }
}

/**
 * Get icon name for notification type.
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case "reminder":
      return "bell";
    case "daily_digest":
      return "calendar";
    case "recurring_due":
      return "repeat";
    default:
      return "notification";
  }
}

/**
 * Format relative time for notification.
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString();
}
