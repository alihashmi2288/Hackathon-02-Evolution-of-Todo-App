"""
Todo request/response schemas.

Task Reference: T003 - Create TodoCreate, TodoUpdate, TodoResponse schemas (003-todo-crud)
Task Reference: T010 - Extend TodoCreate schema with due_date, priority, tag_ids
Task Reference: T011 - Extend TodoUpdate schema with due_date, priority, tag_ids
Task Reference: T012 - Extend TodoResponse schema to include tags array
Task Reference: T030 - Extend schemas for recurrence (006-recurring-reminders)
Task Reference: T041 - Extend TodoResponse for recurrence fields (006-recurring-reminders)
Feature: 003-todo-crud, 005-todo-enhancements, 006-recurring-reminders

Provides Pydantic schemas for:
- TodoCreate: Request body for creating a new todo
- TodoUpdate: Request body for partially updating a todo
- TodoResponse: Response body for todo data
- TagInTodoResponse: Embedded tag data in todo responses
"""

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

from app.models.priority import Priority
from app.schemas.recurrence import RecurrenceConfig


class TagInTodoResponse(BaseModel):
    """
    Embedded tag data in todo responses.

    A lighter version of TagResponse without todo_count.
    Task Reference: T012
    """

    id: str = Field(..., description="Unique tag identifier")
    name: str = Field(..., description="Tag display name")
    color: str = Field(..., description="Hex color code")

    model_config = {"from_attributes": True}


class TodoCreate(BaseModel):
    """
    Request schema for creating a new todo.

    Task Reference: T011 - Add title validation (003-todo-crud)
    Task Reference: T010 - Add due_date, priority, tag_ids (005-todo-enhancements)
    """

    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Task title (required, 1-255 chars)",
        examples=["Buy groceries"],
    )
    description: Optional[str] = Field(
        default=None,
        description="Optional detailed description",
        examples=["Milk, eggs, bread, cheese"],
    )
    # NEW fields for 005-todo-enhancements
    due_date: Optional[datetime] = Field(
        default=None,
        description="Optional deadline date and time (ISO 8601 format)",
        examples=["2026-01-25T15:00:00Z"],
    )
    priority: Optional[Priority] = Field(
        default=None,
        description="Optional priority level (high/medium/low)",
        examples=["high"],
    )
    tag_ids: Optional[List[str]] = Field(
        default=None,
        description="Optional list of tag IDs to assign",
        examples=[["tag_abc123", "tag_def456"]],
    )
    # NEW fields for 006-recurring-reminders
    recurrence: Optional[RecurrenceConfig] = Field(
        default=None,
        description="Optional recurrence configuration for repeating todos",
    )

    @field_validator("title")
    @classmethod
    def title_not_whitespace_only(cls, v: str) -> str:
        """Ensure title is not just whitespace."""
        if v.strip() == "":
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()


class TodoUpdate(BaseModel):
    """
    Request schema for partially updating a todo.

    All fields are optional - only provided fields are updated.
    Task Reference: T011 - Add due_date, priority, tag_ids (005-todo-enhancements)
    """

    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="Updated title",
        examples=["Buy groceries and supplies"],
    )
    description: Optional[str] = Field(
        default=None,
        description="Updated description",
        examples=["Milk, eggs, bread, cheese, soap"],
    )
    completed: Optional[bool] = Field(
        default=None,
        description="Updated completion status",
        examples=[True],
    )
    # NEW fields for 005-todo-enhancements
    due_date: Optional[datetime] = Field(
        default=None,
        description="Updated deadline date and time (ISO 8601 format, or null to clear)",
        examples=["2026-01-25T15:00:00Z"],
    )
    priority: Optional[Priority] = Field(
        default=None,
        description="Updated priority level (high/medium/low, or null to clear)",
        examples=["medium"],
    )
    tag_ids: Optional[List[str]] = Field(
        default=None,
        description="Updated list of tag IDs (replaces existing tags)",
        examples=[["tag_abc123"]],
    )
    # NEW fields for 006-recurring-reminders
    recurrence: Optional[RecurrenceConfig] = Field(
        default=None,
        description="Updated recurrence configuration (or null to remove)",
    )

    @field_validator("title")
    @classmethod
    def title_not_whitespace_only(cls, v: Optional[str]) -> Optional[str]:
        """Ensure title is not just whitespace if provided."""
        if v is not None:
            if v.strip() == "":
                raise ValueError("Title cannot be empty or whitespace only")
            return v.strip()
        return v


class TodoResponse(BaseModel):
    """
    Response schema for todo data.

    Returns all todo fields including timestamps and tags.
    Task Reference: T012 - Add tags array (005-todo-enhancements)
    """

    id: str = Field(
        ...,
        description="Unique todo identifier",
        examples=["V1StGXR8_Z5jdHi6B-myT"],
    )
    title: str = Field(
        ...,
        description="Task title",
        examples=["Buy groceries"],
    )
    description: Optional[str] = Field(
        default=None,
        description="Task description",
        examples=["Milk, eggs, bread"],
    )
    completed: bool = Field(
        ...,
        description="Whether the task is completed",
        examples=[False],
    )
    user_id: str = Field(
        ...,
        description="Owner's user ID",
        examples=["user_abc123"],
    )
    created_at: datetime = Field(
        ...,
        description="Creation timestamp (UTC)",
        examples=["2026-01-17T10:30:00Z"],
    )
    updated_at: datetime = Field(
        ...,
        description="Last update timestamp (UTC)",
        examples=["2026-01-17T10:30:00Z"],
    )
    # NEW fields for 005-todo-enhancements
    due_date: Optional[datetime] = Field(
        default=None,
        description="Deadline date and time (ISO 8601 format)",
        examples=["2026-01-25T15:00:00Z"],
    )
    priority: Optional[Priority] = Field(
        default=None,
        description="Priority level (high/medium/low)",
        examples=["high"],
    )
    tags: List[TagInTodoResponse] = Field(
        default_factory=list,
        description="Tags assigned to this todo",
    )
    # NEW fields for 006-recurring-reminders
    is_recurring: bool = Field(
        default=False,
        description="Whether this todo recurs",
    )
    rrule: Optional[str] = Field(
        default=None,
        description="RFC 5545 RRULE string for recurrence pattern",
        examples=["FREQ=WEEKLY;BYDAY=MO,WE,FR"],
    )
    recurrence_end_date: Optional[date] = Field(
        default=None,
        description="Date when recurrence ends (if set)",
    )
    next_occurrence_date: Optional[date] = Field(
        default=None,
        description="Date of the next pending occurrence",
    )
    # T076, T078 [US4] - Current occurrence info for frontend toggle handling
    current_occurrence_id: Optional[str] = Field(
        default=None,
        description="ID of the current/next pending occurrence",
    )
    current_occurrence_status: Optional[str] = Field(
        default=None,
        description="Status of the current occurrence (pending/completed/skipped)",
    )

    model_config = {"from_attributes": True}
