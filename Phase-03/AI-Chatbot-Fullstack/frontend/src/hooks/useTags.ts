"use client";

/**
 * Tags state management hook.
 *
 * Task Reference: T056 [US3] - Create useTags hook (005-todo-enhancements)
 * Task Reference: T095 [P] - Error handling for tag operations (005-todo-enhancements)
 * Feature: 005-todo-enhancements
 *
 * Manages tag state and CRUD operations with proper error handling.
 * All operations catch ApiClientError for structured error messages
 * and generic errors as fallback.
 */

import { useState, useCallback, useEffect } from "react";
import { api, ApiClientError } from "@/services/api";
import type { Tag, TagCreate, TagUpdate, TagWithCount } from "@/types/tag";
import { TAG_COLOR_PALETTE } from "@/types/tag";

interface UseTagsReturn {
  // State
  tags: TagWithCount[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  // Actions
  fetchTags: () => Promise<void>;
  createTag: (data: TagCreate) => Promise<Tag | null>;
  updateTag: (id: string, data: TagUpdate) => Promise<Tag | null>;
  deleteTag: (id: string) => Promise<boolean>;

  // Helpers
  getNextColor: () => string;
  getTagById: (id: string) => Tag | undefined;
}

/**
 * Hook for managing tag state and operations.
 *
 * Features:
 * - Fetch tags on mount
 * - CRUD operations with loading/error states
 * - Color palette rotation
 *
 * @example
 * const { tags, isLoading, createTag, deleteTag } = useTags();
 */
export function useTags(): UseTagsReturn {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [colorIndex, setColorIndex] = useState(0);

  /**
   * Fetch all tags for the current user.
   */
  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.tags.list();
      setTags(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.error.message);
      } else {
        setError("Failed to load tags");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new tag.
   */
  const createTag = useCallback(
    async (data: TagCreate): Promise<Tag | null> => {
      setIsMutating(true);
      setError(null);

      try {
        const newTag = await api.tags.create(data);
        // Add to list with count of 0
        setTags((prev) =>
          [...prev, { ...newTag, todo_count: 0 }].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );
        // Advance color index
        setColorIndex((prev) => (prev + 1) % TAG_COLOR_PALETTE.length);
        return newTag;
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.error.message);
        } else {
          setError("Failed to create tag");
        }
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  /**
   * Update an existing tag.
   */
  const updateTag = useCallback(
    async (id: string, data: TagUpdate): Promise<Tag | null> => {
      setIsMutating(true);
      setError(null);

      try {
        const updated = await api.tags.update(id, data);
        setTags((prev) =>
          prev
            .map((t) => (t.id === id ? { ...t, ...updated } : t))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        return updated;
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.error.message);
        } else {
          setError("Failed to update tag");
        }
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  /**
   * Delete a tag.
   */
  const deleteTag = useCallback(async (id: string): Promise<boolean> => {
    setIsMutating(true);
    setError(null);

    try {
      await api.tags.delete(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.error.message);
      } else {
        setError("Failed to delete tag");
      }
      return false;
    } finally {
      setIsMutating(false);
    }
  }, []);

  /**
   * Get next color from palette rotation.
   */
  const getNextColor = useCallback(() => {
    return TAG_COLOR_PALETTE[colorIndex % TAG_COLOR_PALETTE.length];
  }, [colorIndex]);

  /**
   * Get a tag by ID.
   */
  const getTagById = useCallback(
    (id: string) => {
      return tags.find((t) => t.id === id);
    },
    [tags]
  );

  // Fetch tags on mount
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    isLoading,
    isMutating,
    error,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    getNextColor,
    getTagById,
  };
}
