"use client";

/**
 * Todo create/edit form component.
 *
 * Task Reference: T023 [US2] - Create TodoForm component (004-frontend-todo-ui)
 * Task Reference: T024 [US2] - Add title validation (004-frontend-todo-ui)
 * Task Reference: T026 [US1] - Add due date input (005-todo-enhancements)
 * Task Reference: T039 [US2] - Add priority selector (005-todo-enhancements)
 * Task Reference: T057 [US3] - Add tag input (005-todo-enhancements)
 * Task Reference: T056 [US7] - Mobile responsive form layout
 * Task Reference: T043 [US1] - Integrate RecurrenceSelector (006-recurring-reminders)
 * Task Reference: T058 [US2] - Integrate ReminderSelector (006-recurring-reminders)
 * Feature: 004-frontend-todo-ui, 005-todo-enhancements, 006-recurring-reminders
 */

import { useState, useCallback, type FormEvent, useRef, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { PrioritySelector } from "@/components/ui/PrioritySelector";
import { TagInput } from "@/components/tags";
import { RecurrenceSelector } from "@/components/todos/RecurrenceSelector";
import { ReminderSelector } from "@/components/todos/ReminderSelector";
import type { Priority } from "@/types/todo";
import type { Tag } from "@/types/tag";
import type { RecurrenceConfig } from "@/types/recurrence";

interface TodoFormData {
  title: string;
  description?: string;
  due_date?: string | null;
  priority?: Priority | null;
  tag_ids?: string[];
  /** Recurrence configuration - T043 [US1] */
  recurrence?: RecurrenceConfig | null;
  /** Reminder offset in minutes (negative) - T058 [US2] */
  reminder_offset?: number | null;
}

interface TodoFormProps {
  onSubmit: (data: TodoFormData) => Promise<boolean>;
  isLoading?: boolean;
  /** Available tags for selection - T057 [US3] */
  availableTags?: Tag[];
  /** Callback to create a new tag - T057 [US3] */
  onCreateTag?: (name: string) => Promise<Tag | null>;
}

/**
 * Form for creating new todos.
 */
export function TodoForm({
  onSubmit,
  isLoading = false,
  availableTags = [],
  onCreateTag,
}: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority | null>(null);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [recurrence, setRecurrence] = useState<RecurrenceConfig | null>(null);
  const [reminderOffset, setReminderOffset] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        formRef.current &&
        !formRef.current.contains(event.target as Node) &&
        isOpen &&
        !isLoading // Don't close while submitting
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isLoading]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus title when opening
  useEffect(() => {
    if (isOpen) {
      // Small delay to allow expansion animation to start so focus doesn't jump
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Memoize recurrence onChange to prevent infinite loops - T043 [US1]
  const handleRecurrenceChange = useCallback((value: RecurrenceConfig | null) => {
    setRecurrence(value);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate title
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }
    if (trimmedTitle.length > 255) {
      setError("Title must be 255 characters or less");
      return;
    }

    setError(null);

    const success = await onSubmit({
      title: trimmedTitle,
      description: description.trim() || undefined,
      due_date: dueDate,
      priority: priority,
      tag_ids: tagIds.length > 0 ? tagIds : undefined,
      recurrence: recurrence,
      reminder_offset: reminderOffset,
    });

    if (success) {
      // Clear form on success
      setTitle("");
      setDescription("");
      setDueDate(null);
      setPriority(null);
      setTagIds([]);
      setRecurrence(null);
      setReminderOffset(null);
      setIsOpen(false); // Collapse on success
    }
  };

  return (
    <div ref={formRef} className="w-full">
      {/* Entry Point - Visible when collapsed */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-left text-gray-500 hover:text-gray-700 shadow-sm transition-all duration-200 group ${isOpen ? "hidden" : "block"
          }`}
        aria-expanded={isOpen}
      >
        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 group-hover:scale-110 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="font-medium text-base">Add a new task...</span>
        <span className="ml-auto text-xs text-gray-400 font-medium border border-gray-100 px-2 py-0.5 rounded bg-gray-50">
          Press Enter
        </span>
      </button>

      {/* Expandable Form */}
      <div
        className={`transition-all duration-300 ease-out overflow-hidden origin-top ${isOpen
            ? "max-h-[1000px] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
          }`}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-lg ring-1 ring-black/5"
        >
          <div className="space-y-5">
            <Input
              ref={titleInputRef}
              label="What needs to be done?"
              placeholder="Enter todo title..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              error={error || undefined}
              disabled={isLoading}
              maxLength={255}
              className="text-gray-900 placeholder:text-gray-600 font-medium"
            />


            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all hover:border-gray-400"
                rows={2}
                disabled={isLoading}
              />
            </div>

            {/* Due Date and Time - T026 [US1] */}
            <DateTimePicker
              label="Due date and time (optional)"
              value={dueDate}
              onChange={setDueDate}
              disabled={isLoading}
              clearable
            />

            {/* Priority - T039 [US2] */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority (optional)
              </label>
              <PrioritySelector
                value={priority}
                onChange={setPriority}
                disabled={isLoading}
                clearable
              />
            </div>

            {/* Tags - T057 [US3] */}
            {availableTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (optional)
                </label>
                <TagInput
                  value={tagIds}
                  onChange={setTagIds}
                  availableTags={availableTags}
                  onCreateTag={onCreateTag}
                  disabled={isLoading}
                  placeholder="Add tags..."
                />
              </div>
            )}

            {/* Recurrence - T043 [US1] */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recurrence (optional)
              </label>
              <RecurrenceSelector
                value={recurrence}
                onChange={handleRecurrenceChange}
                disabled={isLoading}
                hasDueDate={!!dueDate}
              />
            </div>

            {/* Reminder - T058 [US2] */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reminder (optional)
              </label>
              <ReminderSelector
                value={reminderOffset}
                onChange={setReminderOffset}
                disabled={isLoading}
                hasDueDate={!!dueDate}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} disabled={!title.trim()}>
                Add Todo
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
