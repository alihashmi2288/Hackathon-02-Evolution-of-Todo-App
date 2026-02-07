"""
Tag model for todo categorization.

Task Reference: T002 - Create Tag model
Feature: 005-todo-enhancements

Provides user-created categorization labels with:
- nanoid-based primary key (21 chars, URL-safe)
- User ownership via user_id for data isolation
- Color customization (hex format)
- Case-insensitive unique constraint on name per user
"""

from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from nanoid import generate
from sqlalchemy import Index
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .todo import Todo
    from .todo_tag import TodoTag


def generate_tag_id() -> str:
    """Generate a unique tag ID using nanoid (21 chars, URL-safe)."""
    return generate(size=21)


class Tag(SQLModel, table=True):
    """
    Tag entity for categorizing todos.

    Attributes:
        id: Unique identifier (nanoid, 21 chars)
        name: Tag display name (1-50 chars)
        color: Hex color code for visual display (default: blue)
        user_id: Owner's user ID from JWT (indexed for fast lookups)
        created_at: Creation timestamp (UTC)
        updated_at: Last modification timestamp (UTC)

    Constraints:
        - name + user_id: Unique combination (case-insensitive)
    """

    __tablename__ = "tags"
    __table_args__ = (
        Index("idx_tags_user_id", "user_id"),
    )

    id: str = Field(
        default_factory=generate_tag_id,
        primary_key=True,
        max_length=21,
        description="Unique tag identifier (nanoid)",
    )
    name: str = Field(
        ...,
        max_length=50,
        min_length=1,
        description="Tag display name",
    )
    color: str = Field(
        default="#3B82F6",
        max_length=7,
        description="Hex color code for visual display",
    )
    user_id: str = Field(
        ...,
        index=True,
        description="Owner's user ID from JWT",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Creation timestamp (UTC)",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last update timestamp (UTC)",
    )

    # Relationships
    todo_tags: List["TodoTag"] = Relationship(back_populates="tag")
