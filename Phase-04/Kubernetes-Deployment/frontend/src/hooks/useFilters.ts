"use client";

/**
 * Filter state management hook with URL sync.
 *
 * Task Reference: T075 [US4] - Create useFilters hook (005-todo-enhancements)
 * Task Reference: T088 [US5] - Add sort state to useFilters (005-todo-enhancements)
 * Feature: 005-todo-enhancements
 */

import { useState, useCallback, useMemo } from "react";
import type { FilterState, StatusFilter, SortBy, SortDirection } from "@/types/filters";
import type { Priority } from "@/types/todo";
import { getDefaultFilters, getActiveFilterCount } from "@/types/filters";

interface UseFiltersReturn {
  // State
  filters: FilterState;

  // Individual setters
  setSearch: (search: string) => void;
  setStatus: (status: StatusFilter) => void;
  setPriorities: (priorities: Priority[]) => void;
  setTagIds: (tagIds: string[]) => void;
  setDueBefore: (date: string | null) => void;
  setDueAfter: (date: string | null) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortDirection: (direction: SortDirection) => void;

  // Bulk operations
  clearFilters: () => void;

  // Computed
  activeFilterCount: number;
  hasActiveFilters: boolean;
}

/**
 * Hook for managing filter state.
 *
 * Features:
 * - Maintains filter state
 * - Provides individual and bulk update methods
 * - Calculates active filter count
 *
 * @example
 * const { filters, setSearch, clearFilters, activeFilterCount } = useFilters();
 */
export function useFilters(): UseFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters());

  // Individual setters
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setStatus = useCallback((status: StatusFilter) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setPriorities = useCallback((priorities: Priority[]) => {
    setFilters((prev) => ({ ...prev, priorities }));
  }, []);

  const setTagIds = useCallback((tagIds: string[]) => {
    setFilters((prev) => ({ ...prev, tagIds }));
  }, []);

  const setDueBefore = useCallback((dueBefore: string | null) => {
    setFilters((prev) => ({ ...prev, dueBefore }));
  }, []);

  const setDueAfter = useCallback((dueAfter: string | null) => {
    setFilters((prev) => ({ ...prev, dueAfter }));
  }, []);

  // Sort setters - T088 [US5]
  const setSortBy = useCallback((sortBy: SortBy) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const setSortDirection = useCallback((sortDirection: SortDirection) => {
    setFilters((prev) => ({ ...prev, sortDirection }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(getDefaultFilters());
  }, []);

  // Computed values
  const activeFilterCount = useMemo(
    () => getActiveFilterCount(filters),
    [filters]
  );

  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    setSearch,
    setStatus,
    setPriorities,
    setTagIds,
    setDueBefore,
    setDueAfter,
    setSortBy,
    setSortDirection,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
  };
}
