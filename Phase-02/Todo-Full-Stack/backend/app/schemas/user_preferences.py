"""
User preferences request/response schemas.

Task Reference: T035 - Create UserPreferencesUpdate, UserPreferencesResponse schemas
Feature: 006-recurring-reminders

Pydantic schemas for user preferences management.
"""

from datetime import datetime, time
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class UserPreferencesUpdate(BaseModel):
    """
    Request schema for updating user preferences.

    Task Reference: T035

    All fields optional - only provided fields are updated.
    """

    timezone: Optional[str] = Field(
        default=None,
        max_length=50,
        description="IANA timezone identifier",
        examples=["America/New_York", "Europe/London", "Asia/Tokyo"],
    )
    default_reminder_offset: Optional[int] = Field(
        default=None,
        ge=-10080,  # Max 1 week before
        le=0,
        description="Default minutes before due for auto-reminders (negative)",
        examples=[-30, -60, -1440],
    )
    push_enabled: Optional[bool] = Field(
        default=None,
        description="Whether push notifications are enabled",
    )
    daily_digest_enabled: Optional[bool] = Field(
        default=None,
        description="Whether daily digest is enabled",
    )
    daily_digest_time: Optional[time] = Field(
        default=None,
        description="Time to send daily digest (in user's timezone)",
        examples=["08:00:00", "09:30:00"],
    )

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, v: Optional[str]) -> Optional[str]:
        """Validate timezone is a valid IANA identifier."""
        if v is None:
            return v
        # Basic validation - full validation done in service layer
        # with pytz or zoneinfo
        if not v or len(v) < 2:
            raise ValueError("Invalid timezone identifier")
        return v


class UserPreferencesResponse(BaseModel):
    """
    Response schema for user preferences data.

    Task Reference: T035
    """

    id: str = Field(
        ...,
        description="Unique preferences identifier",
        examples=["pref_abc123"],
    )
    user_id: str = Field(
        ...,
        description="Associated user ID",
    )
    timezone: str = Field(
        ...,
        description="IANA timezone identifier",
        examples=["America/New_York"],
    )
    default_reminder_offset: Optional[int] = Field(
        default=None,
        description="Default minutes before due for auto-reminders",
    )
    push_enabled: bool = Field(
        ...,
        description="Whether push notifications are enabled",
    )
    daily_digest_enabled: bool = Field(
        ...,
        description="Whether daily digest is enabled",
    )
    daily_digest_time: Optional[time] = Field(
        default=None,
        description="Time to send daily digest (in user's timezone)",
    )
    created_at: datetime = Field(
        ...,
        description="When preferences were created",
    )
    updated_at: datetime = Field(
        ...,
        description="When preferences were last updated",
    )

    model_config = {"from_attributes": True}
