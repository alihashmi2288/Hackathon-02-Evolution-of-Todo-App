/**
 * Todo API Contract Types
 *
 * Feature: 004-frontend-todo-ui
 * Date: 2026-01-17
 *
 * This file defines the TypeScript types for the Todo API contract.
 * These types match the backend API from SPEC-003 (FastAPI).
 *
 * Backend Reference: backend/app/schemas/todo.py
 * Backend Router: backend/app/routers/todos.py
 */

// =============================================================================
// Core Entity Types
// =============================================================================

/**
 * Todo item as returned by the backend API.
 *
 * @example
 * {
 *   "id": "V1StGXR8_Z5jdHi6B-myT",
 *   "title": "Buy groceries",
 *   "description": "Milk, eggs, bread",
 *   "completed": false,
 *   "user_id": "user_abc123",
 *   "created_at": "2026-01-17T10:30:00Z",
 *   "updated_at": "2026-01-17T10:30:00Z"
 * }
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
}

// =============================================================================
// Request Types
// =============================================================================

/**
 * Request payload for POST /todos
 *
 * @example
 * {
 *   "title": "Buy groceries",
 *   "description": "Milk, eggs, bread"
 * }
 */
export interface TodoCreateRequest {
  /** Task title (required, 1-255 chars, cannot be whitespace only) */
  title: string;

  /** Optional detailed description */
  description?: string;
}

/**
 * Request payload for PATCH /todos/{id}
 * All fields are optional - only provided fields are updated.
 *
 * @example
 * {
 *   "completed": true
 * }
 */
export interface TodoUpdateRequest {
  /** Updated title (1-255 chars) */
  title?: string;

  /** Updated description */
  description?: string;

  /** Updated completion status */
  completed?: boolean;
}

// =============================================================================
// Response Types
// =============================================================================

/**
 * Response from GET /todos
 * Returns array of todos sorted by created_at descending (newest first).
 */
export type TodoListResponse = Todo[];

/**
 * Response from POST /todos (201 Created)
 * Returns the created todo with generated id and timestamps.
 */
export type TodoCreateResponse = Todo;

/**
 * Response from GET /todos/{id}
 * Returns the todo if found and owned by user.
 */
export type TodoGetResponse = Todo;

/**
 * Response from PATCH /todos/{id}
 * Returns the updated todo with new updated_at timestamp.
 */
export type TodoUpdateResponse = Todo;

/**
 * Response from DELETE /todos/{id}
 * Returns 204 No Content on success.
 */
export type TodoDeleteResponse = void;

// =============================================================================
// Error Types
// =============================================================================

/**
 * Standard API error response.
 * Matches backend error taxonomy from SPEC-001.
 *
 * @example
 * {
 *   "error": "VALIDATION_ERROR",
 *   "message": "Title cannot be empty",
 *   "timestamp": "2026-01-17T10:30:00Z"
 * }
 */
export interface ApiErrorResponse {
  /** Error code (e.g., "VALIDATION_ERROR", "RESOURCE_NOT_FOUND") */
  error: string;

  /** Human-readable error message */
  message: string;

  /** ISO 8601 timestamp */
  timestamp: string;

  /** Optional request ID for debugging */
  request_id?: string;

  /** Optional additional details */
  details?: Record<string, unknown>;
}

/**
 * Validation error for 400/422 responses (Pydantic format).
 */
export interface ValidationError {
  detail: ValidationErrorDetail[];
}

export interface ValidationErrorDetail {
  /** Location of the error (e.g., ["body", "title"]) */
  loc: (string | number)[];

  /** Error message */
  msg: string;

  /** Error type (e.g., "value_error", "string_too_short") */
  type: string;
}

// =============================================================================
// API Endpoint Definitions
// =============================================================================

/**
 * Todo API Endpoints
 *
 * Base URL: ${NEXT_PUBLIC_API_URL}
 *
 * All endpoints require JWT authentication via Authorization header.
 */
export const TODO_ENDPOINTS = {
  /** GET /todos - List all todos for current user */
  LIST: '/todos',

  /** POST /todos - Create a new todo */
  CREATE: '/todos',

  /** GET /todos/{id} - Get a specific todo */
  GET: (id: string) => `/todos/${id}`,

  /** PATCH /todos/{id} - Update a todo */
  UPDATE: (id: string) => `/todos/${id}`,

  /** DELETE /todos/{id} - Delete a todo */
  DELETE: (id: string) => `/todos/${id}`,
} as const;

// =============================================================================
// HTTP Status Codes
// =============================================================================

/**
 * Expected HTTP status codes for each endpoint.
 */
export const TODO_STATUS_CODES = {
  LIST: { success: 200 },
  CREATE: { success: 201, validation_error: 400 },
  GET: { success: 200, not_found: 404 },
  UPDATE: { success: 200, validation_error: 400, not_found: 404 },
  DELETE: { success: 204, not_found: 404 },
  // Common across all endpoints
  COMMON: { unauthorized: 401 },
} as const;
