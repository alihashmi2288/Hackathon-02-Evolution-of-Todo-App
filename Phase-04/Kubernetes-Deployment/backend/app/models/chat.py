from datetime import datetime, timezone
from typing import List, Optional

from nanoid import generate
from sqlmodel import Field, Relationship, SQLModel

def generate_id() -> str:
    """Generate a unique ID using nanoid (21 chars, URL-safe)."""
    return generate(size=21)

class Conversation(SQLModel, table=True):
    """
    Conversation entity representing a chat session.
    """
    __tablename__ = "conversations"

    id: str = Field(
        default_factory=generate_id,
        primary_key=True,
        max_length=21,
        description="Unique conversation identifier",
    )
    user_id: str = Field(
        ...,
        index=True,
        description="Owner's user ID",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Creation timestamp (UTC)",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last update timestamp (UTC)",
    )

    messages: List["Message"] = Relationship(back_populates="conversation")

class Message(SQLModel, table=True):
    """
    Message entity within a conversation.
    """
    __tablename__ = "messages"

    id: str = Field(
        default_factory=generate_id,
        primary_key=True,
        max_length=21,
        description="Unique message identifier",
    )
    conversation_id: str = Field(
        ...,
        foreign_key="conversations.id",
        index=True,
        description="ID of the conversation this message belongs to",
    )
    role: str = Field(
        ...,
        description="Role of the message sender (user/assistant)",
    )
    content: str = Field(
        ...,
        description="Content of the message",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Creation timestamp (UTC)",
    )

    conversation: Conversation = Relationship(back_populates="messages")
