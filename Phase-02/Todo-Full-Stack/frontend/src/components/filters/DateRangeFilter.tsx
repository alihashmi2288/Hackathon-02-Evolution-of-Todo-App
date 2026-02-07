"use client";

/**
 * Date range filter component.
 *
 * Task Reference: T073 [US4] - Create DateRangeFilter component (005-todo-enhancements)
 * Task Reference: T093 [P] - Add ARIA labels (005-todo-enhancements)
 * Feature: 005-todo-enhancements
 */

import { DatePickerCompact } from "@/components/ui/DatePicker";

interface DateRangeFilterProps {
  dueBefore: string | null;
  dueAfter: string | null;
  onDueBeforeChange: (value: string | null) => void;
  onDueAfterChange: (value: string | null) => void;
  disabled?: boolean;
}

/**
 * Date range filter with from/to date pickers.
 */
export function DateRangeFilter({
  dueBefore,
  dueAfter,
  onDueBeforeChange,
  onDueAfterChange,
  disabled = false,
}: DateRangeFilterProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 sm:gap-4"
      role="group"
      aria-label="Filter by due date range"
    >
      <div className="flex items-center gap-2">
        <label htmlFor="due-after" className="text-sm text-primary-200">
          From:
        </label>
        <DatePickerCompact
          value={dueAfter}
          onChange={onDueAfterChange}
          disabled={disabled}
          id="due-after"
          aria-label="Due date from"
        />
        {dueAfter && (
          <button
            type="button"
            onClick={() => onDueAfterChange(null)}
            className="text-gray-400 hover:text-gray-600 text-xs"
            disabled={disabled}
            aria-label="Clear from date"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="due-before" className="text-sm text-primary-200">
          To:
        </label>
        <DatePickerCompact
          value={dueBefore}
          onChange={onDueBeforeChange}
          disabled={disabled}
          id="due-before"
          aria-label="Due date to"
        />
        {dueBefore && (
          <button
            type="button"
            onClick={() => onDueBeforeChange(null)}
            className="text-gray-400 hover:text-gray-600 text-xs"
            disabled={disabled}
            aria-label="Clear to date"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
