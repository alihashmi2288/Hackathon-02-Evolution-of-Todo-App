"use client";

/**
 * Notifications state management hook.
 *
 * Task Reference: T071 [US3] - Create useNotifications hook for notification management
 * Feature: 006-recurring-reminders
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { api, ApiClientError } from "@/services/api";
import type { NotificationResponse } from "@/types/notification";

interface UseNotificationsOptions {
  /** Auto-refresh interval in milliseconds (default: 30000 = 30s) */
  pollInterval?: number;
  /** Whether to start polling immediately (default: true) */
  autoRefresh?: boolean;
}

interface UseNotificationsReturn {
  // State
  notifications: NotificationResponse[];
  unreadCount: number;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;

  // Actions
  fetchNotifications: (options?: { unread_only?: boolean; limit?: number; offset?: number }) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<number>;
  deleteNotification: (id: string) => Promise<boolean>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DEFAULT_LIMIT = 20;

/**
 * Hook for managing notification state and operations.
 *
 * Task Reference: T071 [US3]
 *
 * @example
 * const { notifications, unreadCount, markAsRead } = useNotifications();
 *
 * // Mark notification as read
 * await markAsRead(notificationId);
 *
 * // Load more notifications
 * await loadMore();
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { pollInterval = 30000, autoRefresh = true } = options;

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch notifications from the API.
   */
  const fetchNotifications = useCallback(
    async (fetchOptions?: { unread_only?: boolean; limit?: number; offset?: number }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.notifications.list({
          limit: fetchOptions?.limit ?? DEFAULT_LIMIT,
          offset: fetchOptions?.offset ?? 0,
          unread_only: fetchOptions?.unread_only,
        });

        if (fetchOptions?.offset && fetchOptions.offset > 0) {
          // Append for pagination
          setNotifications((prev) => [...prev, ...response.items]);
        } else {
          // Replace for initial load or refresh
          setNotifications(response.items);
        }

        setTotal(response.total);
        setUnreadCount(response.unread_count);
        setHasMore(response.items.length < response.total);
        setOffset((fetchOptions?.offset ?? 0) + response.items.length);
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.error.message);
        } else {
          setError("Failed to load notifications");
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Fetch unread count only.
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.notifications.unreadCount();
      setUnreadCount(response.unread_count);
    } catch {
      // Silently fail for count updates - don't log to avoid console noise
      // Network errors during polling are expected and recoverable
    }
  }, []);

  /**
   * Mark a notification as read.
   */
  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    setIsMutating(true);
    setError(null);

    try {
      await api.notifications.update(id, { read: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.error.message);
      } else {
        setError("Failed to mark notification as read");
      }
      return false;
    } finally {
      setIsMutating(false);
    }
  }, []);

  /**
   * Mark all notifications as read.
   */
  const markAllAsRead = useCallback(async (): Promise<number> => {
    setIsMutating(true);
    setError(null);

    try {
      const response = await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      return response.updated_count;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.error.message);
      } else {
        setError("Failed to mark all as read");
      }
      return 0;
    } finally {
      setIsMutating(false);
    }
  }, []);

  /**
   * Delete a notification.
   */
  const deleteNotification = useCallback(async (id: string): Promise<boolean> => {
    setIsMutating(true);
    setError(null);

    try {
      await api.notifications.delete(id);
      const deleted = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      if (deleted && !deleted.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return true;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.error.message);
      } else {
        setError("Failed to delete notification");
      }
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [notifications]);

  /**
   * Load more notifications (pagination).
   */
  const loadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      await fetchNotifications({ offset, limit: DEFAULT_LIMIT });
    }
  }, [hasMore, isLoading, offset, fetchNotifications]);

  /**
   * Refresh notifications and unread count.
   */
  const refresh = useCallback(async () => {
    setOffset(0);
    await Promise.all([
      fetchNotifications({ offset: 0, limit: DEFAULT_LIMIT }),
      fetchUnreadCount(),
    ]);
  }, [fetchNotifications, fetchUnreadCount]);

  // Initial load and auto-refresh
  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();

    if (autoRefresh && pollInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchUnreadCount();
      }, pollInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchUnreadCount, autoRefresh, pollInterval]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isMutating,
    error,
    hasMore,
    total,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refresh,
  };
}
