"use client";

/**
 * Empty state component for when user has no todos.
 *
 * Task Reference: T018 [US1] - Create EmptyState component
 * Feature: 004-frontend-todo-ui
 */

interface EmptyStateProps {
  onCreateClick?: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6 animate-fade-in">
      {/* Decorative illustration */}
      <div className="relative mx-auto w-24 h-24 mb-8">
        {/* Background glow */}
        <div className="absolute inset-0 bg-accent-200/50 rounded-full blur-xl" />

        {/* Icon container */}
        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-100 to-accent-200 flex items-center justify-center shadow-soft">
          <svg
            className="w-12 h-12 text-accent-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
      </div>

      {/* Message */}
      <h3 className="font-display text-2xl font-semibold text-white mb-3">
        Your slate is clean
      </h3>
      <p className="text-primary-300 max-w-sm mx-auto mb-8 leading-relaxed">
        Ready to be productive? Create your first task and start accomplishing great things.
      </p>

      {/* CTA */}
      {onCreateClick && (
        <button
          onClick={onCreateClick}
          className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-800 to-primary-950 text-white font-semibold rounded-xl shadow-soft-lg hover:shadow-glow transition-all hover:-translate-y-0.5"
        >
          <svg
            className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create your first task
        </button>
      )}
    </div>
  );
}
