"""
Chat request/response schemas.

Task Reference: T007 (007-ai-todo-chatbot)
Feature: 007-ai-todo-chatbot
"""

from datetime import datetime
from typing import List, Optional, Any

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Request schema for sending a message to the chatbot."""
    conversation_id: Optional[str] = Field(
        default=None,
        description="Existing conversation ID (creates new if not provided)",
    )
    message: str = Field(
        ...,
        min_length=1,
        description="User's natural language message",
    )


class ChatResponse(BaseModel):
    """Response schema for chatbot reply."""
    conversation_id: str = Field(
        ...,
        description="The conversation ID",
    )
    response: str = Field(
        ...,
        description="AI assistant's response",
    )
    tool_calls: List[Any] = Field(
        default_factory=list,
        description="List of MCP tools invoked",
    )


class ChatMessage(BaseModel):
    """Schema for a single chat message in history."""
    id: str = Field(..., description="Message ID")
    role: str = Field(..., description="Role of the sender (user/assistant)")
    content: str = Field(..., description="Message content")
    created_at: datetime = Field(..., description="Message creation timestamp")


class ChatHistoryResponse(BaseModel):
    """Response schema for chat history."""
    conversation_id: str = Field(..., description="The conversation ID")
    messages: List[ChatMessage] = Field(
        default_factory=list,
        description="Ordered list of conversation messages",
    )
