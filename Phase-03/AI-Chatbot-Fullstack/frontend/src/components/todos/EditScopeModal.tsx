"use client";

/**
 * Edit scope modal for recurring todo edits.
 *
 * Task Reference: T105 [US8] - Create EditScopeModal for recurring todo edits
 * Feature: 006-recurring-reminders
 *
 * Prompts user to choose between editing just this occurrence or all future.
 */

import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import type { EditScope } from "@/types/recurrence";

interface EditScopeModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when user selects a scope */
  onSelect: (scope: EditScope) => void;
  /** Callback when user cancels */
  onCancel: () => void;
  /** Optional title for the todo being edited */
  todoTitle?: string;
}

/**
 * Modal for selecting edit scope when editing a recurring todo.
 *
 * Task Reference: T105 [US8]
 */
export function EditScopeModal({
  isOpen,
  onSelect,
  onCancel,
  todoTitle,
}: EditScopeModalProps) {
  const handleThisOnly = useCallback(() => {
    onSelect("this_only");
  }, [onSelect]);

  const handleAllFuture = useCallback(() => {
    onSelect("all_future");
  }, [onSelect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Edit Recurring Todo
        </h2>
        {todoTitle && (
          <p className="text-sm text-gray-600 mb-4 truncate">
            &ldquo;{todoTitle}&rdquo;
          </p>
        )}
        <p className="text-sm text-gray-600 mb-6">
          This todo is part of a recurring series. How would you like to apply your changes?
        </p>

        <div className="space-y-3">
          {/* This occurrence only */}
          <button
            type="button"
            onClick={handleThisOnly}
            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="font-medium text-gray-900">This occurrence only</div>
            <div className="text-sm text-gray-500 mt-1">
              Creates a separate todo for this date only. The recurring series continues unchanged.
            </div>
          </button>

          {/* All future occurrences */}
          <button
            type="button"
            onClick={handleAllFuture}
            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="font-medium text-gray-900">All future occurrences</div>
            <div className="text-sm text-gray-500 mt-1">
              Updates the recurring series. All future occurrences will reflect these changes.
            </div>
          </button>
        </div>

        {/* Cancel button */}
        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
