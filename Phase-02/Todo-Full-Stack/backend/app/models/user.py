"""
User reference model for type hints.

Task Reference: T013 - Create backend/app/models/user.py
Feature: 002-auth-identity

This is a READ-ONLY reference model for the user table managed by Better Auth.
The backend does NOT create or manage this table - it's owned by the frontend.

Purpose:
- Type hints for user-related operations
- Reference for foreign key relationships
- Documentation of user schema structure

Note: User authentication and session management are handled entirely by
Better Auth on the frontend. The backend only validates JWT tokens.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    """
    Better Auth user table.
    
    This model mirrors the user table schema defined in:
    frontend/drizzle/schema.ts
    """
    __tablename__ = "user"

    id: str = Field(primary_key=True)
    email: str = Field(unique=True)
    email_verified: bool = Field(default=False, schema_extra={"map": "email_verified"})
    name: str
    image: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class UserPublic(BaseModel):
    """
    Public user information safe to expose in API responses.

    Excludes sensitive fields like email_verified status.
    """

    id: str
    email: str
    name: str
    image: Optional[str] = None


class UserMinimal(BaseModel):
    """
    Minimal user information extracted from JWT token.

    This matches the CurrentUser model in dependencies.py
    and represents what we know about a user from their token.
    """

    id: str
    email: str
