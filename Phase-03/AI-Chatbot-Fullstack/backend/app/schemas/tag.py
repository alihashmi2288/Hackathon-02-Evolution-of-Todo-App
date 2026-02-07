"""
Tag request/response schemas.

Task Reference: T008 - Create TagCreate and TagUpdate schemas
Task Reference: T009 - Create TagResponse schema with todo_count
Feature: 005-todo-enhancements

Provides Pydantic schemas for:
- TagCreate: Request body for creating a new tag
- TagUpdate: Request body for partially updating a tag
- TagResponse: Response body for tag data (includes todo_count)
"""

import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# Regex for validating hex color codes
HEX_COLOR_REGEX = re.compile(r"^#[0-9A-Fa-f]{6}$")

# Default color (Tailwind blue-500)
DEFAULT_TAG_COLOR = "#3B82F6"

# Predefined color palette for tags
TAG_COLOR_PALETTE = [
    "#3B82F6",  # blue
    "#EF4444",  # red
    "#10B981",  # green
    "#F59E0B",  # amber
    "#8B5CF6",  # violet
    "#EC4899",  # pink
    "#06B6D4",  # cyan
    "#6B7280",  # gray
]


class TagCreate(BaseModel):
    """
    Request schema for creating a new tag.

    Task Reference: T008
    """

    name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Tag display name (required, 1-50 chars)",
        examples=["Work"],
    )
    color: str = Field(
        default=DEFAULT_TAG_COLOR,
        max_length=7,
        description="Hex color code (#RRGGBB)",
        examples=["#3B82F6"],
    )

    @field_validator("name")
    @classmethod
    def name_not_whitespace_only(cls, v: str) -> str:
        """Ensure name is not just whitespace."""
        if v.strip() == "":
            raise ValueError("Tag name cannot be empty or whitespace only")
        return v.strip()

    @field_validator("color")
    @classmethod
    def validate_hex_color(cls, v: str) -> str:
        """Validate hex color format."""
        if not HEX_COLOR_REGEX.match(v):
            raise ValueError("Color must be a valid hex code (#RRGGBB)")
        return v.upper()


class TagUpdate(BaseModel):
    """
    Request schema for partially updating a tag.

    All fields are optional - only provided fields are updated.
    Task Reference: T008
    """

    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=50,
        description="Updated tag name",
        examples=["Personal"],
    )
    color: Optional[str] = Field(
        default=None,
        max_length=7,
        description="Updated hex color code",
        examples=["#EF4444"],
    )

    @field_validator("name")
    @classmethod
    def name_not_whitespace_only(cls, v: Optional[str]) -> Optional[str]:
        """Ensure name is not just whitespace if provided."""
        if v is not None:
            if v.strip() == "":
                raise ValueError("Tag name cannot be empty or whitespace only")
            return v.strip()
        return v

    @field_validator("color")
    @classmethod
    def validate_hex_color(cls, v: Optional[str]) -> Optional[str]:
        """Validate hex color format if provided."""
        if v is not None:
            if not HEX_COLOR_REGEX.match(v):
                raise ValueError("Color must be a valid hex code (#RRGGBB)")
            return v.upper()
        return v


class TagResponse(BaseModel):
    """
    Response schema for tag data.

    Returns all tag fields including timestamps.
    Task Reference: T009
    """

    id: str = Field(
        ...,
        description="Unique tag identifier",
        examples=["V1StGXR8_Z5jdHi6B-myT"],
    )
    name: str = Field(
        ...,
        description="Tag display name",
        examples=["Work"],
    )
    color: str = Field(
        ...,
        description="Hex color code",
        examples=["#3B82F6"],
    )
    user_id: str = Field(
        ...,
        description="Owner's user ID",
        examples=["user_abc123"],
    )
    created_at: datetime = Field(
        ...,
        description="Creation timestamp (UTC)",
        examples=["2026-01-18T10:30:00Z"],
    )
    updated_at: datetime = Field(
        ...,
        description="Last update timestamp (UTC)",
        examples=["2026-01-18T10:30:00Z"],
    )

    model_config = {"from_attributes": True}


class TagWithCountResponse(TagResponse):
    """
    Response schema for tag data with todo count.

    Extends TagResponse with todo_count for list views.
    Task Reference: T009
    """

    todo_count: int = Field(
        default=0,
        description="Number of todos using this tag",
        examples=[5],
    )
