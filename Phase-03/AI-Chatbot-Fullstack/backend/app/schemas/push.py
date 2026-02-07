"""
Push notification request/response schemas.

Task Reference: T122-T125 [US12] - Push notification endpoints
Feature: 006-recurring-reminders

Pydantic schemas for push subscription and VAPID key data.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PushSubscriptionKeys(BaseModel):
    """
    Web Push subscription keys.

    Task Reference: T124 [US12]
    """

    p256dh: str = Field(
        ...,
        description="P-256 ECDH public key",
        examples=["BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQ"],
    )
    auth: str = Field(
        ...,
        description="Authentication secret",
        examples=["tBHItJI5svbpez7KI4CCXg"],
    )


class PushSubscriptionCreate(BaseModel):
    """
    Request schema for creating a push subscription.

    Task Reference: T124 [US12]
    """

    endpoint: str = Field(
        ...,
        description="Push service endpoint URL",
        examples=["https://fcm.googleapis.com/fcm/send/..."],
    )
    keys: PushSubscriptionKeys = Field(
        ...,
        description="Subscription keys for encryption",
    )
    user_agent: Optional[str] = Field(
        default=None,
        description="Browser user agent (optional)",
    )


class PushSubscriptionResponse(BaseModel):
    """
    Response schema for push subscription data.

    Task Reference: T124 [US12]
    """

    id: str = Field(
        ...,
        description="Unique subscription identifier",
    )
    endpoint: str = Field(
        ...,
        description="Push service endpoint URL",
    )
    created_at: datetime = Field(
        ...,
        description="When the subscription was created",
    )
    last_used_at: Optional[datetime] = Field(
        default=None,
        description="When the subscription was last used",
    )

    model_config = {"from_attributes": True}


class PushSubscriptionListResponse(BaseModel):
    """
    Response schema for listing push subscriptions.

    Task Reference: T124 [US12]
    """

    items: list[PushSubscriptionResponse] = Field(
        ...,
        description="List of push subscriptions",
    )
    total: int = Field(
        ...,
        description="Total number of subscriptions",
    )


class VapidPublicKeyResponse(BaseModel):
    """
    Response schema for VAPID public key.

    Task Reference: T123 [US12]
    """

    public_key: str = Field(
        ...,
        description="VAPID public key for push subscription",
        examples=["BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"],
    )
    configured: bool = Field(
        ...,
        description="Whether push notifications are configured on the server",
    )


class UnsubscribeRequest(BaseModel):
    """
    Request schema for unsubscribing from push notifications.

    Task Reference: T125 [US12]
    """

    endpoint: str = Field(
        ...,
        description="Push service endpoint URL to unsubscribe",
    )
