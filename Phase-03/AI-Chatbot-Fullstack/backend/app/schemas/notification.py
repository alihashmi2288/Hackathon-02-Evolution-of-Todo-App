"""
Notification request/response schemas.

Task Reference: T033 - Create NotificationResponse schema
Feature: 006-recurring-reminders

Pydantic schemas for notification data.
"""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class NotificationResponse(BaseModel):
    """
    Response schema for notification data.

    Task Reference: T033
    """

    id: str = Field(
        ...,
        description="Unique notification identifier",
        examples=["notif_abc123"],
    )
    type: Literal["reminder", "daily_digest", "recurring_due"] = Field(
        ...,
        description="Notification type",
        examples=["reminder"],
    )
    title: str = Field(
        ...,
        description="Notification title",
        examples=["Reminder: Buy groceries"],
    )
    body: str = Field(
        ...,
        description="Notification body text",
        examples=["Due in 30 minutes"],
    )
    todo_id: Optional[str] = Field(
        default=None,
        description="Related todo ID (if applicable)",
    )
    reminder_id: Optional[str] = Field(
        default=None,
        description="Related reminder ID (for snooze action)",
    )
    read: bool = Field(
        ...,
        description="Whether the notification has been read",
        examples=[False],
    )
    created_at: datetime = Field(
        ...,
        description="When the notification was created",
    )

    model_config = {"from_attributes": True}


class NotificationMarkRead(BaseModel):
    """
    Request schema for marking notifications as read.

    Task Reference: T033
    """

    notification_ids: list[str] = Field(
        ...,
        min_length=1,
        description="List of notification IDs to mark as read",
        examples=[["notif_abc123", "notif_def456"]],
    )


class NotificationListResponse(BaseModel):
    """
    Response schema for listing notifications.

    Task Reference: T033
    """

    items: list[NotificationResponse] = Field(
        ...,
        description="List of notifications",
    )
    total: int = Field(
        ...,
        description="Total number of notifications",
    )
    unread_count: int = Field(
        ...,
        description="Number of unread notifications",
    )
