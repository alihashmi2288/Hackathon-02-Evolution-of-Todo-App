"use client";

/**
 * Input component.
 *
 * Task Reference: T009 - Create Input component
 * Feature: 004-frontend-todo-ui
 */

import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/**
 * Reusable input component with label and error support.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = "", ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium mb-1.5 ${className.includes("text-white") ? "text-white/90" : "text-gray-600"}`}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-3 py-2 bg-input border rounded-lg text-gray-900 shadow-sm
              placeholder:text-gray-600
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error
                ? "border-danger focus:ring-danger"
                : "border-border hover:border-gray-400"
              }
              ${className}
            `}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
        </div>
        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="mt-1.5 text-xs text-text-muted"
          >
            {hint}
          </p>
        )}
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-xs text-danger flex items-center gap-1.5"
            role="alert"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
