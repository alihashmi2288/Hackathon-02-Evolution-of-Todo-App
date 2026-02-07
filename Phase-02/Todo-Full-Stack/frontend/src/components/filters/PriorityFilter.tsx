"use client";

/**
 * Priority filter component (multi-select).
 *
 * Task Reference: T071 [US4] - Create PriorityFilter component (005-todo-enhancements)
 * Feature: 005-todo-enhancements
 */

import type { Priority } from "@/types/todo";
import { PRIORITY_CONFIG } from "@/types/todo";

interface PriorityFilterProps {
  value: Priority[];
  onChange: (value: Priority[]) => void;
  disabled?: boolean;
}

const PRIORITIES: Priority[] = ["high", "medium", "low"];

/**
 * Multi-select priority filter with colored checkboxes.
 */
export function PriorityFilter({
  value,
  onChange,
  disabled = false,
}: PriorityFilterProps) {
  const togglePriority = (priority: Priority) => {
    if (value.includes(priority)) {
      onChange(value.filter((p) => p !== priority));
    } else {
      onChange([...value, priority]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by priority">
      {PRIORITIES.map((priority) => {
        const config = PRIORITY_CONFIG[priority];
        const isSelected = value.includes(priority);

        return (
          <button
            key={priority}
            type="button"
            onClick={() => togglePriority(priority)}
            disabled={disabled}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${isSelected
                ? "border-transparent"
                : "border-primary-200 bg-white text-primary-700 hover:bg-gray-50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            style={
              isSelected
                ? { backgroundColor: config.bgColor, color: config.color }
                : {}
            }
            aria-pressed={isSelected}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
