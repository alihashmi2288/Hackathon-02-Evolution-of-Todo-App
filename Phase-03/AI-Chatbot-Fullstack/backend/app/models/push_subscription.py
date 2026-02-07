"""
PushSubscription model for browser push notifications.

Task Reference: T014 - Create PushSubscription model
Feature: 006-recurring-reminders

Stores browser push notification subscriptions for users.
"""

from datetime import datetime, timezone
from typing import Optional

from nanoid import generate
from sqlalchemy import Index
from sqlmodel import Field, SQLModel


def generate_subscription_id() -> str:
    """Generate a unique subscription ID using nanoid (21 chars, URL-safe)."""
    return generate(size=21)


class PushSubscription(SQLModel, table=True):
    """
    Browser push notification subscription.

    Attributes:
        id: Unique identifier (nanoid, 21 chars)
        user_id: Owner
        endpoint: Push service URL (unique)
        p256dh_key: Encryption key
        auth_key: Auth secret
        user_agent: Browser user agent (for debugging)
        created_at: When registered
        last_used_at: Last successful push
    """

    __tablename__ = "push_subscriptions"
    __table_args__ = (
        Index("idx_push_user", "user_id"),
    )

    id: str = Field(
        default_factory=generate_subscription_id,
        primary_key=True,
        max_length=21,
        description="Unique subscription identifier (nanoid)",
    )
    user_id: str = Field(
        ...,
        index=True,
        description="Owner",
    )
    endpoint: str = Field(
        ...,
        max_length=500,
        unique=True,
        description="Push service URL",
    )
    p256dh_key: str = Field(
        ...,
        max_length=200,
        description="User public key for encryption",
    )
    auth_key: str = Field(
        ...,
        max_length=100,
        description="Auth secret",
    )
    user_agent: Optional[str] = Field(
        default=None,
        max_length=300,
        description="Browser user agent (for debugging)",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="When registered",
    )
    last_used_at: Optional[datetime] = Field(
        default=None,
        description="Last successful push",
    )
