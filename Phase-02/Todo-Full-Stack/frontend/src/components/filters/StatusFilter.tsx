"use client";

/**
 * Status filter component.
 *
 * Task Reference: T070 [US4] - Create StatusFilter component (005-todo-enhancements)
 * Feature: 005-todo-enhancements
 */

import type { StatusFilter as StatusFilterType } from "@/types/filters";

interface StatusFilterProps {
  value: StatusFilterType;
  onChange: (value: StatusFilterType) => void;
  disabled?: boolean;
}

const STATUS_OPTIONS: { value: StatusFilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

/**
 * Toggle button group for filtering by completion status.
 */
export function StatusFilter({
  value,
  onChange,
  disabled = false,
}: StatusFilterProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50"
      role="group"
      aria-label="Filter by status"
    >
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${value === option.value
              ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-100"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
