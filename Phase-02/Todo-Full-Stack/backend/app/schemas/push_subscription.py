"""
Push subscription request/response schemas.

Task Reference: T034 - Create PushSubscriptionCreate, PushSubscriptionResponse schemas
Feature: 006-recurring-reminders

Pydantic schemas for Web Push subscription management.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl


class PushSubscriptionKeys(BaseModel):
    """
    Web Push subscription keys.

    Task Reference: T034
    """

    p256dh: str = Field(
        ...,
        description="P-256 Diffie-Hellman public key",
    )
    auth: str = Field(
        ...,
        description="Authentication secret",
    )


class PushSubscriptionCreate(BaseModel):
    """
    Request schema for creating a push subscription.

    Task Reference: T034

    Matches the Web Push API PushSubscription format.
    """

    endpoint: str = Field(
        ...,
        description="Push service endpoint URL",
        examples=["https://fcm.googleapis.com/fcm/send/..."],
    )
    keys: PushSubscriptionKeys = Field(
        ...,
        description="Subscription encryption keys",
    )
    user_agent: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Browser user agent string",
    )


class PushSubscriptionResponse(BaseModel):
    """
    Response schema for push subscription data.

    Task Reference: T034
    """

    id: str = Field(
        ...,
        description="Unique subscription identifier",
        examples=["push_abc123"],
    )
    endpoint: str = Field(
        ...,
        description="Push service endpoint URL (truncated for privacy)",
    )
    user_agent: Optional[str] = Field(
        default=None,
        description="Browser user agent",
    )
    created_at: datetime = Field(
        ...,
        description="When the subscription was created",
    )
    last_used_at: Optional[datetime] = Field(
        default=None,
        description="When a notification was last sent to this subscription",
    )

    model_config = {"from_attributes": True}


class PushSubscriptionListResponse(BaseModel):
    """
    Response schema for listing push subscriptions.

    Task Reference: T034
    """

    items: list[PushSubscriptionResponse] = Field(
        ...,
        description="List of push subscriptions",
    )
    total: int = Field(
        ...,
        description="Total number of subscriptions",
    )
