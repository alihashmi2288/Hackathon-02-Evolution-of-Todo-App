"use client";

/**
 * Todo list component - main container for todo management.
 *
 * Task Reference: T020 [US1] - Create TodoList component
 * Task Reference: T021 [US1] - Add loading state display
 * Task Reference: T022 [US1] - Add error state display
 * Task Reference: T026 [US2] - Add TodoForm to TodoList
 * Task Reference: T027 [US2] - Add success toast on creation
 * Task Reference: T028 [US2] - Add error toast on creation failure
 * Task Reference: T057 - Add ARIA live regions for status updates
 * Task Reference: T058 - Add proper landmarks and roles
 * Task Reference: T061 [US3] - Add tag management access (005-todo-enhancements)
 * Task Reference: T079 [US4] - Integrate FilterPanel (005-todo-enhancements)
 * Task Reference: T081 [US4] - Add "No results" empty state (005-todo-enhancements)
 * Task Reference: T094 [P] - Add loading states during filter changes
 * Task Reference: T073 [US3] - Click-through navigation highlight (006-recurring-reminders)
 * Task Reference: T106 [US8] - Show EditScopeModal when editing recurring todo (006-recurring-reminders)
 * Feature: 004-frontend-todo-ui, 005-todo-enhancements, 006-recurring-reminders
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTodos } from "@/hooks/useTodos";
import { useTags } from "@/hooks/useTags";
import { useFilters } from "@/hooks/useFilters";
import { useToast } from "@/hooks/useToast";
import { TodoItem } from "./TodoItem";
import { TodoForm } from "./TodoForm";
import { EmptyState } from "./EmptyState";
import { DeleteDialog } from "./DeleteDialog";
import { EditScopeModal } from "./EditScopeModal";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { TagManager } from "@/components/tags";
import { FilterPanel } from "@/components/filters";
import type { Todo } from "@/types/todo";
import type { Tag } from "@/types/tag";
import type { EditScope } from "@/types/recurrence";
import { TAG_COLOR_PALETTE } from "@/types/tag";

/**
 * Main todo list component with full CRUD functionality.
 */
export function TodoList() {
  // T073 [US3] - Click-through navigation: Get highlight param from URL
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [highlightedTodoId, setHighlightedTodoId] = useState<string | null>(null);
  const todoRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  // Filter state - T079 [US4], T088 [US5]
  const {
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
  } = useFilters();

  // Todo state with filters - T080 [US4]
  const {
    todos,
    isLoading,
    isMutating,
    error,
    editingTodoId,
    editFormValues,
    createTodo,
    updateTodo,
    toggleComplete,
    completeOccurrence,
    skipOccurrence,
    stopRecurring,
    startEditing,
    cancelEditing,
    saveEdit,
    setEditFormValues,
    deleteTodo,
    fetchTodos,
  } = useTodos({ filters });

  // Tags management - T061 [US3]
  const {
    tags,
    isLoading: isLoadingTags,
    isMutating: isMutatingTags,
    createTag,
    updateTag,
    deleteTag,
    getNextColor,
  } = useTags();

  const { showToast } = useToast();

  // Delete confirmation state
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tag manager modal state - T061 [US3]
  const [showTagManager, setShowTagManager] = useState(false);

  // T106 [US8] - Edit scope modal state for recurring todos
  const [showEditScopeModal, setShowEditScopeModal] = useState(false);

  // Form ref for scroll-to-form
  const formRef = useRef<HTMLDivElement>(null);

  // Track initial load vs filter refetch - T094 [P]
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  useEffect(() => {
    if (!isLoading && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
    }
  }, [isLoading, hasInitiallyLoaded]);

  // Is this a filter-triggered refetch?
  const isFiltering = hasInitiallyLoaded && isLoading;

  // T073 [US3] - Handle highlight from notification click-through
  useEffect(() => {
    if (highlightId && hasInitiallyLoaded && todos.length > 0) {
      // Check if the highlighted todo exists in the list
      const todoExists = todos.some((t) => t.id === highlightId);
      if (todoExists) {
        setHighlightedTodoId(highlightId);

        // Scroll to the highlighted todo after a brief delay
        setTimeout(() => {
          const element = todoRefs.current.get(highlightId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);

        // Remove highlight after 3 seconds
        const timer = setTimeout(() => {
          setHighlightedTodoId(null);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [highlightId, hasInitiallyLoaded, todos]);

  // T073 [US3] - Ref callback for todo items
  const setTodoRef = useCallback((id: string, element: HTMLLIElement | null) => {
    if (element) {
      todoRefs.current.set(id, element);
    } else {
      todoRefs.current.delete(id);
    }
  }, []);

  /**
   * Handle create todo
   */
  const handleCreate = async (data: {
    title: string;
    description?: string;
  }): Promise<boolean> => {
    const result = await createTodo(data);
    if (result) {
      showToast("Todo created successfully!", "success");
      return true;
    } else {
      showToast("Failed to create todo", "error");
      return false;
    }
  };

  /**
   * Handle toggle completion
   */
  const handleToggle = async (id: string) => {
    const success = await toggleComplete(id);
    if (!success) {
      showToast("Failed to update todo", "error");
    }
  };

  /**
   * Handle edit save - T106 [US8] - Show EditScopeModal for recurring todos
   */
  const handleEditSave = async () => {
    // Check if the todo being edited is recurring
    const editingTodo = todos.find((t) => t.id === editingTodoId);
    if (editingTodo?.is_recurring) {
      // Show scope selection modal for recurring todos
      setShowEditScopeModal(true);
      return;
    }

    // For non-recurring todos, save directly
    const success = await saveEdit();
    if (success) {
      showToast("Todo updated successfully!", "success");
    } else {
      showToast("Failed to update todo", "error");
    }
  };

  /**
   * Handle edit scope selection - T106, T107 [US8]
   */
  const handleEditScopeSelect = async (scope: EditScope) => {
    setShowEditScopeModal(false);

    if (!editingTodoId || !editFormValues) return;

    const result = await updateTodo(
      editingTodoId,
      {
        title: editFormValues.title,
        description: editFormValues.description || undefined,
        due_date: editFormValues.due_date,
        priority: editFormValues.priority,
        tag_ids: editFormValues.tag_ids.length > 0 ? editFormValues.tag_ids : undefined,
      },
      scope
    );

    if (result) {
      cancelEditing();
      if (scope === "this_only") {
        showToast("Created a separate todo for this occurrence", "success");
      } else {
        showToast("Updated all future occurrences", "success");
      }
    } else {
      showToast("Failed to update todo", "error");
    }
  };

  /**
   * Handle edit scope cancel - T106 [US8]
   */
  const handleEditScopeCancel = () => {
    setShowEditScopeModal(false);
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = async () => {
    if (!deletingTodo) return;

    setIsDeleting(true);
    const success = await deleteTodo(deletingTodo.id);
    setIsDeleting(false);

    if (success) {
      showToast("Todo deleted successfully!", "success");
      setDeletingTodo(null);
    } else {
      showToast("Failed to delete todo", "error");
    }
  };

  /**
   * Scroll to form when clicking "Create first todo" in empty state
   */
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * Handle completing an occurrence - T077 [US4]
   */
  const handleCompleteOccurrence = async (occurrenceId: string) => {
    const result = await completeOccurrence(occurrenceId);
    if (result) {
      showToast("Occurrence completed!", "success");
      // Refresh todos to get updated occurrence info
      await fetchTodos();
    } else {
      showToast("Failed to complete occurrence", "error");
    }
  };

  /**
   * Handle skipping an occurrence - T077 [US4]
   */
  const handleSkipOccurrence = async (occurrenceId: string) => {
    const result = await skipOccurrence(occurrenceId);
    if (result) {
      showToast("Occurrence skipped", "success");
      // Refresh todos to get updated occurrence info
      await fetchTodos();
    } else {
      showToast("Failed to skip occurrence", "error");
    }
  };

  /**
   * Handle stopping a recurring todo - T112 [US9]
   */
  const handleStopRecurring = async (todoId: string) => {
    const result = await stopRecurring(todoId);
    if (result) {
      showToast("Recurring stopped", "success");
    } else {
      showToast("Failed to stop recurring", "error");
    }
  };

  /**
   * Handle creating a new tag inline - T061 [US3]
   */
  const handleCreateTagInline = async (name: string): Promise<Tag | null> => {
    const result = await createTag({ name, color: getNextColor() });
    if (result) {
      showToast(`Tag "${name}" created!`, "success");
      return result;
    }
    return null;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-accent-200/30 rounded-full blur-xl" />
          <Spinner size="lg" />
        </div>
        <p className="mt-6 text-primary-600 font-medium">Loading your tasks...</p>
      </div>
    );
  }

  // Error state
  if (error && todos.length === 0) {
    return (
      <div className="glass-card rounded-2xl border border-danger-200 p-8 text-center animate-fade-in">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-danger-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-danger-800 font-semibold mb-1">Failed to load tasks</p>
        <p className="text-danger-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="main" aria-label="Todo management">
      {/* Header with tag management - T061 [US3] */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Tasks
          </h2>
          <p className="text-primary-200 text-sm mt-2 font-medium">
            {todos.length === 0
              ? "No tasks yet"
              : `${todos.filter((t) => !t.completed).length} active, ${todos.filter((t) => t.completed).length} completed`}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowTagManager(true)}
        >
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Tags
        </Button>
      </div>

      {/* Filter panel - T079 [US4], T087 [US5] */}
      <FilterPanel
        filters={filters}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onPrioritiesChange={setPriorities}
        onTagIdsChange={setTagIds}
        onDueBeforeChange={setDueBefore}
        onDueAfterChange={setDueAfter}
        onSortByChange={setSortBy}
        onSortDirectionChange={setSortDirection}
        onClearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
        tags={tags}
        disabled={isLoading}
      />

      {/* Create form */}
      <section ref={formRef} aria-label="Create new todo">
        <TodoForm
          onSubmit={handleCreate}
          isLoading={isMutating}
          availableTags={tags}
          onCreateTag={handleCreateTagInline}
        />
      </section>

      {/* Error banner - T057 ARIA live region */}
      {error && (
        <div
          className="glass-card rounded-xl border border-danger-200 px-4 py-3 flex items-center gap-3"
          role="alert"
          aria-live="polite"
        >
          <div className="w-8 h-8 rounded-lg bg-danger-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-danger-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Todo list or empty state - T058, T081, T094 */}
      <div className="relative">
        {/* Filter loading overlay - T094 [P] */}
        {isFiltering && (
          <div
            className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl"
            aria-live="polite"
            aria-label="Updating results"
          >
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-soft">
              <Spinner size="sm" />
              <span className="text-sm text-primary-600 font-medium">Updating...</span>
            </div>
          </div>
        )}

        {todos.length === 0 ? (
          hasActiveFilters ? (
            // No results with filters - T081 [US4]
            <div className="glass-card rounded-2xl border border-primary-200 p-10 text-center animate-fade-in">
              <div className="relative mx-auto w-16 h-16 mb-6">
                <div className="absolute inset-0 bg-primary-100/50 rounded-full blur-lg" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-primary-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-2">No matching tasks</h3>
              <p className="text-primary-300 max-w-sm mx-auto mb-6">
                No tasks match your current filters. Try adjusting your search criteria.
              </p>
              <Button
                variant="secondary"
                size="md"
                onClick={clearFilters}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <EmptyState onCreateClick={scrollToForm} />
          )
        ) : (
          <section aria-label="Your todos">
            <ul className="space-y-4" role="list" aria-label={`${todos.length} todo items`}>
              {todos.map((todo, index) => (
                <li
                  key={todo.id}
                  ref={(el) => setTodoRef(todo.id, el)}
                  className={`animate-fade-in-up ${highlightedTodoId === todo.id
                    ? "ring-2 ring-accent-400 ring-offset-2 rounded-2xl transition-all duration-300"
                    : ""
                    }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TodoItem
                    todo={todo}
                    isEditing={editingTodoId === todo.id}
                    editFormValues={editingTodoId === todo.id ? editFormValues : null}
                    onToggle={handleToggle}
                    onEdit={startEditing}
                    onDelete={(id) => {
                      const todoToDelete = todos.find((t) => t.id === id);
                      if (todoToDelete) setDeletingTodo(todoToDelete);
                    }}
                    onEditChange={setEditFormValues}
                    onEditSave={handleEditSave}
                    onEditCancel={cancelEditing}
                    isMutating={isMutating}
                    availableTags={tags}
                    onCreateTag={handleCreateTagInline}
                    onCompleteOccurrence={handleCompleteOccurrence}
                    onSkipOccurrence={handleSkipOccurrence}
                    onStopRecurring={handleStopRecurring}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <DeleteDialog
        isOpen={!!deletingTodo}
        todoTitle={deletingTodo?.title || ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTodo(null)}
        isDeleting={isDeleting}
      />

      {/* T106 [US8] - Edit scope modal for recurring todos */}
      <EditScopeModal
        isOpen={showEditScopeModal}
        onSelect={handleEditScopeSelect}
        onCancel={handleEditScopeCancel}
        todoTitle={todos.find((t) => t.id === editingTodoId)?.title}
      />

      {/* Tag manager modal - T061 [US3] */}
      {showTagManager && (
        <TagManager
          tags={tags}
          isLoading={isLoadingTags}
          isMutating={isMutatingTags}
          onCreateTag={createTag}
          onUpdateTag={updateTag}
          onDeleteTag={deleteTag}
          onClose={() => setShowTagManager(false)}
          getNextColor={getNextColor}
        />
      )}
    </div>
  );
}
