"""
Reminder request/response schemas.

Task Reference: T032 - Create ReminderCreate, ReminderResponse schemas
Feature: 006-recurring-reminders

Pydantic schemas for reminder management.
"""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator


class ReminderCreate(BaseModel):
    """
    Request schema for creating a reminder.

    Task Reference: T032
    """

    todo_id: str = Field(
        ...,
        description="Todo to attach the reminder to",
        examples=["todo_abc123"],
    )
    occurrence_id: Optional[str] = Field(
        default=None,
        description="Specific occurrence ID (for recurring todos)",
        examples=["occ_xyz789"],
    )
    fire_at: Optional[datetime] = Field(
        default=None,
        description="Absolute time to fire the reminder (UTC)",
    )
    offset_minutes: Optional[int] = Field(
        default=None,
        ge=-10080,  # Max 1 week before
        le=0,
        description="Minutes before due_date to fire (negative value, e.g., -30)",
        examples=[-30, -60, -1440],
    )

    @model_validator(mode="after")
    def validate_fire_time(self) -> "ReminderCreate":
        """Ensure either fire_at or offset_minutes is provided, but not both."""
        if self.fire_at is None and self.offset_minutes is None:
            raise ValueError("Either fire_at or offset_minutes must be provided")
        if self.fire_at is not None and self.offset_minutes is not None:
            raise ValueError("fire_at and offset_minutes are mutually exclusive")
        return self


class ReminderResponse(BaseModel):
    """
    Response schema for reminder data.

    Task Reference: T032
    """

    id: str = Field(
        ...,
        description="Unique reminder identifier",
        examples=["rem_abc123"],
    )
    todo_id: str = Field(
        ...,
        description="Associated todo ID",
    )
    occurrence_id: Optional[str] = Field(
        default=None,
        description="Associated occurrence ID (for recurring todos)",
    )
    fire_at: datetime = Field(
        ...,
        description="When the reminder will fire (UTC)",
    )
    offset_minutes: Optional[int] = Field(
        default=None,
        description="Minutes offset from due date (if set)",
    )
    status: Literal["pending", "sent", "snoozed", "cancelled"] = Field(
        ...,
        description="Current reminder status",
        examples=["pending"],
    )
    sent_at: Optional[datetime] = Field(
        default=None,
        description="When the reminder was sent (if sent)",
    )
    snoozed_until: Optional[datetime] = Field(
        default=None,
        description="Snooze end time (if snoozed)",
    )
    created_at: datetime = Field(
        ...,
        description="When the reminder was created",
    )

    model_config = {"from_attributes": True}


class ReminderSnooze(BaseModel):
    """
    Request schema for snoozing a reminder.

    Task Reference: T032
    """

    snooze_minutes: int = Field(
        ...,
        ge=5,
        le=10080,  # Max 1 week
        description="Minutes to snooze the reminder",
        examples=[15, 30, 60, 1440],
    )


class ReminderListResponse(BaseModel):
    """
    Response schema for listing reminders.

    Task Reference: T032
    """

    items: list[ReminderResponse] = Field(
        ...,
        description="List of reminders",
    )
    total: int = Field(
        ...,
        description="Total number of reminders",
    )
