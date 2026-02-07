"use client";

/**
 * Todo item component.
 *
 * Task Reference: T019 [US1] - Create TodoItem component (004-frontend-todo-ui)
 * Task Reference: T027 [US1] - Display due date with human-friendly format (005-todo-enhancements)
 * Task Reference: T028 [US1] - Add overdue (red) highlighting (005-todo-enhancements)
 * Task Reference: T029 [US1] - Add due-soon (yellow) highlighting (005-todo-enhancements)
 * Task Reference: T030 [US1] - Add due date editing capability (005-todo-enhancements)
 * Task Reference: T040 [US2] - Display priority indicator (005-todo-enhancements)
 * Task Reference: T041 [US2] - Add priority editing capability (005-todo-enhancements)
 * Task Reference: T058 [US3] - Display tag badges (005-todo-enhancements)
 * Task Reference: T059 [US3] - Add tag editing capability (005-todo-enhancements)
 * Task Reference: T053 [US7] - Add touch-friendly button sizes
 * Task Reference: T054 [US7] - Stack actions vertically on mobile
 * Task Reference: T091 [P] - Mobile-responsive compact view (005-todo-enhancements)
 * Task Reference: T045 [US1] - Display RecurringIndicator (006-recurring-reminders)
 * Task Reference: T077, T078 [US4] - Handle occurrence completion (006-recurring-reminders)
 * Task Reference: T089 [US6] - Add Skip action button for recurring todos (006-recurring-reminders)
 * Task Reference: T090 [US6] - Show skipped status indicator (006-recurring-reminders)
 * Task Reference: T112 [US9] - Add "Stop Recurring" action to TodoItem menu (006-recurring-reminders)
 * Feature: 004-frontend-todo-ui, 005-todo-enhancements, 006-recurring-reminders
 */

import type { Todo, Priority } from "@/types/todo";
import type { Tag } from "@/types/tag";
import type { ReminderResponse } from "@/types/reminder";
import { TodoToggle } from "./TodoToggle";
import { RecurringIndicator } from "./RecurringIndicator";
import { ReminderBadge } from "./ReminderSelector";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DateTimePickerCompact } from "@/components/ui/DateTimePicker";
import { PriorityBadge, PrioritySelector } from "@/components/ui/PrioritySelector";
import { TagList, TagInput } from "@/components/tags";
import {
  formatDueDate,
  getDueDateStatus,
  DUE_DATE_STATUS_CONFIG,
  type DueDateStatus,
} from "@/lib/date-utils";

interface EditFormValues {
  title: string;
  description: string;
  due_date: string | null;
  priority: Priority | null;
  tag_ids: string[];
}

interface TodoItemProps {
  todo: Todo;
  isEditing: boolean;
  editFormValues: EditFormValues | null;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onEditChange: (values: EditFormValues) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  isMutating: boolean;
  /** Available tags for tag editing - T059 [US3] */
  availableTags?: Tag[];
  /** Callback to create a new tag - T059 [US3] */
  onCreateTag?: (name: string) => Promise<Tag | null>;
  /** Active reminders for this todo - T060 [US2] */
  reminders?: ReminderResponse[];
  /** Callback to complete an occurrence - T077 [US4] */
  onCompleteOccurrence?: (occurrenceId: string) => Promise<void>;
  /** Callback to skip an occurrence - T077 [US4] */
  onSkipOccurrence?: (occurrenceId: string) => Promise<void>;
  /** Callback to stop recurring - T112 [US9] */
  onStopRecurring?: (todoId: string) => Promise<void>;
}

/**
 * Due date badge with status-based styling.
 */
function DueDateBadge({
  dueDate,
  completed,
}: {
  dueDate: string | null;
  completed: boolean;
}) {
  if (!dueDate) return null;

  const status = getDueDateStatus(dueDate, completed);
  const formattedDate = formatDueDate(dueDate);

  // Don't show special styling for completed or normal items
  if (status === "none" || status === "normal") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-primary-500">
        <CalendarIcon className="w-3.5 h-3.5" />
        {formattedDate}
      </span>
    );
  }

  const statusStyles = {
    overdue: "bg-danger-50 text-danger-700 border-danger-200",
    "due-today": "bg-accent-50 text-accent-800 border-accent-200",
    "due-soon": "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusStyles[status as keyof typeof statusStyles]}`}
    >
      <CalendarIcon className="w-3.5 h-3.5" />
      {status === "overdue" ? `Overdue: ${formattedDate}` : formattedDate}
    </span>
  );
}

/**
 * Calendar icon component.
 */
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

/**
 * Single todo item display with actions.
 */
export function TodoItem({
  todo,
  isEditing,
  editFormValues,
  onToggle,
  onEdit,
  onDelete,
  onEditChange,
  onEditSave,
  onEditCancel,
  isMutating,
  availableTags = [],
  onCreateTag,
  reminders = [],
  onCompleteOccurrence,
  onSkipOccurrence,
  onStopRecurring,
}: TodoItemProps) {
  /**
   * Handle toggle - T077 [US4]
   * For recurring todos with a current occurrence, complete the occurrence.
   * For non-recurring todos, toggle the todo's completed state.
   */
  const handleToggle = async () => {
    if (todo.is_recurring && todo.current_occurrence_id && onCompleteOccurrence) {
      // Complete the current occurrence for recurring todos
      await onCompleteOccurrence(todo.current_occurrence_id);
    } else {
      // Regular toggle for non-recurring todos
      onToggle(todo.id);
    }
  };

  /**
   * Handle skip - T089 [US6]
   * Skip the current occurrence for recurring todos.
   */
  const handleSkip = async () => {
    if (todo.is_recurring && todo.current_occurrence_id && onSkipOccurrence) {
      await onSkipOccurrence(todo.current_occurrence_id);
    }
  };

  /**
   * Check if the current occurrence is completed - T078 [US4]
   */
  const isCurrentOccurrenceCompleted =
    todo.is_recurring && todo.current_occurrence_status === "completed";

  /**
   * Check if the current occurrence is skipped - T090 [US6]
   */
  const isCurrentOccurrenceSkipped =
    todo.is_recurring && todo.current_occurrence_status === "skipped";

  /**
   * Whether the current occurrence should show as done (completed or skipped) - T090 [US6]
   */
  const isOccurrenceDone = isCurrentOccurrenceCompleted || isCurrentOccurrenceSkipped;

  // Format date for display
  const createdDate = new Date(todo.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Get due date status for border highlighting
  const dueDateStatus = getDueDateStatus(todo.due_date, todo.completed);

  // Determine card styles based on status
  const getCardStyles = (): string => {
    const baseStyles = "todo-item group bg-white border border-gray-200 shadow-md rounded-xl px-4 py-4 mb-3 hover:shadow-lg hover:border-blue-200 transition-all duration-200";

    if (todo.completed || (todo.is_recurring && isOccurrenceDone)) {
      return `${baseStyles} opacity-60 bg-gray-50 shadow-none border-gray-100`;
    }

    switch (dueDateStatus) {
      case "overdue":
        return `${baseStyles} border-danger-200 bg-danger-50`;
      case "due-today":
        return `${baseStyles} border-accent-200 bg-accent-50`;
      case "due-soon":
        return `${baseStyles} border-amber-200 bg-amber-50`;
      default:
        return baseStyles;
    }
  };

  // Edit mode - T030 [US1], T091 [P] mobile-responsive
  if (isEditing && editFormValues) {
    return (
      <div className="bg-white rounded-2xl border-2 border-accent-300 p-5 sm:p-6 shadow-soft-lg animate-scale-in">
        <div className="space-y-5">
          <Input
            label="Title"
            value={editFormValues.title}
            onChange={(e) =>
              onEditChange({ ...editFormValues, title: e.target.value })
            }
            error={
              editFormValues.title.trim() === "" ? "Title is required" : undefined
            }
            autoFocus
          />
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Description
            </label>
            <textarea
              value={editFormValues.description}
              onChange={(e) =>
                onEditChange({ ...editFormValues, description: e.target.value })
              }
              className="w-full px-4 py-3 bg-white border-2 border-primary-200 rounded-xl text-primary-900 placeholder:text-primary-400 transition-all duration-200 focus:outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-100 hover:border-primary-300 resize-none"
              rows={3}
              placeholder="Add a description..."
            />
          </div>

          {/* Due Date and Time Edit - T030 [US1] */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Due Date & Time
            </label>
            <div className="flex items-center gap-3">
              <DateTimePickerCompact
                value={editFormValues.due_date}
                onChange={(value) =>
                  onEditChange({ ...editFormValues, due_date: value })
                }
              />
              {editFormValues.due_date && (
                <button
                  type="button"
                  onClick={() =>
                    onEditChange({ ...editFormValues, due_date: null })
                  }
                  className="text-sm text-primary-500 hover:text-danger-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Priority Edit - T041 [US2] */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Priority
            </label>
            <PrioritySelector
              value={editFormValues.priority}
              onChange={(value) =>
                onEditChange({ ...editFormValues, priority: value })
              }
              clearable
            />
          </div>

          {/* Tags Edit - T059 [US3] */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Tags
              </label>
              <TagInput
                value={editFormValues.tag_ids}
                onChange={(tagIds) =>
                  onEditChange({ ...editFormValues, tag_ids: tagIds })
                }
                availableTags={availableTags}
                onCreateTag={onCreateTag}
                placeholder="Add tags..."
              />
            </div>
          )}

          {/* Edit form buttons - T091 [P] responsive */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-3 border-t border-primary-100">
            <Button
              variant="ghost"
              size="md"
              onClick={onEditCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              size="md"
              onClick={onEditSave}
              isLoading={isMutating}
              disabled={editFormValues.title.trim() === ""}
              className="w-full sm:w-auto"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Normal display mode with due date highlighting - T027, T028, T029, T091 [P]
  return (
    <div className={getCardStyles()}>
      <div className="flex items-start gap-4">
        {/* Toggle - T077, T078 [US4] */}
        <div className="pt-0.5">
          <TodoToggle
            checked={todo.is_recurring ? isOccurrenceDone : todo.completed}
            onChange={handleToggle}
            label={todo.title}
          />
        </div>

        {/* Content - T078 [US4], T090 [US6] occurrence status styling */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3
              className={`text-base font-medium leading-snug ${(todo.is_recurring ? isOccurrenceDone : todo.completed)
                ? "text-gray-500 line-through"
                : "text-gray-900"
                }`}
            >
              {todo.title}
            </h3>
            {/* T090 [US6] - Show skipped status indicator */}
            {isCurrentOccurrenceSkipped && (
              <span className="badge badge-neutral">
                Skipped
              </span>
            )}
          </div>
          {todo.description && (
            <p
              className={`mt-1.5 text-sm leading-relaxed ${(todo.is_recurring ? isOccurrenceDone : todo.completed)
                ? "text-gray-400"
                : "text-gray-600"
                }`}
            >
              {todo.description}
            </p>
          )}

          {/* Metadata row - T027 [US1], T040 [US2], T045 [US1], T058 [US3], T091 [P] */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Priority badge - T040 [US2] */}
            <PriorityBadge priority={todo.priority} size="xs" />

            {/* Recurring indicator - T045 [US1] */}
            {todo.is_recurring && (
              <RecurringIndicator
                rrule={todo.rrule}
                nextOccurrence={todo.next_occurrence_date}
                size="sm"
              />
            )}

            {/* Reminder badge - T060 [US2] */}
            {reminders.length > 0 && (
              <ReminderBadge
                offsetMinutes={reminders[0].offset_minutes}
                fireAt={reminders[0].fire_at}
              />
            )}

            {/* Due date badge */}
            <DueDateBadge dueDate={todo.due_date} completed={todo.completed} />

            {/* Tags - T058 [US3] - responsive tag count */}
            <TagList tags={todo.tags || []} maxVisible={3} size="xs" />

            {/* Created date - hidden on very small screens */}
            <span className="hidden sm:inline text-xs text-gray-400 font-normal">
              Created {createdDate}
            </span>
          </div>
        </div>

        {/* Actions - T053/T054 [US7] Touch-friendly on mobile, T089 [US6] Skip button */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* T089 [US6] - Skip button for recurring todos with pending occurrence */}
          {todo.is_recurring &&
            todo.current_occurrence_id &&
            todo.current_occurrence_status === "pending" &&
            onSkipOccurrence && (
              <button
                onClick={handleSkip}
                aria-label={`Skip this occurrence of "${todo.title}"`}
                className="p-2.5 rounded-xl text-accent-600 hover:bg-accent-50 transition-all"
                title="Skip this occurrence"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          {/* T112 [US9] - Stop Recurring button for recurring todos */}
          {todo.is_recurring && onStopRecurring && (
            <button
              onClick={() => onStopRecurring(todo.id)}
              aria-label={`Stop recurring for "${todo.title}"`}
              className="p-2.5 rounded-xl text-orange-600 hover:bg-orange-50 transition-all"
              title="Stop recurring"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
            </button>
          )}
          <button
            onClick={() => onEdit(todo)}
            aria-label={`Edit "${todo.title}"`}
            className="p-2.5 rounded-xl text-primary-500 hover:text-primary-700 hover:bg-primary-50 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            aria-label={`Delete "${todo.title}"`}
            className="p-2.5 rounded-xl text-danger-500 hover:text-danger-700 hover:bg-danger-50 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
