/**
 * Recurrence types for recurring todos.
 *
 * Task Reference: T004 - Create frontend types for recurrence
 * Feature: 006-recurring-reminders
 */

/**
 * Basic recurrence frequencies.
 */
export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly" | "custom";

/**
 * Days of the week for weekly recurrence patterns.
 * Uses RFC 5545 abbreviations.
 */
export type DayOfWeek = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

/**
 * Configuration for creating/updating recurrence patterns.
 */
export interface RecurrenceConfig {
  /** Basic frequency type */
  frequency: RecurrenceFrequency;
  /** Repeat every N frequency units (e.g., every 2 weeks) */
  interval?: number;
  /** For weekly frequency - which days to repeat */
  days_of_week?: DayOfWeek[];
  /** For monthly frequency - which day of month (1-31) */
  day_of_month?: number;
  /** Date to stop recurring (exclusive with end_count) */
  end_date?: string;
  /** Number of occurrences (exclusive with end_date) */
  end_count?: number;
}

/**
 * Scope for editing recurring todos.
 */
export type EditScope = "this_only" | "all_future";

/**
 * Status of a single occurrence in a recurring series.
 */
export type OccurrenceStatus = "pending" | "completed" | "skipped";

/**
 * Response for a single occurrence of a recurring todo.
 */
export interface OccurrenceResponse {
  id: string;
  parent_todo_id: string;
  occurrence_date: string;
  status: OccurrenceStatus;
  completed_at: string | null;
}

/**
 * Extended Todo response with recurrence fields.
 */
export interface RecurringTodoFields {
  is_recurring: boolean;
  rrule: string | null;
  recurrence_end_date: string | null;
  recurrence_count: number | null;
  occurrences_generated: number;
}

/**
 * Helper to format recurrence for display.
 */
export function formatRecurrence(config: RecurrenceConfig): string {
  const { frequency, interval = 1, days_of_week, day_of_month } = config;

  if (frequency === "daily") {
    return interval === 1 ? "Daily" : `Every ${interval} days`;
  }

  if (frequency === "weekly") {
    const days = days_of_week?.length
      ? days_of_week.map(d => d.charAt(0) + d.charAt(1).toLowerCase()).join(", ")
      : "";
    const prefix = interval === 1 ? "Weekly" : `Every ${interval} weeks`;
    return days ? `${prefix} on ${days}` : prefix;
  }

  if (frequency === "monthly") {
    const prefix = interval === 1 ? "Monthly" : `Every ${interval} months`;
    return day_of_month ? `${prefix} on day ${day_of_month}` : prefix;
  }

  if (frequency === "yearly") {
    return interval === 1 ? "Yearly" : `Every ${interval} years`;
  }

  return "Custom";
}

/**
 * Parse and format an RRULE string for display.
 * Handles RFC 5545 RRULE format: FREQ=DAILY;INTERVAL=1;...
 */
export function formatRruleString(rrule: string): string {
  if (!rrule) return "Recurring";

  // Parse RRULE components
  const parts = rrule.replace("RRULE:", "").split(";");
  const params: Record<string, string> = {};

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key && value) {
      params[key] = value;
    }
  }

  const freq = params.FREQ?.toLowerCase();
  const interval = parseInt(params.INTERVAL || "1", 10);
  const byDay = params.BYDAY?.split(",");
  const byMonthDay = params.BYMONTHDAY;

  if (freq === "daily") {
    return interval === 1 ? "Daily" : `Every ${interval} days`;
  }

  if (freq === "weekly") {
    const prefix = interval === 1 ? "Weekly" : `Every ${interval} weeks`;
    if (byDay && byDay.length > 0) {
      const dayNames = byDay.map((d) => d.charAt(0) + d.slice(1).toLowerCase());
      return `${prefix} on ${dayNames.join(", ")}`;
    }
    return prefix;
  }

  if (freq === "monthly") {
    const prefix = interval === 1 ? "Monthly" : `Every ${interval} months`;
    if (byMonthDay) {
      return `${prefix} on day ${byMonthDay}`;
    }
    return prefix;
  }

  if (freq === "yearly") {
    return interval === 1 ? "Yearly" : `Every ${interval} years`;
  }

  return "Recurring";
}

/**
 * Day of week labels for UI.
 */
export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  MO: "Monday",
  TU: "Tuesday",
  WE: "Wednesday",
  TH: "Thursday",
  FR: "Friday",
  SA: "Saturday",
  SU: "Sunday",
};

/**
 * Day of week short labels for compact UI.
 */
export const DAY_OF_WEEK_SHORT: Record<DayOfWeek, string> = {
  MO: "Mon",
  TU: "Tue",
  WE: "Wed",
  TH: "Thu",
  FR: "Fri",
  SA: "Sat",
  SU: "Sun",
};
