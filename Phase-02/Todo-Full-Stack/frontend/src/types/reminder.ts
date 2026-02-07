/**
 * Reminder types for todo reminders.
 *
 * Task Reference: T005 - Create frontend types for reminders
 * Feature: 006-recurring-reminders
 */

/**
 * Status of a reminder.
 */
export type ReminderStatus = "pending" | "sent" | "snoozed" | "cancelled";

/**
 * Preset reminder offset values.
 */
export type ReminderOffsetPreset =
  | "at_time"
  | "5_min"
  | "15_min"
  | "30_min"
  | "1_hour"
  | "2_hours"
  | "1_day"
  | "2_days"
  | "1_week";

/**
 * Request to create a reminder.
 */
export interface ReminderCreate {
  /** Todo ID to attach reminder to */
  todo_id: string;
  /** Occurrence ID for recurring todos (optional) */
  occurrence_id?: string;
  /** Absolute time to fire the reminder (UTC ISO string) */
  fire_at?: string;
  /** Minutes before due time (negative number, mutually exclusive with fire_at) */
  offset_minutes?: number;
}

/**
 * Response for a reminder.
 */
export interface ReminderResponse {
  id: string;
  todo_id: string;
  occurrence_id: string | null;
  fire_at: string;
  offset_minutes: number;
  status: ReminderStatus;
  sent_at: string | null;
  snoozed_until: string | null;
  created_at: string;
}

/**
 * Request to snooze a reminder.
 */
export interface SnoozeRequest {
  /** Minutes from now to snooze */
  snooze_minutes?: number;
  /** Preset snooze duration */
  preset?: "5_minutes" | "15_minutes" | "1_hour" | "custom";
}

/**
 * Map of preset values to offset minutes.
 */
export const REMINDER_OFFSET_VALUES: Record<ReminderOffsetPreset, number> = {
  "at_time": 0,
  "5_min": -5,
  "15_min": -15,
  "30_min": -30,
  "1_hour": -60,
  "2_hours": -120,
  "1_day": -1440,
  "2_days": -2880,
  "1_week": -10080,
};

/**
 * Labels for reminder offset presets.
 */
export const REMINDER_OFFSET_LABELS: Record<ReminderOffsetPreset, string> = {
  "at_time": "At due time",
  "5_min": "5 minutes before",
  "15_min": "15 minutes before",
  "30_min": "30 minutes before",
  "1_hour": "1 hour before",
  "2_hours": "2 hours before",
  "1_day": "1 day before",
  "2_days": "2 days before",
  "1_week": "1 week before",
};

/**
 * Snooze duration options.
 */
export const SNOOZE_OPTIONS = [
  { value: 5, label: "5 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 60, label: "1 hour" },
] as const;

/**
 * Format offset minutes to human-readable string.
 */
export function formatReminderOffset(offsetMinutes: number): string {
  const absMinutes = Math.abs(offsetMinutes);

  if (absMinutes < 60) {
    return `${absMinutes} minute${absMinutes !== 1 ? "s" : ""} before`;
  }

  const hours = Math.floor(absMinutes / 60);
  if (absMinutes < 1440) {
    return `${hours} hour${hours !== 1 ? "s" : ""} before`;
  }

  const days = Math.floor(absMinutes / 1440);
  if (absMinutes < 10080) {
    return `${days} day${days !== 1 ? "s" : ""} before`;
  }

  const weeks = Math.floor(absMinutes / 10080);
  return `${weeks} week${weeks !== 1 ? "s" : ""} before`;
}

/**
 * Get preset from offset minutes, if exact match exists.
 */
export function getPresetFromOffset(offsetMinutes: number): ReminderOffsetPreset | null {
  for (const [preset, value] of Object.entries(REMINDER_OFFSET_VALUES)) {
    if (value === offsetMinutes) {
      return preset as ReminderOffsetPreset;
    }
  }
  return null;
}
