/**
 * Filter type definitions.
 *
 * Task Reference: T016 - Create FilterState type
 * Feature: 005-todo-enhancements
 */

import type { Priority } from "./todo";

/**
 * Todo status filter options.
 */
export type StatusFilter = "all" | "active" | "completed";

/**
 * Sort options for todos.
 */
export type SortBy = "created_at" | "due_date" | "priority";

/**
 * Sort direction.
 */
export type SortDirection = "asc" | "desc";

/**
 * Filter state for todo list.
 * Persisted to URL query params.
 */
export interface FilterState {
  /** Text search query (searches title and description) */
  search: string;

  /** Filter by priorities (multi-select) */
  priorities: Priority[];

  /** Filter by tag IDs (multi-select) */
  tagIds: string[];

  /** Filter by due date before (inclusive) */
  dueBefore: string | null;

  /** Filter by due date after (inclusive) */
  dueAfter: string | null;

  /** Filter by completion status */
  status: StatusFilter;

  /** Sort field */
  sortBy: SortBy;

  /** Sort direction */
  sortDirection: SortDirection;
}

/**
 * Default filter state.
 */
export const DEFAULT_FILTER_STATE: FilterState = {
  search: "",
  priorities: [],
  tagIds: [],
  dueBefore: null,
  dueAfter: null,
  status: "all",
  sortBy: "created_at",
  sortDirection: "desc",
};

/**
 * Get a fresh copy of default filters.
 */
export function getDefaultFilters(): FilterState {
  return { ...DEFAULT_FILTER_STATE };
}

/**
 * Get count of active filters (alias for countActiveFilters).
 */
export function getActiveFilterCount(filters: FilterState): number {
  return countActiveFilters(filters);
}

/**
 * Check if any filters are active (non-default).
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.search !== "" ||
    filters.priorities.length > 0 ||
    filters.tagIds.length > 0 ||
    filters.dueBefore !== null ||
    filters.dueAfter !== null ||
    filters.status !== "all"
  );
}

/**
 * Count the number of active filters.
 */
export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.search !== "") count++;
  if (filters.priorities.length > 0) count++;
  if (filters.tagIds.length > 0) count++;
  if (filters.dueBefore !== null || filters.dueAfter !== null) count++;
  if (filters.status !== "all") count++;
  return count;
}

/**
 * API query params derived from filter state.
 */
export interface FilterQueryParams {
  search?: string;
  priority?: string[]; // array of priority values
  tag?: string[]; // array of tag IDs
  due_before?: string;
  due_after?: string;
  status?: StatusFilter;
  sort?: string; // format: "field:direction"
}

/**
 * Convert filter state to API query params.
 */
export function filterStateToQueryParams(
  filters: FilterState
): FilterQueryParams {
  const params: FilterQueryParams = {};

  if (filters.search) {
    params.search = filters.search;
  }

  if (filters.priorities.length > 0) {
    params.priority = filters.priorities;
  }

  if (filters.tagIds.length > 0) {
    params.tag = filters.tagIds;
  }

  if (filters.dueBefore) {
    params.due_before = filters.dueBefore;
  }

  if (filters.dueAfter) {
    params.due_after = filters.dueAfter;
  }

  if (filters.status !== "all") {
    params.status = filters.status;
  }

  // Only include sort if not default
  if (filters.sortBy !== "created_at" || filters.sortDirection !== "desc") {
    params.sort = `${filters.sortBy}:${filters.sortDirection}`;
  }

  return params;
}
