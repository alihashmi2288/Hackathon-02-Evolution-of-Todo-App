"use client";

/**
 * Todo completion toggle component.
 *
 * Task Reference: T029 [US3] - Create TodoToggle component
 * Task Reference: T030 [US3] - Add checkbox with ARIA attributes
 * Task Reference: T055 [US7] - Touch-friendly checkbox (44px touch target)
 * Feature: 004-frontend-todo-ui
 */

interface TodoToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}

/**
 * Accessible checkbox toggle for todo completion.
 */
export function TodoToggle({
  checked,
  onChange,
  label,
  disabled = false,
}: TodoToggleProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={`Mark "${label}" as ${checked ? "incomplete" : "complete"}`}
      onClick={onChange}
      disabled={disabled}
      className={`
        relative w-6 h-6 rounded-lg flex items-center justify-center
        transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-400
        min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0
        ${
          checked
            ? "bg-gradient-to-br from-success-400 to-success-600 border-0 shadow-sm"
            : "bg-white border-2 border-primary-300 hover:border-accent-400 hover:shadow-sm"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {checked && (
        <svg
          className="w-3.5 h-3.5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
      {!checked && (
        <span className="absolute inset-0 rounded-lg transition-colors hover:bg-accent-50" />
      )}
    </button>
  );
}
