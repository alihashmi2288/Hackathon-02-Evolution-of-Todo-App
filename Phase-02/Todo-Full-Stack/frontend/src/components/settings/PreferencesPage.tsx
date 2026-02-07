/**
 * User preferences page component.
 *
 * Task Reference: T097 [US7] - Create PreferencesPage
 * Task Reference: T098 [US7] - Add default reminder offset dropdown
 * Task Reference: T099 [US7] - Add timezone selector
 * Task Reference: T120 [US11] - Add daily digest toggle and time picker
 * Feature: 006-recurring-reminders
 *
 * Allows users to configure default reminder, timezone, and daily digest preferences.
 */

"use client";

import { useState } from "react";
import { usePreferences } from "@/hooks/usePreferences";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { Button } from "@/components/ui/Button";

/**
 * Reminder offset options (in minutes, negative = before due).
 * T098 [US7]
 */
const REMINDER_OFFSET_OPTIONS = [
  { value: null, label: "No default reminder" },
  { value: -15, label: "15 minutes before" },
  { value: -30, label: "30 minutes before" },
  { value: -60, label: "1 hour before" },
  { value: -120, label: "2 hours before" },
  { value: -1440, label: "1 day before" },
  { value: -2880, label: "2 days before" },
  { value: -10080, label: "1 week before" },
];

/**
 * Preferences page component.
 */
export function PreferencesPage() {
  const {
    preferences,
    timezones,
    isLoading,
    error,
    updatePreferences,
  } = usePreferences();

  // T133 [US12] - Push notification state
  const {
    isSupported: pushSupported,
    isConfigured: pushConfigured,
    permission: pushPermission,
    isSubscribed: pushSubscribed,
    isLoading: pushLoading,
    error: pushError,
    toggleSubscription: togglePushSubscription,
  } = usePushSubscription();

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Local form state
  const [timezone, setTimezone] = useState<string | null>(null);
  const [reminderOffset, setReminderOffset] = useState<number | null>(null);
  const [pushEnabled, setPushEnabled] = useState<boolean | null>(null);
  // T120 [US11] - Daily digest state
  const [dailyDigestEnabled, setDailyDigestEnabled] = useState<boolean | null>(null);
  const [dailyDigestTime, setDailyDigestTime] = useState<string | null>(null);

  // Initialize form state when preferences load
  if (preferences && timezone === null) {
    setTimezone(preferences.timezone);
    setReminderOffset(preferences.default_reminder_offset);
    setPushEnabled(preferences.push_enabled);
    setDailyDigestEnabled(preferences.daily_digest_enabled);
    setDailyDigestTime(preferences.daily_digest_time);
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const result = await updatePreferences({
        timezone: timezone || undefined,
        default_reminder_offset: reminderOffset,
        push_enabled: pushEnabled ?? undefined,
        daily_digest_enabled: dailyDigestEnabled ?? undefined,
        daily_digest_time: dailyDigestTime || undefined,
      });

      if (result) {
        setSaveMessage({ type: "success", text: "Preferences saved successfully" });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: "error", text: "Failed to save preferences" });
      }
    } catch {
      setSaveMessage({ type: "error", text: "Failed to save preferences" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading preferences: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white font-display mb-6">Preferences</h1>

      <div className="glass-card rounded-2xl border border-white/20 overflow-hidden">
        {/* Timezone Section - T099 [US7] */}
        <div className="p-6 border-b border-white/10">
          <label className="block text-sm font-medium text-primary-200 mb-2">
            Timezone
          </label>
          <p className="text-sm text-primary-400 mb-3">
            Your timezone is used for reminder scheduling and due date calculations.
          </p>
          <select
            value={timezone || ""}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent [&>option]:bg-primary-900 [&>option]:text-white"
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Default Reminder Section - T098 [US7] */}
        <div className="p-6 border-b border-white/10">
          <label className="block text-sm font-medium text-primary-200 mb-2">
            Default Reminder
          </label>
          <p className="text-sm text-primary-400 mb-3">
            Automatically add a reminder when you create a todo with a due date.
          </p>
          <select
            value={reminderOffset ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setReminderOffset(val === "" ? null : parseInt(val, 10));
            }}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent [&>option]:bg-primary-900 [&>option]:text-white"
          >
            {REMINDER_OFFSET_OPTIONS.map((opt) => (
              <option key={opt.value ?? "none"} value={opt.value ?? ""}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Push Notifications Section - T133 [US12] */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-primary-200">
                Push Notifications
              </label>
              <p className="text-sm text-primary-400">
                Receive browser notifications for reminders.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (pushSupported && pushConfigured) {
                  await togglePushSubscription();
                }
                setPushEnabled(!pushEnabled);
              }}
              disabled={pushLoading || !pushSupported || !pushConfigured}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${pushEnabled && pushSubscribed ? "bg-accent-500" : "bg-white/20"
                }`}
              role="switch"
              aria-checked={(pushEnabled && pushSubscribed) ?? false}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${pushEnabled && pushSubscribed ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </button>
          </div>

          {/* Push notification status - T133 [US12] */}
          <div className="mt-3 space-y-2">
            {!pushSupported && (
              <p className="text-sm text-amber-600">
                ⚠️ Push notifications are not supported in this browser.
              </p>
            )}
            {pushSupported && !pushConfigured && (
              <p className="text-sm text-amber-600">
                ⚠️ Push notifications are not configured on the server.
              </p>
            )}
            {pushSupported && pushConfigured && pushPermission === "denied" && (
              <p className="text-sm text-red-600">
                ❌ Notification permission denied. Please enable notifications in your browser settings.
              </p>
            )}
            {pushSupported && pushConfigured && pushPermission === "default" && !pushSubscribed && (
              <p className="text-sm text-primary-400">
                Click the toggle to enable push notifications. Your browser will ask for permission.
              </p>
            )}
            {pushSubscribed && (
              <p className="text-sm text-success-400">
                ✓ Push notifications are active on this device.
              </p>
            )}
            {pushError && (
              <p className="text-sm text-danger-400">
                Error: {pushError}
              </p>
            )}
          </div>
        </div>

        {/* Daily Digest Section - T120 [US11] */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-sm font-medium text-primary-200">
                Daily Digest
              </label>
              <p className="text-sm text-primary-400">
                Receive a daily summary of your todos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDailyDigestEnabled(!dailyDigestEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${dailyDigestEnabled ? "bg-accent-500" : "bg-white/20"
                }`}
              role="switch"
              aria-checked={dailyDigestEnabled ?? false}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${dailyDigestEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </button>
          </div>
          {dailyDigestEnabled && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Digest Time
              </label>
              <p className="text-sm text-primary-400 mb-2">
                What time would you like to receive your daily digest?
              </p>
              <input
                type="time"
                value={dailyDigestTime || "08:00"}
                onChange={(e) => setDailyDigestTime(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              />
              <p className="mt-2 text-xs text-white">
                Time is in your selected timezone ({timezone || "UTC"})
              </p>
            </div>
          )}
        </div>

        {/* Save Section */}
        <div className="p-6 bg-white/5 border-t border-white/10">
          {saveMessage && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${saveMessage.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
                }`}
            >
              {saveMessage.text}
            </div>
          )}
          <Button onClick={handleSave} isLoading={isSaving}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
