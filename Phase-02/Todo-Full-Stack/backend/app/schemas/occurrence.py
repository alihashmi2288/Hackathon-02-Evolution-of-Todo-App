"""
Occurrence request/response schemas.

Task Reference: T031 - Create OccurrenceResponse schema
Feature: 006-recurring-reminders

Pydantic schemas for todo occurrence data.
"""

from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class OccurrenceResponse(BaseModel):
    """
    Response schema for a single occurrence of a recurring todo.

    Task Reference: T031
    """

    id: str = Field(
        ...,
        description="Unique occurrence identifier",
        examples=["occ_abc123xyz"],
    )
    parent_todo_id: str = Field(
        ...,
        description="Parent recurring todo ID",
        examples=["todo_xyz789"],
    )
    occurrence_date: date = Field(
        ...,
        description="Scheduled date for this occurrence",
        examples=["2026-01-25"],
    )
    status: Literal["pending", "completed", "skipped"] = Field(
        ...,
        description="Occurrence completion status",
        examples=["pending"],
    )
    completed_at: Optional[datetime] = Field(
        default=None,
        description="When the occurrence was completed (if completed)",
    )
    created_at: datetime = Field(
        ...,
        description="When this occurrence record was created",
    )

    model_config = {"from_attributes": True}


class OccurrenceUpdate(BaseModel):
    """
    Request schema for updating an occurrence.

    Task Reference: T031
    """

    status: Optional[Literal["pending", "completed", "skipped"]] = Field(
        default=None,
        description="Updated status for the occurrence",
    )


class OccurrenceListResponse(BaseModel):
    """
    Response schema for listing occurrences.

    Task Reference: T031
    """

    items: list[OccurrenceResponse] = Field(
        ...,
        description="List of occurrences",
    )
    total: int = Field(
        ...,
        description="Total number of occurrences matching the query",
    )
