"use client";

/**
 * Delete confirmation dialog component.
 *
 * Task Reference: T041 [US5] - Create DeleteDialog component
 * Task Reference: T042 [US5] - Add focus trap and keyboard handling
 * Feature: 004-frontend-todo-ui
 */

import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface DeleteDialogProps {
  isOpen: boolean;
  todoTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

/**
 * Confirmation dialog for deleting a todo.
 */
export function DeleteDialog({
  isOpen,
  todoTitle,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onCancel} title="Delete Todo">
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete{" "}
        <span className="font-medium text-gray-900">"{todoTitle}"</span>? This
        action cannot be undone.
      </p>

      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          isLoading={isDeleting}
        >
          Delete
        </Button>
      </div>
    </Dialog>
  );
}
