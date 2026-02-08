/**
 * Date utility functions for due date handling.
 *
 * Task Reference: T018 - Create date-utils.ts with formatDueDate and getDueDateStatus
 * Feature: 005-todo-enhancements
 *
 * Provides:
 * - Human-friendly date formatting (Today, Tomorrow, relative dates)
 * - Due date status calculation (overdue, due-soon, normal)
 * - Date comparison utilities
 */

/**
 * Due date status for visual indicators.
 */
export type DueDateStatus = "overdue" | "due-soon" | "due-today" | "normal" | "none";

/**
 * Configuration for due date status colors.
 */
export const DUE_DATE_STATUS_CONFIG: Record<
  DueDateStatus,
  { label: string; color: string; bgColor: string }
> = {
  overdue: {
    label: "Overdue",
    color: "#EF4444", // red-500
    bgColor: "#FEE2E2", // red-100
  },
  "due-today": {
    label: "Due Today",
    color: "#F59E0B", // amber-500
    bgColor: "#FEF3C7", // amber-100
  },
  "due-soon": {
    label: "Due Soon",
    color: "#EAB308", // yellow-500
    bgColor: "#FEF9C3", // yellow-100
  },
  normal: {
    label: "",
    color: "#6B7280", // gray-500
    bgColor: "#F3F4F6", // gray-100
  },
  none: {
    label: "",
    color: "#9CA3AF", // gray-400
    bgColor: "transparent",
  },
};

/**
 * Number of days to consider as "due soon".
 */
const DUE_SOON_DAYS = 3;

/**
 * Get the start of today (midnight) in local timezone.
 */
function getStartOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Parse a date/datetime string to a Date object.
 * Handles both YYYY-MM-DD and ISO 8601 datetime formats.
 */
function parseDate(dateStr: string): Date {
  // Try ISO 8601 datetime first (includes 'T' or 'Z')
  if (dateStr.includes("T") || dateStr.includes("Z")) {
    return new Date(dateStr);
  }
  // Fall back to YYYY-MM-DD at midnight local time
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get the number of days between two dates (ignoring time).
 * Positive = future, Negative = past.
 */
function getDaysDifference(date: Date, reference: Date = getStartOfToday()): number {
  const diffTime = date.getTime() - reference.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get the due date status for visual indicators.
 *
 * @param dueDate - Due date string (YYYY-MM-DD) or null
 * @param completed - Whether the todo is completed
 * @returns Status for styling
 */
export function getDueDateStatus(
  dueDate: string | null,
  completed: boolean = false
): DueDateStatus {
  if (!dueDate) {
    return "none";
  }

  // Completed todos don't show urgency
  if (completed) {
    return "normal";
  }

  const due = parseDate(dueDate);
  const daysDiff = getDaysDifference(due);

  if (daysDiff < 0) {
    return "overdue";
  }

  if (daysDiff === 0) {
    return "due-today";
  }

  if (daysDiff <= DUE_SOON_DAYS) {
    return "due-soon";
  }

  return "normal";
}

/**
 * Check if a datetime string includes time component.
 */
function hasTimeComponent(dateStr: string): boolean {
  return dateStr.includes("T") || dateStr.includes("Z");
}

/**
 * Format time from a Date object.
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a due date for human-friendly display.
 *
 * Returns relative dates for nearby dates:
 * - "Overdue" for past dates
 * - "Today at 3:00 PM" for today with time
 * - "Tomorrow at 3:00 PM" for tomorrow with time
 * - "In X days" for dates within a week
 * - Formatted date for dates further out
 *
 * @param dueDate - Due date string (ISO 8601 datetime or YYYY-MM-DD) or null
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDueDate(
  dueDate: string | null,
  options: {
    showRelative?: boolean;
    includeYear?: boolean;
    includeTime?: boolean;
  } = {}
): string {
  const { showRelative = true, includeYear = false, includeTime = true } = options;

  if (!dueDate) {
    return "";
  }

  const due = parseDate(dueDate);
  const daysDiff = getDaysDifference(due);
  const showTime = includeTime && hasTimeComponent(dueDate);
  const timeStr = showTime ? ` at ${formatTime(due)}` : "";

  // Relative formatting for nearby dates
  if (showRelative) {
    if (daysDiff < 0) {
      const absDays = Math.abs(daysDiff);
      if (absDays === 1) {
        return `Yesterday${timeStr}`;
      }
      if (absDays <= 7) {
        return `${absDays} days ago${timeStr}`;
      }
    }

    if (daysDiff === 0) {
      return `Today${timeStr}`;
    }

    if (daysDiff === 1) {
      return `Tomorrow${timeStr}`;
    }

    if (daysDiff <= 7) {
      return `In ${daysDiff} days${timeStr}`;
    }
  }

  // Format the date for dates further out
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: includeYear || due.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });

  return dateFormatter.format(due) + timeStr;
}

/**
 * Format a due date with the day of week and optional time.
 *
 * @param dueDate - Due date string (ISO 8601 datetime or YYYY-MM-DD) or null
 * @returns Formatted date with day name
 */
export function formatDueDateWithDay(dueDate: string | null): string {
  if (!dueDate) {
    return "";
  }

  const due = parseDate(dueDate);
  const daysDiff = getDaysDifference(due);
  const showTime = hasTimeComponent(dueDate);
  const timeStr = showTime ? ` at ${formatTime(due)}` : "";

  // Use relative for today/tomorrow
  if (daysDiff === 0) {
    return `Today${timeStr}`;
  }
  if (daysDiff === 1) {
    return `Tomorrow${timeStr}`;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return formatter.format(due) + timeStr;
}

/**
 * Check if a date is in the past.
 *
 * @param dueDate - Due date string (YYYY-MM-DD) or null
 * @returns True if the date is before today
 */
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) {
    return false;
  }
  const due = parseDate(dueDate);
  return getDaysDifference(due) < 0;
}

/**
 * Check if a date is today.
 *
 * @param dueDate - Due date string (YYYY-MM-DD) or null
 * @returns True if the date is today
 */
export function isDueToday(dueDate: string | null): boolean {
  if (!dueDate) {
    return false;
  }
  const due = parseDate(dueDate);
  return getDaysDifference(due) === 0;
}

/**
 * Check if a date is within the "due soon" window.
 *
 * @param dueDate - Due date string (YYYY-MM-DD) or null
 * @returns True if within DUE_SOON_DAYS of today (but not past)
 */
export function isDueSoon(dueDate: string | null): boolean {
  if (!dueDate) {
    return false;
  }
  const due = parseDate(dueDate);
  const daysDiff = getDaysDifference(due);
  return daysDiff > 0 && daysDiff <= DUE_SOON_DAYS;
}

/**
 * Get today's date as a YYYY-MM-DD string.
 *
 * @returns Today's date string
 */
export function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

/**
 * Get a date offset from today as a YYYY-MM-DD string.
 *
 * @param days - Number of days to offset (positive = future, negative = past)
 * @returns Date string
 */
export function getDateOffsetString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

/**
 * Validate a date string is in YYYY-MM-DD or ISO 8601 datetime format.
 *
 * @param dateStr - Date string to validate
 * @returns True if valid format
 */
export function isValidDateString(dateStr: string): boolean {
  // Accept YYYY-MM-DD or ISO 8601 datetime
  const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;

  if (!dateOnlyRegex.test(dateStr) && !isoRegex.test(dateStr)) {
    return false;
  }

  const date = parseDate(dateStr);
  return !isNaN(date.getTime());
}
