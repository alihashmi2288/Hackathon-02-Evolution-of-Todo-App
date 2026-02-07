"use client";

/**
 * Tag manager component for CRUD operations.
 *
 * Task Reference: T055 [US3] - Create TagManager component (005-todo-enhancements)
 * Feature: 005-todo-enhancements
 *
 * Provides a modal/panel for managing all user tags:
 * - Create new tags with color selection
 * - Edit existing tag names and colors
 * - Delete tags with confirmation
 */

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TAG_COLOR_PALETTE } from "@/types/tag";
import type { TagWithCount, TagCreate, TagUpdate } from "@/types/tag";

interface TagManagerProps {
  tags: TagWithCount[];
  isLoading: boolean;
  isMutating: boolean;
  onCreateTag: (data: TagCreate) => Promise<unknown>;
  onUpdateTag: (id: string, data: TagUpdate) => Promise<unknown>;
  onDeleteTag: (id: string) => Promise<boolean>;
  onClose: () => void;
  getNextColor: () => string;
}

interface EditingTag {
  id: string;
  name: string;
  color: string;
}

/**
 * Tag manager modal/panel component.
 */
export function TagManager({
  tags,
  isLoading,
  isMutating,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  onClose,
  getNextColor,
}: TagManagerProps) {
  // New tag form state
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(getNextColor());
  const [createError, setCreateError] = useState<string | null>(null);

  // Editing state
  const [editingTag, setEditingTag] = useState<EditingTag | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete confirmation state
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      setCreateError("Tag name is required");
      return;
    }

    setCreateError(null);
    const result = await onCreateTag({ name: newTagName.trim(), color: newTagColor });
    if (result) {
      setNewTagName("");
      setNewTagColor(getNextColor());
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;

    if (!editingTag.name.trim()) {
      setEditError("Tag name is required");
      return;
    }

    setEditError(null);
    await onUpdateTag(editingTag.id, {
      name: editingTag.name.trim(),
      color: editingTag.color,
    });
    setEditingTag(null);
  };

  const handleDeleteTag = async (id: string) => {
    const success = await onDeleteTag(id);
    if (success) {
      setDeletingTagId(null);
    }
  };

  const startEditing = (tag: TagWithCount) => {
    setEditingTag({ id: tag.id, name: tag.name, color: tag.color });
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingTag(null);
    setEditError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Manage Tags</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Create new tag form */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Create New Tag</h3>
            <div className="flex gap-2">
              <Input
                value={newTagName}
                onChange={(e) => {
                  setNewTagName(e.target.value);
                  setCreateError(null);
                }}
                placeholder="Tag name..."
                error={createError || undefined}
                maxLength={50}
                className="flex-1"
              />
              <ColorPicker
                value={newTagColor}
                onChange={setNewTagColor}
                colors={TAG_COLOR_PALETTE}
              />
              <Button
                onClick={handleCreateTag}
                isLoading={isMutating}
                disabled={!newTagName.trim()}
                size="sm"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Tag list */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">
              Your Tags ({tags.length})
            </h3>

            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : tags.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No tags yet. Create your first tag above.
              </div>
            ) : (
              <ul className="space-y-2">
                {tags.map((tag) => (
                  <li key={tag.id}>
                    {editingTag?.id === tag.id ? (
                      // Edit mode
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        <Input
                          value={editingTag.name}
                          onChange={(e) =>
                            setEditingTag({
                              ...editingTag,
                              name: e.target.value,
                            })
                          }
                          error={editError || undefined}
                          maxLength={50}
                          className="flex-1"
                          autoFocus
                        />
                        <ColorPicker
                          value={editingTag.color}
                          onChange={(color) =>
                            setEditingTag({ ...editingTag, color })
                          }
                          colors={TAG_COLOR_PALETTE}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleUpdateTag}
                          isLoading={isMutating}
                          disabled={!editingTag.name.trim()}
                        >
                          Save
                        </Button>
                      </div>
                    ) : deletingTagId === tag.id ? (
                      // Delete confirmation
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                        <span className="text-sm text-red-700">
                          Delete &quot;{tag.name}&quot;? ({tag.todo_count} todos)
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingTagId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteTag(tag.id)}
                            isLoading={isMutating}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Display mode
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="font-medium text-gray-900">
                            {tag.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({tag.todo_count})
                          </span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(tag)}
                            aria-label={`Edit ${tag.name}`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingTagId(tag.id)}
                            className="text-red-600 hover:bg-red-50"
                            aria-label={`Delete ${tag.name}`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button variant="secondary" onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple color picker component.
 */
function ColorPicker({
  value,
  onChange,
  colors,
}: {
  value: string;
  onChange: (color: string) => void;
  colors: readonly string[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-lg border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ backgroundColor: value }}
        aria-label="Select color"
      />
      {isOpen && (
        <div className="absolute z-10 mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-4 gap-1">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onChange(color);
                setIsOpen(false);
              }}
              className={`w-6 h-6 rounded-full border-2 ${
                value === color ? "border-gray-600" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select ${color}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
