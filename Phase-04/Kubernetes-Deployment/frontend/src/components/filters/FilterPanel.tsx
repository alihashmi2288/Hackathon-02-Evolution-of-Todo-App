"use client";

/**
 * Filter panel container component.
 *
 * Task Reference: T074 [US4] - Create FilterPanel container (005-todo-enhancements)
 * Task Reference: T076 [US4] - Add active filter count display (005-todo-enhancements)
 * Task Reference: T077 [US4] - Add "Clear all filters" button (005-todo-enhancements)
 * Task Reference: T087 [US5] - Add SortSelector to FilterPanel (005-todo-enhancements)
 * Task Reference: T090 [P] - Add mobile-responsive styling (005-todo-enhancements)
 * Feature: 005-todo-enhancements
 */

import { useState } from "react";
import { SearchInput } from "./SearchInput";
import { StatusFilter } from "./StatusFilter";
import { PriorityFilter } from "./PriorityFilter";
import { TagFilter } from "./TagFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import { SortSelector } from "./SortSelector";
import { Button } from "@/components/ui/Button";
import type { FilterState, StatusFilter as StatusFilterType, SortBy, SortDirection } from "@/types/filters";
import type { Priority } from "@/types/todo";
import type { Tag } from "@/types/tag";

interface FilterPanelProps {
  filters: FilterState;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: StatusFilterType) => void;
  onPrioritiesChange: (priorities: Priority[]) => void;
  onTagIdsChange: (tagIds: string[]) => void;
  onDueBeforeChange: (date: string | null) => void;
  onDueAfterChange: (date: string | null) => void;
  onSortByChange: (sortBy: SortBy) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  tags: Tag[];
  disabled?: boolean;
}

/**
 * Collapsible filter panel with all filter options.
 */
export function FilterPanel({
  filters,
  onSearchChange,
  onStatusChange,
  onPrioritiesChange,
  onTagIdsChange,
  onDueBeforeChange,
  onDueAfterChange,
  onSortByChange,
  onSortDirectionChange,
  onClearFilters,
  activeFilterCount,
  tags,
  disabled = false,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-card rounded-lg border border-white/20 shadow-sm">
      {/* Header with search and controls - T090 mobile responsive */}
      <div className="p-3 sm:p-4">
        {/* Search input - full width on mobile */}
        <div className="mb-3">
          <SearchInput
            value={filters.search}
            onChange={onSearchChange}
            disabled={disabled}
          />
        </div>

        {/* Controls row - horizontal scroll on mobile if needed */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
          {/* Status filter */}
          <div className="order-1 sm:order-none">
            <StatusFilter
              value={filters.status}
              onChange={onStatusChange}
              disabled={disabled}
            />
          </div>

          {/* Sort selector - T087 [US5] */}
          <div className="order-2 sm:order-none">
            <SortSelector
              sortBy={filters.sortBy}
              sortDirection={filters.sortDirection}
              onSortByChange={onSortByChange}
              onSortDirectionChange={onSortDirectionChange}
              disabled={disabled}
            />
          </div>

          {/* Spacer - push filter toggle to right on larger screens */}
          <div className="hidden sm:block flex-1" />

          {/* Expand/collapse toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="order-3 sm:order-none inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-200 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors min-h-[40px] touch-manipulation"
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="hidden xs:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
                {activeFilterCount}
              </span>
            )}
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""
                }`}
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
          </button>
        </div>
      </div>

      {/* Expanded filter options - T090 responsive grid */}
      {isExpanded && (
        <div className="border-t border-white/10 p-3 sm:p-4">
          {/* Responsive grid for filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Priority filter */}
            <div>
              <h3 className="text-sm font-medium text-primary-200 mb-2">Priority</h3>
              <PriorityFilter
                value={filters.priorities}
                onChange={onPrioritiesChange}
                disabled={disabled}
              />
            </div>

            {/* Tag filter */}
            {tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-primary-200 mb-2">Tags</h3>
                <TagFilter
                  value={filters.tagIds}
                  onChange={onTagIdsChange}
                  tags={tags}
                  disabled={disabled}
                />
              </div>
            )}

            {/* Due date range */}
            <div className={tags.length === 0 ? "sm:col-span-2 lg:col-span-1" : ""}>
              <h3 className="text-sm font-medium text-primary-200 mb-2">Due Date</h3>
              <DateRangeFilter
                dueBefore={filters.dueBefore}
                dueAfter={filters.dueAfter}
                onDueBeforeChange={onDueBeforeChange}
                onDueAfterChange={onDueAfterChange}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Clear all filters - T077 */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                disabled={disabled}
                className="min-h-[40px] touch-manipulation"
              >
                <svg
                  className="w-4 h-4 mr-1"
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
                Clear all filters ({activeFilterCount})
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
