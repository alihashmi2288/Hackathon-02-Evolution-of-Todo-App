"""
Session model for database-backed authentication.

Task Reference: T033 (Support DB Session fallback)
Feature: 002-auth-identity

This model maps to the 'session' table created by Better Auth.
Used when the client uses opaque session tokens instead of JWTs.
"""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Session(SQLModel, table=True):
    """
    Better Auth session table.

    Maps directly to the schema defined in frontend/drizzle/schema.ts
    """

    __tablename__ = "session"  # Better Auth uses singular 'session' table name

    # Better Auth uses text IDs for sessions
    id: str = Field(primary_key=True)
    
    # The opaque token string sent by the client
    token: str = Field(unique=True, index=True)
    
    # Expiration timestamp
    expires_at: datetime
    
    # User relationship (foreign key)
    # We use str for user_id to match the Text update we made earlier
    user_id: str = Field(index=True)
    
    # Metadata fields managed by Better Auth
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
