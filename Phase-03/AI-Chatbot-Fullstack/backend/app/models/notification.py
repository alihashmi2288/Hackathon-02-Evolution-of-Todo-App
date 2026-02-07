"""
Notification model for in-app notification center.

Task Reference: T013 - Create Notification model
Feature: 006-recurring-reminders

In-app notification record for the notification center.
Auto-deleted after 30 days.
"""

from datetime import datetime, timezone
from typing import Optional

from nanoid import generate
from sqlalchemy import Enum as SAEnum
from sqlalchemy import Index
from sqlmodel import Field, SQLModel

from .enums import NotificationType


def generate_notification_id() -> str:
    """Generate a unique notification ID using nanoid (21 chars, URL-safe)."""
    return generate(size=21)


class Notification(SQLModel, table=True):
    """
    In-app notification record.

    Attributes:
        id: Unique identifier (nanoid, 21 chars)
        user_id: Recipient
        type: reminder, daily_digest, or recurring_due
        title: Notification title (max 200 chars)
        body: Notification body text (max 500 chars)
        todo_id: Related todo (for click-through)
        read: Whether user has seen it
        created_at: When notification was created
    """

    __tablename__ = "notifications"
    __table_args__ = (
        Index("idx_notifications_user_read", "user_id", "read"),
        Index("idx_notifications_user_created", "user_id", "created_at"),
    )

    id: str = Field(
        default_factory=generate_notification_id,
        primary_key=True,
        max_length=21,
        description="Unique notification identifier (nanoid)",
    )
    user_id: str = Field(
        ...,
        index=True,
        description="Recipient",
    )
    type: NotificationType = Field(
        ...,
        sa_type=SAEnum(NotificationType, name="notification_type_enum", create_type=True),
        description="Type: reminder, daily_digest, or recurring_due",
    )
    title: str = Field(
        ...,
        max_length=200,
        description="Notification title",
    )
    body: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Notification body text",
    )
    todo_id: Optional[str] = Field(
        default=None,
        foreign_key="todos.id",
        description="Related todo (for click-through)",
    )
    reminder_id: Optional[str] = Field(
        default=None,
        foreign_key="reminders.id",
        description="Related reminder (for snooze action)",
    )
    read: bool = Field(
        default=False,
        index=True,
        description="Whether user has seen it",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True,
        description="When notification was created",
    )
