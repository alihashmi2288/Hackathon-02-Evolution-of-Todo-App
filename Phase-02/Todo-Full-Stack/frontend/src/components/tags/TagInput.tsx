"use client";

/**
 * Tag input component with autocomplete.
 *
 * Task Reference: T054 [US3] - Create TagInput component (005-todo-enhancements)
 * Task Reference: T092 [P] - Add keyboard navigation (005-todo-enhancements)
 * Feature: 005-todo-enhancements
 *
 * Provides a multi-select tag input with:
 * - Autocomplete suggestions from existing tags
 * - Ability to create new tags
 * - Visual tag chips for selected tags
 * - Full keyboard navigation (Arrow keys, Enter, Tab, Escape, Backspace)
 */

import { useState, useRef, useEffect, useCallback } from "react";
import type { Tag } from "@/types/tag";
import { TagBadge } from "./TagBadge";
import { api } from "@/services/api";

interface TagInputProps {
  /** Currently selected tag IDs */
  value: string[];
  /** Called when selection changes */
  onChange: (tagIds: string[]) => void;
  /** All available tags */
  availableTags: Tag[];
  /** Disabled state */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Callback when a new tag should be created */
  onCreateTag?: (name: string) => Promise<Tag | null>;
}

/**
 * Tag input with autocomplete and multi-select.
 */
export function TagInput({
  value,
  onChange,
  availableTags,
  disabled = false,
  placeholder = "Add tags...",
  onCreateTag,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected tags from IDs
  const selectedTags = availableTags.filter((tag) => value.includes(tag.id));

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() === "") {
      // Show all unselected tags
      setSuggestions(
        availableTags.filter((tag) => !value.includes(tag.id)).slice(0, 10)
      );
    } else {
      // Filter by prefix
      const filtered = availableTags.filter(
        (tag) =>
          !value.includes(tag.id) &&
          tag.name.toLowerCase().startsWith(inputValue.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 10));
    }
    setHighlightedIndex(-1);
  }, [inputValue, availableTags, value]);

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

  // Handle tag selection
  const selectTag = useCallback(
    (tag: Tag) => {
      onChange([...value, tag.id]);
      setInputValue("");
      setIsOpen(false);
      inputRef.current?.focus();
    },
    [onChange, value]
  );

  // Handle tag removal
  const removeTag = useCallback(
    (tagId: string) => {
      onChange(value.filter((id) => id !== tagId));
    },
    [onChange, value]
  );

  // Handle creating new tag
  const createNewTag = useCallback(async () => {
    if (!onCreateTag || inputValue.trim() === "") return;

    const newTag = await onCreateTag(inputValue.trim());
    if (newTag) {
      onChange([...value, newTag.id]);
      setInputValue("");
      setIsOpen(false);
    }
  }, [onCreateTag, inputValue, onChange, value]);

  // Check if we should show "create new" option (moved up for keyboard nav logic)
  const showCreateOption =
    onCreateTag &&
    inputValue.trim() !== "" &&
    !availableTags.some(
      (tag) => tag.name.toLowerCase() === inputValue.toLowerCase()
    );

  // Total selectable items including "create new" option
  const totalOptions = suggestions.length + (showCreateOption ? 1 : 0);
  const createOptionIndex = showCreateOption ? suggestions.length : -1;

  // Keyboard navigation - T092 [P]
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (e.key === "Backspace" && inputValue === "" && selectedTags.length > 0) {
      // Remove last tag
      removeTag(selectedTags[selectedTags.length - 1].id);
      return;
    }

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < totalOptions - 1 ? prev + 1 : prev
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case "Home":
        e.preventDefault();
        if (totalOptions > 0) {
          setHighlightedIndex(0);
        }
        break;

      case "End":
        e.preventDefault();
        if (totalOptions > 0) {
          setHighlightedIndex(totalOptions - 1);
        }
        break;

      case "Tab":
        // Tab selects highlighted and moves to next field
        if (highlightedIndex >= 0) {
          e.preventDefault();
          if (highlightedIndex === createOptionIndex) {
            createNewTag();
          } else if (suggestions[highlightedIndex]) {
            selectTag(suggestions[highlightedIndex]);
          }
        }
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          if (highlightedIndex === createOptionIndex) {
            createNewTag();
          } else if (suggestions[highlightedIndex]) {
            selectTag(suggestions[highlightedIndex]);
          }
        } else if (showCreateOption && inputValue.trim() !== "") {
          // No highlight but create option exists - create the tag
          createNewTag();
        }
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Selected tags and input */}
      <div
        className={`flex flex-wrap gap-1 min-h-[42px] px-3 py-2 border rounded-lg transition-colors ${disabled
          ? "bg-gray-100 border-gray-200 cursor-not-allowed"
          : "bg-white border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
          }`}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {/* Selected tag chips */}
        {selectedTags.map((tag) => (
          <TagBadge
            key={tag.id}
            tag={tag}
            size="sm"
            removable={!disabled}
            onRemove={() => removeTag(tag.id)}
          />
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={selectedTags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[100px] bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-500 disabled:cursor-not-allowed"
          aria-label="Search or add tags"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
      </div>

      {/* Dropdown suggestions */}
      {isOpen && !disabled && (suggestions.length > 0 || showCreateOption) && (
        <div
          className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-48 overflow-auto"
          role="listbox"
        >
          {suggestions.map((tag, index) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => selectTag(tag)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 text-gray-900 ${index === highlightedIndex ? "bg-blue-50" : ""
                }`}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </button>
          ))}

          {/* Create new tag option - T092 keyboard navigable */}
          {showCreateOption && (
            <button
              type="button"
              onClick={createNewTag}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 text-blue-600 ${highlightedIndex === createOptionIndex ? "bg-blue-50" : ""
                }`}
              role="option"
              aria-selected={highlightedIndex === createOptionIndex}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create &quot;{inputValue.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
