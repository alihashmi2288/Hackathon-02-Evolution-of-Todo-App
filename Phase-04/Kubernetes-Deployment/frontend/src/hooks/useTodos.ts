"use client";

/**
 * Todo state management hook.
 *
 * Task Reference: T013 - Create useTodos hook skeleton (004-frontend-todo-ui)
 * Task Reference: T031 [US1] - Update useTodos hook to handle due_date (005-todo-enhancements)
 * Task Reference: T080 [US4] - Update useTodos to use filter params (005-todo-enhancements)
 * Task Reference: T046 [US1] - Handle recurrence in create mutation (006-recurring-reminders)
 * Task Reference: T077, T079 [US4] - Handle occurrence completion (006-recurring-reminders)
 * Task Reference: T107 [US8] - Pass edit_scope to update mutation (006-recurring-reminders)
 * Feature: 004-frontend-todo-ui, 005-todo-enhancements, 006-recurring-reminders
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { api, ApiClientError, Occurrence } from "@/services/api";
import type { Todo, TodoCreate, TodoUpdate, Priority } from "@/types/todo";
import type { FilterState } from "@/types/filters";
import type { EditScope } from "@/types/recurrence";
import { filterStateToQueryParams } from "@/types/filters";

interface EditFormValues {
  title: string;
  description: string;
  due_date: string | null;
  priority: Priority | null;
  tag_ids: string[];
}

interface UseTodosReturn {
  // State
  todos: Todo[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  // Editing state
  editingTodoId: string | null;
  editFormValues: EditFormValues | null;

  // Actions
  fetchTodos: () => Promise<void>;
  createTodo: (data: TodoCreate) => Promise<Todo | null>;
  /** T107 [US8] - Update todo with optional edit_scope for recurring todos */
  updateTodo: (id: string, data: TodoUpdate, editScope?: EditScope) => Promise<Todo | null>;
  deleteTodo: (id: string) => Promise<boolean>;
  toggleComplete: (id: string) => Promise<boolean>;

  // Occurrence actions - T077, T079 [US4] (006-recurring-reminders)
  completeOccurrence: (occurrenceId: string) => Promise<Occurrence | null>;
  skipOccurrence: (occurrenceId: string) => Promise<Occurrence | null>;

  // Recurring todo actions - T108, T112 [US9] (006-recurring-reminders)
  stopRecurring: (id: string, keepPending?: boolean) => Promise<Todo | null>;

  // Edit mode actions
  startEditing: (todo: Todo) => void;
  cancelEditing: () => void;
  saveEdit: () => Promise<boolean>;
  setEditFormValues: (values: EditFormValues) => void;
}

interface UseTodosOptions {
  /** Filter state for filtering todos - T080 [US4] */
  filters?: FilterState;
}

/**
 * Hook for managing todo state and operations.
 *
 * Features:
 * - Fetch todos on mount
 * - CRUD operations with loading/error states
 * - Optimistic updates for toggle
 * - Edit mode management
 * - Due date support (005-todo-enhancements)
 * - Filter support (005-todo-enhancements) - T080 [US4]
 *
 * @example
 * const { todos, isLoading, createTodo, toggleComplete } = useTodos();
 *
 * // With filters
 * const { todos } = useTodos({ filters });
 */
export function useTodos(options: UseTodosOptions = {}): UseTodosReturn {
  const { filters } = options;

  // Core state
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editing state - T031 [US1] Extended with due_date
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editFormValues, setEditFormValues] = useState<EditFormValues | null>(null);

  // Keep track of latest filters to avoid stale closures
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  /**
   * Fetch all todos for the current user.
   *
   * Task Reference: T017 [US1]
   * Task Reference: T080 [US4] - Use filter params
   */
  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert filters to query params - T080 [US4]
      const queryParams = filtersRef.current
        ? filterStateToQueryParams(filtersRef.current)
        : undefined;
      const data = await api.todos.list(queryParams);
      // Server handles sorting via sort param - T089 [US5]
      // No client-side re-sort needed as server returns properly ordered results
      setTodos(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.error.message);
      } else {
        setError("Failed to load todos");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new todo.
   *
   * Task Reference: T025 [US2] (004-frontend-todo-ui)
   * Task Reference: T031 [US1] - Handle due_date (005-todo-enhancements)
   */
  const createTodo = useCallback(
    async (data: TodoCreate): Promise<Todo | null> => {
      setIsMutating(true);
      setError(null);

      try {
        const newTodo = await api.todos.create(data);
        // Add to top of list
        setTodos((prev) => [newTodo, ...prev]);
        return newTodo;
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.error.message);
        } else {
          setError("Failed to create todo");
        }
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  /**
   * Update an existing todo.
   *
   * Task Reference: T036 [US4] (004-frontend-todo-ui)
   * Task Reference: T031 [US1] - Handle due_date (005-todo-enhancements)
   * Task Reference: T107 [US8] - Pass edit_scope for recurring todos (006-recurring-reminders)
   */
  const updateTodo = useCallback(
    async (id: string, data: TodoUpdate, editScope?: EditScope): Promise<Todo | null> => {
      setIsMutating(true);
      setError(null);

      try {
        const updated = await api.todos.update(id, data, editScope);
        // T107 [US8] - For "this_only", a new todo is created with a different ID
        if (editScope === "this_only") {
          // Add the new todo and refresh list to reflect skipped occurrence
          setTodos((prev) => [updated, ...prev]);
          // Trigger a refresh to get updated occurrence status
          setTimeout(() => fetchTodos(), 100);
        } else {
          setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
        }
        return updated;
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.error.message);
        } else {
          setError("Failed to update todo");
        }
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [fetchTodos]
  );

  /**
   * Delete a todo.
   *
   * Task Reference: T043 [US5]
   */
  const deleteTodo = useCallback(async (id: string): Promise<boolean> => {
    setIsMutating(true);
    setError(null);

    try {
      await api.todos.delete(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.error.message);
      } else {
        setError("Failed to delete todo");
      }
      return false;
    } finally {
      setIsMutating(false);
    }
  }, []);

  /**
   * Toggle todo completion with optimistic update.
   *
   * Task Reference: T031 [US3]
   */
  const toggleComplete = useCallback(
    async (id: string): Promise<boolean> => {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return false;

      const previousCompleted = todo.completed;

      // Optimistic update
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      );

      try {
        await api.todos.update(id, { completed: !previousCompleted });
        return true;
      } catch (err) {
        // Rollback on failure
        setTodos((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, completed: previousCompleted } : t
          )
        );
        if (err instanceof ApiClientError) {
          setError(err.error.message);
        } else {
          setError("Failed to update todo");
        }
        return false;
      }
    },
    [todos]
  );

  /**
   * Stop a recurring todo series.
   *
   * Task Reference: T108, T112 [US9] (006-recurring-reminders)
   *
   * Calls the stop-recurring endpoint which:
   * 1. Sets is_recurring to false
   * 2. Clears the rrule
   * 3. Optionally deletes pending future occurrences
   */
  const stopRecurring = useCallback(
    async (id: string, keepPending: boolean = false): Promise<Todo | null> => {
      setIsMutating(true);
      setError(null);

      try {
        const updated = await api.todos.stopRecurring(id, keepPending);
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? updated : t))
        );
        return updated;
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.error.message);
        } else {
          setError("Failed to stop recurring todo");
        }
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  /**
   * Start editing a todo.
   *
   * Task Reference: T035 [US4] (004-frontend-todo-ui)
   * Task Reference: T031 [US1] - Include due_date (005-todo-enhancements)
   */
  const startEditing = useCallback((todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditFormValues({
      title: todo.title,
      description: todo.description || "",
      due_date: todo.due_date,
      priority: todo.priority,
      tag_ids: todo.tags?.map((t) => t.id) || [],
    });
  }, []);

  /**
   * Cancel editing mode.
   */
  const cancelEditing = useCallback(() => {
    setEditingTodoId(null);
    setEditFormValues(null);
  }, []);

  /**
   * Save the current edit.
   *
   * Task Reference: T031 [US1] - Include due_date in update
   */
  const saveEdit = useCallback(async (): Promise<boolean> => {
    if (!editingTodoId || !editFormValues) return false;

    const result = await updateTodo(editingTodoId, {
      title: editFormValues.title,
      description: editFormValues.description || undefined,
      due_date: editFormValues.due_date,
      priority: editFormValues.priority,
      tag_ids: editFormValues.tag_ids.length > 0 ? editFormValues.tag_ids : undefined,
    });

    if (result) {
      cancelEditing();
      return true;
    }
    return false;
  }, [editingTodoId, editFormValues, updateTodo, cancelEditing]);

  /**
   * Complete an occurrence of a recurring todo.
   *
   * Task Reference: T077 [US4], T079 [US4] (006-recurring-reminders)
   *
   * Calls the occurrence complete endpoint which:
   * 1. Marks the occurrence as completed
   * 2. Generates next occurrence if needed
   */
  const completeOccurrence = useCallback(
    async (occurrenceId: string): Promise<Occurrence | null> => {
      setIsMutating(true);
      setError(null);

      try {
        const completed = await api.occurrences.complete(occurrenceId);
        return completed;
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.error.message);
        } else {
          setError("Failed to complete occurrence");
        }
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  /**
   * Skip an occurrence of a recurring todo.
   *
   * Task Reference: T079 [US4] (006-recurring-reminders)
   *
   * Calls the occurrence skip endpoint which:
   * 1. Marks the occurrence as skipped
   * 2. Generates next occurrence if needed
   */
  const skipOccurrence = useCallback(
    async (occurrenceId: string): Promise<Occurrence | null> => {
      setIsMutating(true);
      setError(null);

      try {
        const skipped = await api.occurrences.skip(occurrenceId);
        return skipped;
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.error.message);
        } else {
          setError("Failed to skip occurrence");
        }
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  // Fetch todos on mount and when filters change - T080 [US4]
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos, filters]);

  return {
    todos,
    isLoading,
    isMutating,
    error,
    editingTodoId,
    editFormValues,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    completeOccurrence,
    skipOccurrence,
    stopRecurring,
    startEditing,
    cancelEditing,
    saveEdit,
    setEditFormValues,
  };
}
