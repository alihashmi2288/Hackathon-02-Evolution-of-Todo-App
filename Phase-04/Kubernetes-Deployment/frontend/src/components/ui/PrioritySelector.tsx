"use client";

/**
 * Priority selector component.
 *
 * Task Reference: T038 [US2] - Create PrioritySelector component (005-todo-enhancements)
 * Feature: 005-todo-enhancements
 *
 * Provides a dropdown/button group for selecting todo priority levels.
 */

import { useState, useRef, useEffect } from "react";
import type { Priority } from "@/types/todo";
import { PRIORITY_CONFIG } from "@/types/todo";

interface PrioritySelectorProps {
  value: Priority | null;
  onChange: (value: Priority | null) => void;
  disabled?: boolean;
  /** Render as compact badge-style selector */
  compact?: boolean;
  /** Show "None" option to clear priority */
  clearable?: boolean;
}

const PRIORITIES: (Priority | null)[] = ["high", "medium", "low", null];

/**
 * Priority badge display component.
 */
export function PriorityBadge({
  priority,
  size = "sm",
}: {
  priority: Priority | null;
  size?: "xs" | "sm" | "md";
}) {
  if (!priority) return null;

  const config = PRIORITY_CONFIG[priority];
  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-xs",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]}`}
      style={{ backgroundColor: config.bgColor, color: config.color }}
    >
      <PriorityIcon priority={priority} className="w-3 h-3" />
      {config.label}
    </span>
  );
}

/**
 * Priority icon component.
 */
export function PriorityIcon({
  priority,
  className = "w-4 h-4",
}: {
  priority: Priority;
  className?: string;
}) {
  const config = PRIORITY_CONFIG[priority];

  // Flag/flag icon style indicator
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke={config.color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

/**
 * Priority selector dropdown component.
 */
export function PrioritySelector({
  value,
  onChange,
  disabled = false,
  compact = false,
  clearable = true,
}: PrioritySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelect = (priority: Priority | null) => {
    onChange(priority);
    setIsOpen(false);
  };

  const options = clearable ? PRIORITIES : PRIORITIES.filter((p) => p !== null);

  if (compact) {
    return (
      <div ref={containerRef} className="relative inline-block">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex items-center gap-1 px-2 py-1 rounded border text-sm transition-colors ${disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-gray-50 border-gray-300"
            }`}
          aria-label="Select priority"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          {value ? (
            <>
              <PriorityIcon priority={value} className="w-3.5 h-3.5" />
              <span style={{ color: PRIORITY_CONFIG[value].color }}>
                {PRIORITY_CONFIG[value].label}
              </span>
            </>
          ) : (
            <span className="text-gray-500">Priority</span>
          )}
          <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {isOpen && (
          <div
            className="absolute z-10 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
            role="listbox"
          >
            {options.map((priority) => (
              <button
                key={priority ?? "none"}
                type="button"
                onClick={() => handleSelect(priority)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 ${value === priority ? "bg-gray-50" : ""
                  }`}
                role="option"
                aria-selected={value === priority}
              >
                {priority ? (
                  <>
                    <PriorityIcon priority={priority} className="w-4 h-4" />
                    <span style={{ color: PRIORITY_CONFIG[priority].color }}>
                      {PRIORITY_CONFIG[priority].label}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500">None</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full-size selector for forms
  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${disabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
          : "bg-white hover:bg-gray-50 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          }`}
        aria-label="Select priority"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flex items-center gap-2">
          {value ? (
            <>
              <PriorityIcon priority={value} className="w-4 h-4" />
              <span style={{ color: PRIORITY_CONFIG[value].color }}>
                {PRIORITY_CONFIG[value].label}
              </span>
            </>
          ) : (
            <span className="text-gray-500">Select priority...</span>
          )}
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1"
          role="listbox"
        >
          {options.map((priority) => (
            <button
              key={priority ?? "none"}
              type="button"
              onClick={() => handleSelect(priority)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-gray-900 ${value === priority ? "bg-blue-50" : ""
                }`}
              role="option"
              aria-selected={value === priority}
            >
              {priority ? (
                <>
                  <PriorityIcon priority={priority} className="w-4 h-4" />
                  <span style={{ color: PRIORITY_CONFIG[priority].color }}>
                    {PRIORITY_CONFIG[priority].label}
                  </span>
                </>
              ) : (
                <span className="text-gray-500">None</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Chevron down icon.
 */
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}
