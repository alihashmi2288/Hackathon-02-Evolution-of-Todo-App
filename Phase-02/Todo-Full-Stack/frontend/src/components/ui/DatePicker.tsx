"use client";

/**
 * DatePicker component for due date selection.
 *
 * Task Reference: T025 [US1] - Create DatePicker component
 * Feature: 005-todo-enhancements
 *
 * Uses native HTML5 date input with progressive enhancement.
 */

import { type ChangeEvent } from "react";
import { getTodayString } from "@/lib/date-utils";

interface DatePickerProps {
  /** Current value (YYYY-MM-DD format or empty) */
  value: string | null;

  /** Callback when date changes */
  onChange: (value: string | null) => void;

  /** Field label */
  label?: string;

  /** Placeholder text */
  placeholder?: string;

  /** Disable the input */
  disabled?: boolean;

  /** Minimum selectable date (YYYY-MM-DD) */
  min?: string;

  /** Maximum selectable date (YYYY-MM-DD) */
  max?: string;

  /** Allow clearing the date */
  clearable?: boolean;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Date picker input for selecting due dates.
 *
 * Features:
 * - Native HTML5 date input for best mobile UX
 * - Optional clear button
 * - Min/max date constraints
 * - Accessible labeling
 */
export function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Select date",
  disabled = false,
  min,
  max,
  clearable = true,
  className = "",
}: DatePickerProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue || null);
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
          type="date"
          value={value || ""}
          onChange={handleChange}
          disabled={disabled}
          min={min}
          max={max}
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
            aria-label="Clear date"
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

interface DatePickerCompactProps
  extends Omit<DatePickerProps, "label" | "clearable" | "className"> {
  /** HTML id attribute */
  id?: string;
  /** ARIA label for accessibility */
  "aria-label"?: string;
}

/**
 * Compact date picker for inline use (e.g., in forms).
 * Task Reference: T093 [P] - ARIA support
 */
export function DatePickerCompact({
  value,
  onChange,
  disabled = false,
  min,
  max,
  id,
  "aria-label": ariaLabel,
}: DatePickerCompactProps) {
  return (
    <input
      type="date"
      id={id}
      value={value || ""}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={disabled}
      min={min}
      max={max}
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
