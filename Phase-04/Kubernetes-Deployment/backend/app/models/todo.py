"""
Todo model for task management.

Task Reference: T002 - Create Todo SQLModel entity (003-todo-crud)
Task Reference: T004 - Extend Todo model (005-todo-enhancements)
Task Reference: T007 - Add recurrence fields (006-recurring-reminders)
Feature: 003-todo-crud, 005-todo-enhancements, 006-recurring-reminders

Provides the Todo SQLModel entity with:
- nanoid-based primary key (21 chars, URL-safe)
- User ownership via user_id for data isolation
- UTC timestamps with automatic updates
- Optional due_date for deadline tracking
- Optional priority level (high/medium/low)
- Many-to-many relationship with Tags
- Recurrence support (RRULE strings, end date/count)
"""

from datetime import date, datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from nanoid import generate
from sqlalchemy import Enum as SAEnum
from sqlalchemy import Index
from sqlmodel import Field, Relationship, SQLModel

from .priority import Priority

if TYPE_CHECKING:
    from .tag import Tag
    from .todo_tag import TodoTag
    from .occurrence import TodoOccurrence
    from .reminder import Reminder


def generate_todo_id() -> str:
    """Generate a unique todo ID using nanoid (21 chars, URL-safe)."""
    return generate(size=21)


class Todo(SQLModel, table=True):
    """
    Todo entity representing a user's task.

    Attributes:
        id: Unique identifier (nanoid, 21 chars)
        title: Task title (required, max 255 chars)
        description: Optional detailed description
        completed: Whether the task is done (default: False)
        user_id: Owner's user ID from JWT (indexed for fast lookups)
        created_at: Creation timestamp (UTC)
        updated_at: Last modification timestamp (UTC)
        due_date: Optional deadline date (NEW - 005-todo-enhancements)
        priority: Optional priority level (NEW - 005-todo-enhancements)
    """

    __tablename__ = "todos"
    __table_args__ = (
        Index("idx_todos_due_date", "due_date"),
        Index("idx_todos_priority", "priority"),
        Index("idx_todos_user_completed", "user_id", "completed"),
        Index("idx_todos_recurring", "user_id", "is_recurring"),
    )

    id: str = Field(
        default_factory=generate_todo_id,
        primary_key=True,
        max_length=21,
        description="Unique todo identifier (nanoid)",
    )
    title: str = Field(
        ...,
        max_length=255,
        min_length=1,
        description="Task title (required)",
    )
    description: Optional[str] = Field(
        default=None,
        description="Optional detailed description",
    )
    completed: bool = Field(
        default=False,
        description="Whether the task is completed",
    )
    user_id: str = Field(
        ...,
        index=True,
        description="Owner's user ID from JWT",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Creation timestamp (UTC)",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last update timestamp (UTC)",
    )

    # NEW fields for 005-todo-enhancements
    due_date: Optional[datetime] = Field(
        default=None,
        description="Optional deadline date and time (UTC)",
    )
    priority: Optional[Priority] = Field(
        default=None,
        sa_type=SAEnum(Priority, name="priority_enum", create_type=True),
        description="Optional priority level (high/medium/low)",
    )

    # NEW fields for 006-recurring-reminders
    is_recurring: bool = Field(
        default=False,
        description="Whether this todo is a recurring series",
    )
    rrule: Optional[str] = Field(
        default=None,
        max_length=500,
        description="RFC 5545 RRULE string (e.g., FREQ=WEEKLY;BYDAY=MO,WE,FR)",
    )
    recurrence_end_date: Optional[date] = Field(
        default=None,
        description="Explicit end date for the recurring series",
    )
    recurrence_count: Optional[int] = Field(
        default=None,
        ge=1,
        le=365,
        description="Number of occurrences (alternative to end date)",
    )
    occurrences_generated: int = Field(
        default=0,
        description="Count of occurrences created so far",
    )

    # Relationships for tags
    todo_tags: List["TodoTag"] = Relationship(back_populates="todo")

    # Relationships for occurrences and reminders (006-recurring-reminders)
    occurrences: List["TodoOccurrence"] = Relationship(back_populates="parent_todo")
    reminders: List["Reminder"] = Relationship(back_populates="todo")
