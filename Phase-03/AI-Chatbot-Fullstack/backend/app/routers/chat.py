"""
Chat router for the AI Todo Chatbot.

Task Reference: T005, T006, T009 (007-ai-todo-chatbot)
Feature: 007-ai-todo-chatbot

Provides:
- POST /api/chat — Send a message to the AI agent (JWT auth)
- GET /api/chat/history — Retrieve conversation history (JWT auth)
"""

import logging
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, desc
from agents import Runner, Agent, function_tool

from app.database import get_session
from app.dependencies import CurrentUserDep
from app.models.chat import Conversation, Message
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChatHistoryResponse,
    ChatMessage,
)
from app.agent import gemini_model, AGENT_INSTRUCTIONS
from app.mcp_server import (
    add_task as _add_task,
    list_tasks as _list_tasks,
    complete_task as _complete_task,
    delete_task as _delete_task,
    update_task as _update_task,
)

logger = logging.getLogger("chat")

router = APIRouter(tags=["chat"])


def _create_scoped_tools(user_id: str) -> list:
    """
    Create per-request tool functions with user_id injected via closures.
    Each tool is decorated with @function_tool ONCE — no double decoration.
    """

    @function_tool
    def add_task(title: str, description: Optional[str] = None) -> str:
        """Create a new task for the user."""
        result = _add_task(user_id, title, description)
        return str(result)

    @function_tool
    def list_tasks(status: Optional[str] = "all") -> str:
        """Retrieve tasks. Status can be 'all', 'active', 'completed', or 'pending'."""
        result = _list_tasks(user_id, status)
        return str(result)

    @function_tool
    def complete_task(task_id: str) -> str:
        """Mark a task as complete."""
        result = _complete_task(user_id, task_id)
        return str(result)

    @function_tool
    def delete_task(task_id: str) -> str:
        """Delete a task."""
        result = _delete_task(user_id, task_id)
        return str(result)

    @function_tool
    def update_task(task_id: str, title: Optional[str] = None, description: Optional[str] = None) -> str:
        """Update a task's title or description."""
        result = _update_task(user_id, task_id, title, description)
        return str(result)

    return [add_task, list_tasks, complete_task, delete_task, update_task]


@router.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    current_user: CurrentUserDep,
    session: Session = Depends(get_session),
):
    """
    Send a message to the AI assistant.
    User identity resolved from JWT — never from request body or URL.
    """
    user_id = str(current_user.id)
    logger.info("Chat request received", extra={"user_id": user_id, "conversation_id": request.conversation_id})

    # 1. Fetch or create conversation
    conversation = None
    if request.conversation_id:
        conversation = session.get(Conversation, request.conversation_id)
        # Verify ownership
        if conversation and conversation.user_id != user_id:
            logger.warning("Conversation ownership mismatch", extra={
                "user_id": user_id,
                "conversation_id": request.conversation_id,
            })
            raise HTTPException(status_code=403, detail="Forbidden")

    if not conversation:
        conversation = Conversation(user_id=user_id)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        logger.info("New conversation created", extra={
            "user_id": user_id,
            "conversation_id": conversation.id,
        })

    # 2. Store user message
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
    )
    session.add(user_msg)
    session.commit()

    # 3. Retrieve conversation history
    history_stmt = (
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at)
    )
    history_msgs = session.exec(history_stmt).all()
    agent_messages = [{"role": m.role, "content": m.content} for m in history_msgs]

    # 4. Create scoped tools and per-request agent
    scoped_tools = _create_scoped_tools(user_id)
    agent = Agent(
        name="Todo Assistant",
        instructions=AGENT_INSTRUCTIONS,
        model=gemini_model,
        tools=scoped_tools,
    )

    # 5. Run agent
    try:
        result = await Runner.run(starting_agent=agent, input=agent_messages)
        final_response = str(result.final_output)
        logger.info("Agent completed", extra={
            "user_id": user_id,
            "conversation_id": conversation.id,
        })
    except Exception as e:
        logger.error("Agent execution failed", extra={
            "user_id": user_id,
            "conversation_id": conversation.id,
            "error": str(e),
        })
        final_response = "I'm sorry, I encountered an error while processing your request. Please try again."

    # 6. Store assistant response
    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=final_response,
    )
    session.add(assistant_msg)
    session.commit()

    return ChatResponse(
        conversation_id=conversation.id,
        response=final_response,
        tool_calls=[],
    )


@router.get("/api/chat/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    current_user: CurrentUserDep,
    session: Session = Depends(get_session),
    conversation_id: Optional[str] = None,
):
    """
    Get conversation history for the authenticated user.
    If conversation_id is not provided, returns the most recent conversation.
    """
    user_id = str(current_user.id)

    conversation = None
    if conversation_id:
        conversation = session.get(Conversation, conversation_id)
        if conversation and conversation.user_id != user_id:
            raise HTTPException(status_code=403, detail="Forbidden")
    else:
        # Get most recent conversation for this user
        stmt = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(desc(Conversation.updated_at))
            .limit(1)
        )
        conversation = session.exec(stmt).first()

    if not conversation:
        # Create a new empty conversation
        conversation = Conversation(user_id=user_id)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        return ChatHistoryResponse(
            conversation_id=conversation.id,
            messages=[],
        )

    # Load messages
    msg_stmt = (
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at)
    )
    messages = session.exec(msg_stmt).all()

    return ChatHistoryResponse(
        conversation_id=conversation.id,
        messages=[
            ChatMessage(
                id=m.id,
                role=m.role,
                content=m.content,
                created_at=m.created_at,
            )
            for m in messages
        ],
    )
