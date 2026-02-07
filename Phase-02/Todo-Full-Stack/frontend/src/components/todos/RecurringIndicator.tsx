"use client";

/**
 * Visual indicator for recurring todos.
 *
 * Task Reference: T044 [US1] - Create RecurringIndicator component
 * Feature: 006-recurring-reminders
 *
 * Displays a badge/icon indicating a todo is recurring,
 * with optional tooltip showing the recurrence pattern.
 */

import { formatRruleString } from "@/types/recurrence";

interface RecurringIndicatorProps {
  /** RFC 5545 RRULE string */
  rrule?: string | null;
  /** Next occurrence date */
  nextOccurrence?: string | null;
  /** Size variant */
  size?: "sm" | "md";
  /** Show detailed tooltip */
  showTooltip?: boolean;
}

/**
 * Icon/badge component indicating a recurring todo.
 *
 * Task Reference: T044 [US1]
 */
export function RecurringIndicator({
  rrule,
  nextOccurrence,
  size = "sm",
  showTooltip = true,
}: RecurringIndicatorProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
  };

  const formattedPattern = rrule ? formatRruleString(rrule) : "Recurring";
  const tooltipText = nextOccurrence
    ? `${formattedPattern} • Next: ${new Date(nextOccurrence).toLocaleDateString()}`
    : formattedPattern;

  return (
    <span
      className="inline-flex items-center gap-1 text-blue-600"
      title={showTooltip ? tooltipText : undefined}
    >
      {/* Repeat icon (from Heroicons) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={sizeClasses[size]}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
        />
      </svg>
    </span>
  );
}

/**
 * Badge variant with text label.
 *
 * Task Reference: T044 [US1]
 */
export function RecurringBadge({
  rrule,
  nextOccurrence,
}: {
  rrule?: string | null;
  nextOccurrence?: string | null;
}) {
  const formattedPattern = rrule ? formatRruleString(rrule) : "Recurring";

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full"
      title={
        nextOccurrence
          ? `Next: ${new Date(nextOccurrence).toLocaleDateString()}`
          : undefined
      }
    >
      {/* Small repeat icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-3 h-3"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
        />
      </svg>
      {formattedPattern}
    </span>
  );
}
