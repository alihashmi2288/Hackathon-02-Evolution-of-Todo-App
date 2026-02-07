/**
 * Spinner component.
 *
 * Task Reference: T010 - Create Spinner component
 * Feature: 004-frontend-todo-ui
 */

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Loading spinner component.
 */
export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeStyles = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`${sizeStyles[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <svg
        className="animate-spin text-accent"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
