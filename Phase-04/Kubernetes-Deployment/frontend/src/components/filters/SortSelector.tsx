"use client";

/**
 * Sort selector component for todo list.
 *
 * Task Reference: T086 [US5] - Create SortSelector component (005-todo-enhancements)
 * Task Reference: T093 [P] - Add ARIA labels (005-todo-enhancements)
 * Feature: 005-todo-enhancements
 */

import type { SortBy, SortDirection } from "@/types/filters";

interface SortSelectorProps {
  sortBy: SortBy;
  sortDirection: SortDirection;
  onSortByChange: (sortBy: SortBy) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
  disabled?: boolean;
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "created_at", label: "Date Created" },
  { value: "due_date", label: "Due Date" },
  { value: "priority", label: "Priority" },
];

/**
 * Dropdown for selecting sort field and direction.
 */
export function SortSelector({
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
  disabled = false,
}: SortSelectorProps) {
  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label="Sort options"
    >
      {/* Sort by dropdown */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as SortBy)}
          disabled={disabled}
          className="appearance-none pl-3 pr-8 py-2 text-sm border border-primary-200 rounded-lg bg-white text-primary-900 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Sort by"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Sort direction toggle button */}
      <button
        type="button"
        onClick={() =>
          onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc")
        }
        disabled={disabled}
        className="inline-flex items-center justify-center p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label={`Sort ${sortDirection === "asc" ? "ascending" : "descending"}`}
        title={sortDirection === "asc" ? "Ascending" : "Descending"}
      >
        {sortDirection === "asc" ? (
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
