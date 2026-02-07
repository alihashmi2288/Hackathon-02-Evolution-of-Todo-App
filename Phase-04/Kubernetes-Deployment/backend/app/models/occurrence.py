"""
TodoOccurrence model for recurring task instances.

Task Reference: T011 - Create TodoOccurrence model
Feature: 006-recurring-reminders

Represents a single instance of a recurring todo with its own completion status.
Non-recurring todos don't use this table.
"""

from datetime import date, datetime, timezone
from typing import TYPE_CHECKING, Optional

from nanoid import generate
from sqlalchemy import Enum as SAEnum
from sqlalchemy import Index, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

from .enums import OccurrenceStatus

if TYPE_CHECKING:
    from .todo import Todo


def generate_occurrence_id() -> str:
    """Generate a unique occurrence ID using nanoid (21 chars, URL-safe)."""
    return generate(size=21)


class TodoOccurrence(SQLModel, table=True):
    """
    Single instance of a recurring todo.

    Attributes:
        id: Unique identifier (nanoid, 21 chars)
        parent_todo_id: The recurring series this belongs to
        user_id: Owner (denormalized for query efficiency)
        occurrence_date: Scheduled date for this occurrence
        status: pending, completed, or skipped
        completed_at: When marked complete (if applicable)
        created_at: Record creation time
        updated_at: Last modification time
    """

    __tablename__ = "todo_occurrences"
    __table_args__ = (
        Index("idx_occurrences_parent", "parent_todo_id"),
        Index("idx_occurrences_user_date", "user_id", "occurrence_date"),
        UniqueConstraint("parent_todo_id", "occurrence_date", name="uq_occurrence_date"),
    )

    id: str = Field(
        default_factory=generate_occurrence_id,
        primary_key=True,
        max_length=21,
        description="Unique occurrence identifier (nanoid)",
    )
    parent_todo_id: str = Field(
        ...,
        foreign_key="todos.id",
        index=True,
        description="The recurring series this belongs to",
    )
    user_id: str = Field(
        ...,
        index=True,
        description="Owner (denormalized for query efficiency)",
    )
    occurrence_date: date = Field(
        ...,
        index=True,
        description="Scheduled date for this occurrence",
    )
    status: OccurrenceStatus = Field(
        default=OccurrenceStatus.PENDING,
        sa_type=SAEnum(OccurrenceStatus, name="occurrence_status_enum", create_type=True),
        description="Status: pending, completed, or skipped",
    )
    completed_at: Optional[datetime] = Field(
        default=None,
        description="When marked complete",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Record creation time",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last modification time",
    )

    # Relationships
    parent_todo: "Todo" = Relationship(back_populates="occurrences")
