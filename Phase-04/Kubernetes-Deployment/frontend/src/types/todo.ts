/**
 * Todo type definitions.
 *
 * Task Reference: T003 - Create Todo types per data-model.md (004-frontend-todo-ui)
 * Task Reference: T014 - Extend Todo type with due_date, priority, tags (005-todo-enhancements)
 * Task Reference: T046 - Extend Todo type for recurrence (006-recurring-reminders)
 * Feature: 004-frontend-todo-ui, 005-todo-enhancements, 006-recurring-reminders
 */

import type { Tag } from "./tag";
import type { RecurrenceConfig } from "./recurrence";

/**
 * Priority levels for todos.
 * Matches backend Priority enum.
 */
export type Priority = "high" | "medium" | "low";

/**
 * Priority display configuration.
 */
export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bgColor: string }
> = {
  high: {
    label: "High",
    color: "#EF4444", // red-500
    bgColor: "#FEE2E2", // red-100
  },
  medium: {
    label: "Medium",
    color: "#EAB308", // yellow-500
    bgColor: "#FEF3C7", // yellow-100
  },
  low: {
    label: "Low",
    color: "#6B7280", // gray-500
    bgColor: "#F3F4F6", // gray-100
  },
};

/**
 * Todo item as returned by the backend API.
 */
export interface Todo {
  /** Unique identifier (nanoid, 21 chars) */
  id: string;

  /** Task title (1-255 chars, required) */
  title: string;

  /** Optional detailed description */
  description: string | null;

  /** Completion status */
  completed: boolean;

  /** Owner's user ID */
  user_id: string;

  /** Creation timestamp (ISO 8601, UTC) */
  created_at: string;

  /** Last update timestamp (ISO 8601, UTC) */
  updated_at: string;

  // NEW fields for 005-todo-enhancements
  /** Optional deadline date and time (ISO 8601 format) */
  due_date: string | null;

  /** Optional priority level */
  priority: Priority | null;

  /** Tags assigned to this todo */
  tags: Tag[];

  // NEW fields for 006-recurring-reminders
  /** Whether this todo recurs */
  is_recurring: boolean;

  /** RFC 5545 RRULE string for recurrence pattern */
  rrule: string | null;

  /** Date when recurrence ends (if set) */
  recurrence_end_date: string | null;

  /** Date of the next pending occurrence */
  next_occurrence_date: string | null;

  /** ID of the current/next pending occurrence (for T077 [US4]) */
  current_occurrence_id: string | null;

  /** Status of the current occurrence (for T078 [US4]) */
  current_occurrence_status: "pending" | "completed" | "skipped" | null;
}

/**
 * Request payload for POST /todos
 */
export interface TodoCreate {
  /** Task title (required, 1-255 chars) */
  title: string;

  /** Optional detailed description */
  description?: string;

  // NEW fields for 005-todo-enhancements
  /** Optional deadline date and time (ISO 8601 format) */
  due_date?: string | null;

  /** Optional priority level */
  priority?: Priority | null;

  /** Optional list of tag IDs to assign */
  tag_ids?: string[];

  // NEW fields for 006-recurring-reminders
  /** Optional recurrence configuration */
  recurrence?: RecurrenceConfig | null;
}

/**
 * Request payload for PATCH /todos/{id}
 * All fields are optional.
 */
export interface TodoUpdate {
  /** Updated title */
  title?: string;

  /** Updated description */
  description?: string;

  /** Updated completion status */
  completed?: boolean;

  // NEW fields for 005-todo-enhancements
  /** Updated deadline date and time (ISO 8601 format, or null to clear) */
  due_date?: string | null;

  /** Updated priority level (or null to clear) */
  priority?: Priority | null;

  /** Updated list of tag IDs (replaces existing tags) */
  tag_ids?: string[];
}

/**
 * State managed by useTodos hook
 */
export interface TodosState {
  /** List of todos */
  todos: Todo[];

  /** Loading state for initial fetch */
  isLoading: boolean;

  /** Loading state for mutations */
  isMutating: boolean;

  /** Error message if last operation failed */
  error: string | null;
}

/**
 * Tracks which todo is being edited
 */
export interface EditingState {
  /** ID of todo being edited, null if not editing */
  todoId: string | null;

  /** Form values for editing */
  formValues: {
    title: string;
    description: string;
    due_date: string | null;
    priority: Priority | null;
    tag_ids: string[];
  } | null;
}

/**
 * Toast notification type
 */
export type ToastType = "success" | "error" | "info";

/**
 * Toast notification data
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
