"""
Reminders router for managing todo reminders.

Task Reference: T048 - Create reminders router skeleton
Task Reference: T049 - POST /todos/{todo_id}/reminders endpoint
Task Reference: T050 - GET /todos/{todo_id}/reminders endpoint
Task Reference: T051 - DELETE /reminders/{reminder_id} endpoint
Feature: 006-recurring-reminders

Provides endpoints for reminder management:
- POST /todos/{todo_id}/reminders - Create a reminder
- GET /todos/{todo_id}/reminders - List reminders for a todo
- DELETE /reminders/{reminder_id} - Delete a reminder
- POST /reminders/{reminder_id}/snooze - Snooze a reminder
"""

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi import status as http_status
from sqlmodel import Session

from app.database import get_session
from app.dependencies import CurrentUserDep
from app.schemas.error import ErrorResponse, NotFoundErrorResponse
from app.schemas.reminder import (
    ReminderCreate,
    ReminderListResponse,
    ReminderResponse,
    ReminderSnooze,
)
from app.services.reminder import reminder_service
from app.services.todo import TodoService

router = APIRouter(
    tags=["Reminders"],
    responses={
        401: {
            "model": ErrorResponse,
            "description": "Authentication required",
        },
    },
)

# Type alias for session dependency
SessionDep = Annotated[Session, Depends(get_session)]


def _reminder_to_response(reminder) -> ReminderResponse:
    """Convert Reminder model to ReminderResponse."""
    return ReminderResponse(
        id=reminder.id,
        todo_id=reminder.todo_id,
        occurrence_id=reminder.occurrence_id,
        fire_at=reminder.fire_at,
        offset_minutes=reminder.offset_minutes,
        status=reminder.status.value if hasattr(reminder.status, 'value') else reminder.status,
        sent_at=reminder.sent_at,
        snoozed_until=reminder.snoozed_until,
        created_at=reminder.created_at,
    )


@router.post(
    "/todos/{todo_id}/reminders",
    response_model=ReminderResponse,
    status_code=http_status.HTTP_201_CREATED,
    responses={
        201: {"description": "Reminder created successfully"},
        400: {"model": ErrorResponse, "description": "Validation error"},
        404: {"model": NotFoundErrorResponse, "description": "Todo not found"},
    },
)
async def create_reminder(
    todo_id: str,
    data: ReminderCreate,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> ReminderResponse:
    """
    Create a reminder for a todo.

    Task Reference: T049 [US2] (006-recurring-reminders)

    Reminders can be set either:
    - With an absolute fire_at time (UTC)
    - With an offset_minutes relative to the todo's due_date

    Maximum 5 reminders per todo.

    Returns:
        201: Created reminder
        400: Validation error (no due_date, max reminders reached, etc.)
        401: Authentication required
        404: Todo not found or not owned
    """
    # Verify todo exists and belongs to user
    todo = TodoService.get_todo_by_id(session, current_user.id, todo_id)
    if todo is None:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RESOURCE_NOT_FOUND",
                "message": "Todo not found",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )

    try:
        reminder = await reminder_service.create_reminder(
            session=session,
            user_id=current_user.id,
            todo_id=todo_id,
            fire_at=data.fire_at,
            offset_minutes=data.offset_minutes,
            occurrence_id=data.occurrence_id,
        )
        return _reminder_to_response(reminder)
    except ValueError as e:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "VALIDATION_ERROR",
                "message": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )


@router.get(
    "/todos/{todo_id}/reminders",
    response_model=ReminderListResponse,
    responses={
        200: {"description": "List of reminders"},
        404: {"model": NotFoundErrorResponse, "description": "Todo not found"},
    },
)
async def list_reminders(
    todo_id: str,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> ReminderListResponse:
    """
    List reminders for a todo.

    Task Reference: T050 [US2] (006-recurring-reminders)

    Returns only active (pending/snoozed) reminders by default.

    Returns:
        200: List of reminders
        401: Authentication required
        404: Todo not found or not owned
    """
    # Verify todo exists and belongs to user
    todo = TodoService.get_todo_by_id(session, current_user.id, todo_id)
    if todo is None:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RESOURCE_NOT_FOUND",
                "message": "Todo not found",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )

    reminders = await reminder_service.get_todo_reminders(
        session=session,
        user_id=current_user.id,
        todo_id=todo_id,
    )

    return ReminderListResponse(
        items=[_reminder_to_response(r) for r in reminders],
        total=len(reminders),
    )


@router.delete(
    "/reminders/{reminder_id}",
    status_code=http_status.HTTP_204_NO_CONTENT,
    responses={
        204: {"description": "Reminder deleted"},
        404: {"model": NotFoundErrorResponse, "description": "Reminder not found"},
    },
)
async def delete_reminder(
    reminder_id: str,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> None:
    """
    Delete a reminder.

    Task Reference: T051 [US2] (006-recurring-reminders)

    Returns:
        204: Reminder deleted
        401: Authentication required
        404: Reminder not found or not owned
    """
    deleted = await reminder_service.delete_reminder(
        session=session,
        user_id=current_user.id,
        reminder_id=reminder_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RESOURCE_NOT_FOUND",
                "message": "Reminder not found",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )


@router.post(
    "/reminders/{reminder_id}/snooze",
    response_model=ReminderResponse,
    responses={
        200: {"description": "Reminder snoozed"},
        404: {"model": NotFoundErrorResponse, "description": "Reminder not found"},
    },
)
async def snooze_reminder(
    reminder_id: str,
    data: ReminderSnooze,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> ReminderResponse:
    """
    Snooze a reminder for a specified duration.

    Task Reference: T051 [US2] (006-recurring-reminders)

    The reminder will fire again after the snooze duration.

    Returns:
        200: Snoozed reminder
        401: Authentication required
        404: Reminder not found or not owned
    """
    reminder = await reminder_service.snooze_reminder(
        session=session,
        user_id=current_user.id,
        reminder_id=reminder_id,
        snooze_minutes=data.snooze_minutes,
    )

    if reminder is None:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RESOURCE_NOT_FOUND",
                "message": "Reminder not found",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )

    return _reminder_to_response(reminder)
