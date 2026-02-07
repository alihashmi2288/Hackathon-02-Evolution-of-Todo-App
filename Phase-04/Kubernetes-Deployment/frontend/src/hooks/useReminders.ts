"use client";

/**
 * Reminders state management hook.
 *
 * Task Reference: T059 [US2] - Create useReminders hook for reminder CRUD
 * Feature: 006-recurring-reminders
 */

import { useState, useCallback } from "react";
import { api, ApiClientError } from "@/services/api";
import type { ReminderResponse, ReminderCreate } from "@/types/reminder";

interface UseRemindersReturn {
  // State
  reminders: ReminderResponse[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  // Actions
  fetchReminders: (todoId: string) => Promise<void>;
  createReminder: (data: ReminderCreate) => Promise<ReminderResponse | null>;
  deleteReminder: (reminderId: string) => Promise<boolean>;
  snoozeReminder: (reminderId: string, minutes: number) => Promise<ReminderResponse | null>;
  clearReminders: () => void;
}

/**
 * Hook for managing reminder state and operations.
 *
 * Task Reference: T059 [US2]
 *
 * @example
 * const { reminders, createReminder, deleteReminder } = useReminders();
 *
 * // Fetch reminders for a todo
 * await fetchReminders(todoId);
 *
 * // Create a reminder
 * await createReminder({ todo_id: todoId, offset_minutes: -30 });
 */
export function useReminders(): UseRemindersReturn {
  const [reminders, setReminders] = useState<ReminderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch reminders for a specific todo.
   */
  const fetchReminders = useCallback(async (todoId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.request<{ items: ReminderResponse[]; total: number }>(
        `/todos/${todoId}/reminders`
      );
      setReminders(response.items);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.error.message);
      } else {
        setError("Failed to load reminders");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new reminder.
   */
  const createReminder = useCallback(
    async (data: ReminderCreate): Promise<ReminderResponse | null> => {
      setIsMutating(true);
      setError(null);

      try {
        const reminder = await api.request<ReminderResponse>(
          `/todos/${data.todo_id}/reminders`,
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );
        setReminders((prev) => [...prev, reminder]);
        return reminder;
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.error.message);
        } else {
          setError("Failed to create reminder");
        }
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  /**
   * Delete a reminder.
   */
  const deleteReminder = useCallback(async (reminderId: string): Promise<boolean> => {
    setIsMutating(true);
    setError(null);

    try {
      await api.request<void>(`/reminders/${reminderId}`, { method: "DELETE" });
      setReminders((prev) => prev.filter((r) => r.id !== reminderId));
      return true;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.error.message);
      } else {
        setError("Failed to delete reminder");
      }
      return false;
    } finally {
      setIsMutating(false);
    }
  }, []);

  /**
   * Snooze a reminder.
   */
  const snoozeReminder = useCallback(
    async (reminderId: string, minutes: number): Promise<ReminderResponse | null> => {
      setIsMutating(true);
      setError(null);

      try {
        const reminder = await api.request<ReminderResponse>(
          `/reminders/${reminderId}/snooze`,
          {
            method: "POST",
            body: JSON.stringify({ snooze_minutes: minutes }),
          }
        );
        setReminders((prev) =>
          prev.map((r) => (r.id === reminderId ? reminder : r))
        );
        return reminder;
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.error.message);
        } else {
          setError("Failed to snooze reminder");
        }
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  /**
   * Clear all reminders from state.
   */
  const clearReminders = useCallback(() => {
    setReminders([]);
    setError(null);
  }, []);

  return {
    reminders,
    isLoading,
    isMutating,
    error,
    fetchReminders,
    createReminder,
    deleteReminder,
    snoozeReminder,
    clearReminders,
  };
}
