# Data Model: Frontend Todo UI

**Feature**: 004-frontend-todo-ui
**Date**: 2026-01-17

## Overview

This document defines the TypeScript interfaces and types used in the frontend Todo UI. These types mirror the backend API contract from SPEC-003 and provide type safety for frontend development.

## Core Entities

### Todo

The main entity representing a todo item.

```typescript
/**
 * Todo item as returned by the backend API.
 * Matches backend/app/schemas/todo.py TodoResponse
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
```

### TodoCreate

Request body for creating a new todo.

```typescript
/**
 * Request payload for POST /todos
 * Matches backend/app/schemas/todo.py TodoCreate
 */
export interface TodoCreate {
  /** Task title (required, 1-255 chars) */
  title: string;

  /** Optional detailed description */
  description?: string;
}
```

### TodoUpdate

Request body for updating an existing todo.

```typescript
/**
 * Request payload for PATCH /todos/{id}
 * Matches backend/app/schemas/todo.py TodoUpdate
 * All fields are optional - only provided fields are updated.
 */
export interface TodoUpdate {
  /** Updated title (1-255 chars) */
  title?: string;

  /** Updated description */
  description?: string;

  /** Updated completion status */
  completed?: boolean;
}
```

## UI State Types

### TodosState

State shape for the useTodos hook.

```typescript
/**
 * State managed by useTodos hook
 */
export interface TodosState {
  /** List of todos */
  todos: Todo[];

  /** Loading state for initial fetch */
  isLoading: boolean;

  /** Loading state for mutations (create, update, delete) */
  isMutating: boolean;

  /** Error message if last operation failed */
  error: string | null;
}
```

### TodoFormState

State for the todo form component.

```typescript
/**
 * Form state for create/edit form
 */
export interface TodoFormState {
  /** Current title input value */
  title: string;

  /** Current description input value */
  description: string;

  /** Validation errors */
  errors: {
    title?: string;
  };

  /** Form submission state */
  isSubmitting: boolean;
}
```

### EditingTodo

State for inline editing.

```typescript
/**
 * Tracks which todo is being edited
 */
export interface EditingState {
  /** ID of todo being edited, null if not editing */
  todoId: string | null;

  /** Form values for the todo being edited */
  formValues: {
    title: string;
    description: string;
  } | null;
}
```

## Toast/Notification Types

```typescript
/**
 * Toast notification type
 */
export type ToastType = 'success' | 'error' | 'info';

/**
 * Toast notification data
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
```

## API Response Types

```typescript
/**
 * API error response from backend
 * Matches backend error taxonomy
 */
export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  request_id?: string;
  details?: Record<string, unknown>;
}

/**
 * Validation error detail (for 400/422 responses)
 */
export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}
```

## Validation Rules

### Title Validation

| Rule | Constraint | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Title is required" |
| Min Length | At least 1 char after trim | "Title cannot be empty" |
| Max Length | At most 255 chars | "Title must be 255 characters or less" |
| Whitespace | Cannot be whitespace only | "Title cannot be empty" |

### Description Validation

| Rule | Constraint | Error Message |
|------|------------|---------------|
| Optional | Can be null/undefined | N/A |
| Max Length | No explicit limit | N/A |

## State Transitions

### Todo Completion States

```
┌─────────────┐         toggle          ┌─────────────┐
│             │ ───────────────────────▶ │             │
│  Incomplete │                          │  Complete   │
│             │ ◀─────────────────────── │             │
└─────────────┘         toggle          └─────────────┘
     │                                        │
     │ completed: false                       │ completed: true
     │ visual: normal text                    │ visual: strikethrough, muted
```

### Form States

```
┌───────────┐   submit   ┌────────────┐  success  ┌───────────┐
│   Idle    │ ─────────▶ │ Submitting │ ────────▶ │  Success  │
└───────────┘            └────────────┘           └───────────┘
                              │
                              │ failure
                              ▼
                         ┌────────────┐
                         │   Error    │
                         └────────────┘
```

## Type File Location

All types should be defined in:
```
frontend/src/types/todo.ts
```

And exported for use throughout the application:
```typescript
// frontend/src/types/todo.ts
export type { Todo, TodoCreate, TodoUpdate };
export type { TodosState, TodoFormState, EditingState };
export type { ToastType, Toast };
export type { ApiError, ValidationErrorDetail };
```
