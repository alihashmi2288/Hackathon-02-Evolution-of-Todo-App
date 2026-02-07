"""
Base model for all database entities.

Task Reference: T033 - Create backend/app/models/base.py
Feature: 001-project-init-architecture

Provides common fields and functionality for all SQLModel entities,
including user ownership tracking for multi-tenant data isolation.
"""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class TimestampMixin(SQLModel):
    """Mixin providing created_at and updated_at timestamps."""

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="When the record was created",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
        description="When the record was last updated",
    )


class UserOwnedMixin(SQLModel):
    """
    Mixin for models owned by a specific user.

    All user-owned resources MUST include user_id for data isolation.
    This enables row-level security and ensures users can only access
    their own data.
    """

    user_id: str = Field(
        ...,
        index=True,
        description="ID of the user who owns this resource",
    )


class BaseModel(TimestampMixin, SQLModel):
    """
    Base model with common fields for all entities.

    Provides:
    - UUID primary key
    - created_at / updated_at timestamps

    Usage:
        class Todo(BaseModel, UserOwnedMixin, table=True):
            title: str
            completed: bool = False
    """

    id: Optional[UUID] = Field(
        default_factory=uuid4,
        primary_key=True,
        description="Unique identifier",
    )


class UserOwnedModel(BaseModel, UserOwnedMixin):
    """
    Base model for user-owned resources.

    Combines BaseModel with UserOwnedMixin for convenience.

    Usage:
        class Todo(UserOwnedModel, table=True):
            title: str
            completed: bool = False
    """

    pass
