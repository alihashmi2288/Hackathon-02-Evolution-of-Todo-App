"use client";

/**
 * Tag filter component (multi-select).
 *
 * Task Reference: T072 [US4] - Create TagFilter component (005-todo-enhancements)
 * Feature: 005-todo-enhancements
 */

import type { Tag } from "@/types/tag";

interface TagFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
  tags: Tag[];
  disabled?: boolean;
}

/**
 * Get lighter background color for tag.
 */
function getLighterColor(hexColor: string, alpha: number = 0.15): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Multi-select tag filter with colored badges.
 */
export function TagFilter({
  value,
  onChange,
  tags,
  disabled = false,
}: TagFilterProps) {
  const toggleTag = (tagId: string) => {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };

  if (tags.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">No tags available</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tags">
      {tags.map((tag) => {
        const isSelected = value.includes(tag.id);

        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            disabled={disabled}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${isSelected
                ? "border-transparent"
                : "border-primary-200 bg-white text-primary-700 hover:bg-gray-50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            style={
              isSelected
                ? { backgroundColor: getLighterColor(tag.color), color: tag.color }
                : {}
            }
            aria-pressed={isSelected}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
