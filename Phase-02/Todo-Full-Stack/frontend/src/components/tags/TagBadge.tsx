"use client";

/**
 * Tag badge component for displaying tags.
 *
 * Task Reference: T053 [US3] - Create TagBadge component (005-todo-enhancements)
 * Feature: 005-todo-enhancements
 *
 * Displays a color-coded badge for a tag.
 */

import type { Tag } from "@/types/tag";

interface TagBadgeProps {
  tag: Tag;
  size?: "xs" | "sm" | "md";
  /** Show remove button */
  removable?: boolean;
  onRemove?: () => void;
}

/**
 * Get contrasting text color for a background color.
 * Uses relative luminance formula for accessibility.
 */
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#1F2937" : "#FFFFFF";
}

/**
 * Get lighter background color for badge.
 */
function getLighterColor(hexColor: string, alpha: number = 0.15): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Tag badge component with color-coded display.
 */
export function TagBadge({
  tag,
  size = "sm",
  removable = false,
  onRemove,
}: TagBadgeProps) {
  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-xs",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  const textColor = "#111827"; // Dark gray-900 for high contrast
  const bgColor = getLighterColor(tag.color);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: tag.color }}
        aria-hidden="true"
      />
      <span className="text-gray-900">{tag.name}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-70 focus:outline-none"
          aria-label={`Remove tag ${tag.name}`}
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

/**
 * Compact tag list for display in todo items.
 */
export function TagList({
  tags,
  maxVisible = 3,
  size = "xs",
}: {
  tags: Tag[];
  maxVisible?: number;
  size?: "xs" | "sm" | "md";
}) {
  if (!tags || tags.length === 0) return null;

  const visibleTags = tags.slice(0, maxVisible);
  const remainingCount = tags.length - maxVisible;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visibleTags.map((tag) => (
        <TagBadge key={tag.id} tag={tag} size={size} />
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-gray-500">+{remainingCount} more</span>
      )}
    </div>
  );
}
