"use client";

/**
 * Toast notification component.
 *
 * Task Reference: T007 - Create Toast component
 * Feature: 004-frontend-todo-ui
 */

import { useToast } from "@/hooks/useToast";

/**
 * Toast container that displays all active toasts.
 * Place this component in your layout to show notifications.
 */
export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-20 right-4 z-50 flex flex-col gap-3"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg backdrop-blur-sm
            min-w-[300px] max-w-[420px] animate-slide-in-right
            border transition-all duration-300
            ${toast.type === "success"
              ? "bg-white border-green-500 shadow-green-500/10 text-gray-900"
              : ""
            }
            ${toast.type === "error"
              ? "bg-white border-red-500 shadow-red-500/10 text-gray-900"
              : ""
            }
            ${toast.type === "info"
              ? "bg-white border-blue-500 shadow-blue-500/10 text-gray-900"
              : ""
            }
          `}
          role="alert"
          aria-live="polite"
        >
          {/* Icon */}
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center shrink-0
            ${toast.type === "success" ? "bg-green-100 text-green-600" : ""}
            ${toast.type === "error" ? "bg-red-100 text-red-600" : ""}
            ${toast.type === "info" ? "bg-blue-100 text-blue-600" : ""}
          `}>
            {toast.type === "success" && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === "error" && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.type === "info" && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          {/* Message */}
          <p className="flex-1 text-sm font-medium">{toast.message}</p>

          {/* Dismiss button */}
          <button
            onClick={() => dismissToast(toast.id)}
            className={`
              p-1.5 rounded-lg transition-colors shrink-0
              hover:bg-gray-100 text-gray-400 hover:text-gray-600
            `}
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
