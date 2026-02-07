/**
 * Tag type definitions.
 *
 * Task Reference: T015 - Create Tag and TagCreate/TagUpdate types
 * Feature: 005-todo-enhancements
 */

/**
 * Predefined color palette for tags.
 * Matches backend TAG_COLOR_PALETTE.
 */
export const TAG_COLOR_PALETTE = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#6B7280", // gray
] as const;

/**
 * Default tag color (Tailwind blue-500).
 */
export const DEFAULT_TAG_COLOR = "#3B82F6";

/**
 * Tag as returned by the backend API.
 */
export interface Tag {
  /** Unique identifier (nanoid, 21 chars) */
  id: string;

  /** Tag display name (1-50 chars) */
  name: string;

  /** Hex color code (#RRGGBB) */
  color: string;

  /** Owner's user ID */
  user_id: string;

  /** Creation timestamp (ISO 8601, UTC) */
  created_at: string;

  /** Last update timestamp (ISO 8601, UTC) */
  updated_at: string;
}

/**
 * Tag with todo count for list views.
 */
export interface TagWithCount extends Tag {
  /** Number of todos using this tag */
  todo_count: number;
}

/**
 * Request payload for POST /tags
 */
export interface TagCreate {
  /** Tag name (required, 1-50 chars) */
  name: string;

  /** Hex color code (optional, defaults to blue) */
  color?: string;
}

/**
 * Request payload for PATCH /tags/{id}
 * All fields are optional.
 */
export interface TagUpdate {
  /** Updated tag name */
  name?: string;

  /** Updated hex color code */
  color?: string;
}

/**
 * State managed by useTags hook
 */
export interface TagsState {
  /** List of tags */
  tags: TagWithCount[];

  /** Loading state for initial fetch */
  isLoading: boolean;

  /** Loading state for mutations */
  isMutating: boolean;

  /** Error message if last operation failed */
  error: string | null;
}
