"""
Recurrence schemas for API requests/responses.

Task Reference: T029 - Create RecurrenceConfig Pydantic schema
Feature: 006-recurring-reminders

Pydantic schemas for recurrence configuration.
"""

from datetime import date
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, model_validator


class RecurrenceConfig(BaseModel):
    """
    Configuration for creating recurring todos.

    The system converts this to an RFC 5545 RRULE string.
    """

    frequency: Literal["daily", "weekly", "monthly", "yearly", "custom"] = Field(
        ...,
        description="Basic recurrence frequency",
    )
    interval: int = Field(
        default=1,
        ge=1,
        le=365,
        description="Repeat every N frequency units (e.g., every 2 weeks)",
    )
    days_of_week: Optional[List[Literal["MO", "TU", "WE", "TH", "FR", "SA", "SU"]]] = Field(
        default=None,
        description="For weekly frequency - which days to repeat",
    )
    day_of_month: Optional[int] = Field(
        default=None,
        ge=1,
        le=31,
        description="For monthly frequency - which day of month",
    )
    end_date: Optional[date] = Field(
        default=None,
        description="Date to stop recurring (exclusive with end_count)",
    )
    end_count: Optional[int] = Field(
        default=None,
        ge=1,
        le=365,
        description="Number of occurrences (exclusive with end_date)",
    )

    @model_validator(mode="after")
    def validate_end_conditions(self) -> "RecurrenceConfig":
        """Ensure end_date and end_count are mutually exclusive."""
        if self.end_date is not None and self.end_count is not None:
            raise ValueError("end_date and end_count are mutually exclusive")
        return self

    @model_validator(mode="after")
    def validate_frequency_options(self) -> "RecurrenceConfig":
        """Validate that frequency-specific options are appropriate."""
        if self.days_of_week and self.frequency not in ("weekly", "custom"):
            raise ValueError("days_of_week is only valid for weekly or custom frequency")
        if self.day_of_month and self.frequency not in ("monthly", "custom"):
            raise ValueError("day_of_month is only valid for monthly or custom frequency")
        return self
