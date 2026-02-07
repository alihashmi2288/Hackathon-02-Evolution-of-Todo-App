"""
UserPreferences model for user-specific settings.

Task Reference: T015 - Create UserPreferences model
Feature: 006-recurring-reminders

User-specific settings for reminders, notifications, and timezone.
"""

from datetime import datetime, time, timezone
from typing import Optional

from nanoid import generate
from sqlmodel import Field, SQLModel


def generate_preferences_id() -> str:
    """Generate a unique preferences ID using nanoid (21 chars, URL-safe)."""
    return generate(size=21)


class UserPreferences(SQLModel, table=True):
    """
    User-specific settings for reminders and notifications.

    Attributes:
        id: Unique identifier (nanoid, 21 chars)
        user_id: Associated user (unique)
        timezone: IANA timezone (e.g., "America/New_York")
        default_reminder_offset: Default minutes before due for auto-reminders
        push_enabled: Whether push notifications are enabled
        daily_digest_enabled: Whether daily digest is enabled
        daily_digest_time: Time to send daily digest (in user's TZ)
        created_at: Record creation time
        updated_at: Last modification time
    """

    __tablename__ = "user_preferences"

    id: str = Field(
        default_factory=generate_preferences_id,
        primary_key=True,
        max_length=21,
        description="Unique preferences identifier (nanoid)",
    )
    user_id: str = Field(
        ...,
        unique=True,
        index=True,
        description="Associated user",
    )
    timezone: str = Field(
        default="UTC",
        max_length=50,
        description="IANA timezone identifier",
    )
    default_reminder_offset: Optional[int] = Field(
        default=None,
        description="Default minutes before due for auto-reminders (negative)",
    )
    push_enabled: bool = Field(
        default=True,
        description="Whether push notifications are enabled",
    )
    daily_digest_enabled: bool = Field(
        default=False,
        description="Whether daily digest is enabled",
    )
    daily_digest_time: Optional[time] = Field(
        default=None,
        description="Time to send daily digest (in user's timezone)",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Record creation time",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last modification time",
    )
