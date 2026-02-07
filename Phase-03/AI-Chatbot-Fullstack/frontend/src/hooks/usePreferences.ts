/**
 * Hook for managing user preferences.
 *
 * Task Reference: T100 [US7] - Create usePreferences hook
 * Feature: 006-recurring-reminders
 *
 * Provides state and methods for user preference management.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { api, type UserPreferencesResponse, type UserPreferencesUpdate } from "@/services/api";

/**
 * Re-export types for convenience
 */
export type UserPreferences = UserPreferencesResponse;
export type PreferencesUpdate = UserPreferencesUpdate;

/**
 * Hook return type.
 */
export interface UsePreferencesResult {
  preferences: UserPreferences | null;
  timezones: string[];
  isLoading: boolean;
  error: string | null;
  updatePreferences: (data: PreferencesUpdate) => Promise<UserPreferences | null>;
  refreshPreferences: () => Promise<void>;
}

/**
 * Hook for managing user preferences.
 *
 * Task Reference: T100 [US7]
 */
export function usePreferences(): UsePreferencesResult {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [timezones, setTimezones] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user preferences.
   */
  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await api.preferences.get();
      setPreferences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch preferences");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch available timezones.
   */
  const fetchTimezones = useCallback(async () => {
    try {
      const data = await api.preferences.getTimezones();
      setTimezones(data);
    } catch {
      // Silently fail - use empty array
      setTimezones([]);
    }
  }, []);

  /**
   * Update user preferences.
   */
  const updatePreferences = useCallback(
    async (data: PreferencesUpdate): Promise<UserPreferences | null> => {
      try {
        setError(null);
        const updated = await api.preferences.update(data);
        setPreferences(updated);
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update preferences");
        return null;
      }
    },
    []
  );

  /**
   * Refresh preferences from server.
   */
  const refreshPreferences = useCallback(async () => {
    await fetchPreferences();
  }, [fetchPreferences]);

  // Initial fetch
  useEffect(() => {
    fetchPreferences();
    fetchTimezones();
  }, [fetchPreferences, fetchTimezones]);

  return {
    preferences,
    timezones,
    isLoading,
    error,
    updatePreferences,
    refreshPreferences,
  };
}
