"use client";

/**
 * DateTimePicker component for due date and time selection.
 *
 * Task Reference: T025 [US1] - Create DatePicker component
 * Feature: 005-todo-enhancements, 006-recurring-reminders
 *
 * Uses native HTML5 datetime-local input for date and time selection.
 */

import { type ChangeEvent } from "react";

interface DateTimePickerProps {
  /** Current value (ISO 8601 datetime string or null) */
  value: string | null;

  /** Callback when datetime changes */
  onChange: (value: string | null) => void;

  /** Field label */
  label?: string;

  /** Placeholder text */
  placeholder?: string;

  /** Disable the input */
  disabled?: boolean;

  /** Minimum selectable datetime (ISO 8601) */
  min?: string;

  /** Maximum selectable datetime (ISO 8601) */
  max?: string;

  /** Allow clearing the datetime */
  clearable?: boolean;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Convert ISO 8601 datetime to datetime-local format (YYYY-MM-DDTHH:MM)
 */
function toDateTimeLocal(isoString: string | null): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    // Format as YYYY-MM-DDTHH:MM for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
}

/**
 * Convert datetime-local format to ISO 8601 datetime
 */
function toISOString(dateTimeLocal: string): string | null {
  if (!dateTimeLocal) return null;
  try {
    // datetime-local is in local timezone, convert to ISO with Z suffix for UTC
    const date = new Date(dateTimeLocal);
    return date.toISOString();
  } catch {
    return null;
  }
}

/**
 * DateTime picker input for selecting due dates with time.
 *
 * Features:
 * - Native HTML5 datetime-local input for best mobile UX
 * - Optional clear button
 * - Min/max datetime constraints
 * - Accessible labeling
 * - Outputs ISO 8601 format for API compatibility
 */
export function DateTimePicker({
  value,
  onChange,
  label,
  placeholder = "Select date and time",
  disabled = false,
  min,
  max,
  clearable = true,
  className = "",
}: DateTimePickerProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(toISOString(newValue));
  };

  const handleClear = () => {
    onChange(null);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="datetime-local"
          value={toDateTimeLocal(value)}
          onChange={handleChange}
          disabled={disabled}
          min={min ? toDateTimeLocal(min) : undefined}
          max={max ? toDateTimeLocal(max) : undefined}
          placeholder={placeholder}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-lg
            text-gray-900 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${clearable && value ? "pr-8" : ""}
          `}
        />
        {clearable && value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            aria-label="Clear date and time"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

interface DateTimePickerCompactProps
  extends Omit<DateTimePickerProps, "label" | "clearable" | "className"> {
  /** HTML id attribute */
  id?: string;
  /** ARIA label for accessibility */
  "aria-label"?: string;
}

/**
 * Compact datetime picker for inline use (e.g., in forms).
 */
export function DateTimePickerCompact({
  value,
  onChange,
  disabled = false,
  min,
  max,
  id,
  "aria-label": ariaLabel,
}: DateTimePickerCompactProps) {
  return (
    <input
      type="datetime-local"
      id={id}
      value={toDateTimeLocal(value)}
      onChange={(e) => onChange(toISOString(e.target.value))}
      disabled={disabled}
      min={min ? toDateTimeLocal(min) : undefined}
      max={max ? toDateTimeLocal(max) : undefined}
      aria-label={ariaLabel}
      className="
        px-2 py-1 border border-gray-300 rounded
        text-gray-900 text-sm
        focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      "
    />
  );
}
