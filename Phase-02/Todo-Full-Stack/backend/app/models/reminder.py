"""
Reminder model for todo reminders.

Task Reference: T012 - Create Reminder model
Feature: 006-recurring-reminders

Scheduled notification for a todo (or occurrence).
"""

from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from nanoid import generate
from sqlalchemy import Enum as SAEnum
from sqlalchemy import Index
from sqlmodel import Field, Relationship, SQLModel

from .enums import ReminderStatus

if TYPE_CHECKING:
    from .todo import Todo


def generate_reminder_id() -> str:
    """Generate a unique reminder ID using nanoid (21 chars, URL-safe)."""
    return generate(size=21)


class Reminder(SQLModel, table=True):
    """
    Scheduled notification for a todo.

    Attributes:
        id: Unique identifier (nanoid, 21 chars)
        todo_id: Associated todo
        occurrence_id: Specific occurrence (if recurring)
        user_id: Owner
        fire_at: When to send notification (UTC)
        offset_minutes: Minutes before due (-5, -60, -1440, etc.)
        status: pending, sent, snoozed, or cancelled
        sent_at: When notification was sent
        snoozed_until: If snoozed, when to re-fire
        created_at: Record creation time
    """

    __tablename__ = "reminders"
    __table_args__ = (
        Index("idx_reminders_fire", "fire_at", "status"),
        Index("idx_reminders_todo", "todo_id"),
        Index("idx_reminders_user", "user_id"),
    )

    id: str = Field(
        default_factory=generate_reminder_id,
        primary_key=True,
        max_length=21,
        description="Unique reminder identifier (nanoid)",
    )
    todo_id: str = Field(
        ...,
        foreign_key="todos.id",
        index=True,
        description="Associated todo",
    )
    occurrence_id: Optional[str] = Field(
        default=None,
        foreign_key="todo_occurrences.id",
        description="Specific occurrence (if recurring)",
    )
    user_id: str = Field(
        ...,
        index=True,
        description="Owner",
    )
    fire_at: datetime = Field(
        ...,
        index=True,
        description="When to send notification (UTC)",
    )
    offset_minutes: Optional[int] = Field(
        default=None,
        description="Minutes before due time (negative number, or None for absolute time)",
    )
    status: ReminderStatus = Field(
        default=ReminderStatus.PENDING,
        sa_type=SAEnum(ReminderStatus, name="reminder_status_enum", create_type=True),
        description="Status: pending, sent, snoozed, or cancelled",
    )
    sent_at: Optional[datetime] = Field(
        default=None,
        description="When notification was sent",
    )
    snoozed_until: Optional[datetime] = Field(
        default=None,
        description="If snoozed, when to re-fire",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Record creation time",
    )

    # Relationships
    todo: "Todo" = Relationship(back_populates="reminders")
