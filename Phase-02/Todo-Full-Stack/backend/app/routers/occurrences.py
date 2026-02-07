"""
Todo occurrences router.

Task Reference: T039 - Add GET /todos/{todo_id}/occurrences endpoint
Task Reference: T074 - Implement POST /occurrences/{id}/complete endpoint
Task Reference: T087 - Implement POST /occurrences/{id}/skip endpoint
Feature: 006-recurring-reminders

Provides endpoints for managing occurrences of recurring todos:
- GET /todos/{todo_id}/occurrences - List occurrences for a recurring todo
- PATCH /occurrences/{id} - Update occurrence status
- POST /occurrences/{id}/complete - Complete an occurrence
- POST /occurrences/{id}/skip - Skip an occurrence
"""

from datetime import datetime, timezone
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import status as http_status
from sqlmodel import Session

from app.database import get_session
from app.dependencies import CurrentUserDep
from app.models.enums import OccurrenceStatus
from app.schemas.error import ErrorResponse, NotFoundErrorResponse
from app.schemas.occurrence import (
    OccurrenceListResponse,
    OccurrenceResponse,
    OccurrenceUpdate,
)
from app.services.todo import TodoService

router = APIRouter(
    tags=["Occurrences"],
    responses={
        401: {
            "model": ErrorResponse,
            "description": "Authentication required",
        },
    },
)

# Type alias for session dependency
SessionDep = Annotated[Session, Depends(get_session)]


def _occurrence_to_response(occurrence) -> OccurrenceResponse:
    """Convert TodoOccurrence model to OccurrenceResponse."""
    return OccurrenceResponse(
        id=occurrence.id,
        parent_todo_id=occurrence.parent_todo_id,
        occurrence_date=occurrence.occurrence_date,
        status=occurrence.status.value if hasattr(occurrence.status, 'value') else occurrence.status,
        completed_at=occurrence.completed_at,
        created_at=occurrence.created_at,
    )


@router.get(
    "/todos/{todo_id}/occurrences",
    response_model=OccurrenceListResponse,
    responses={
        200: {"description": "List of occurrences"},
        404: {"model": NotFoundErrorResponse, "description": "Todo not found"},
    },
)
async def list_occurrences(
    todo_id: str,
    current_user: CurrentUserDep,
    session: SessionDep,
    status: Annotated[
        Optional[OccurrenceStatus],
        Query(description="Filter by occurrence status"),
    ] = None,
) -> OccurrenceListResponse:
    """
    List occurrences for a recurring todo.

    Task Reference: T039 [US1] (006-recurring-reminders)

    Returns occurrences for the specified todo, ordered by date.
    Only returns occurrences for todos owned by the authenticated user.

    Query Parameters:
        status: Filter by occurrence status (pending, completed, skipped)

    Returns:
        200: List of occurrences with total count
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

    occurrences = TodoService.get_occurrences(
        session,
        current_user.id,
        todo_id,
        status=status,
    )

    return OccurrenceListResponse(
        items=[_occurrence_to_response(occ) for occ in occurrences],
        total=len(occurrences),
    )


@router.patch(
    "/occurrences/{occurrence_id}",
    response_model=OccurrenceResponse,
    responses={
        200: {"description": "Occurrence updated"},
        404: {"model": NotFoundErrorResponse, "description": "Occurrence not found"},
    },
)
async def update_occurrence(
    occurrence_id: str,
    data: OccurrenceUpdate,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> OccurrenceResponse:
    """
    Update an occurrence (e.g., mark as completed or skipped).

    Task Reference: T039 [US1] (006-recurring-reminders)

    Only allows updating occurrences owned by the authenticated user.

    Returns:
        200: Updated occurrence
        401: Authentication required
        404: Occurrence not found or not owned
    """
    if data.status is None:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "VALIDATION_ERROR",
                "message": "At least one field must be provided for update",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )

    # Map string status to enum
    new_status = OccurrenceStatus(data.status)

    occurrence = TodoService.update_occurrence_status(
        session,
        current_user.id,
        occurrence_id,
        new_status,
    )

    if occurrence is None:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RESOURCE_NOT_FOUND",
                "message": "Occurrence not found",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )

    return _occurrence_to_response(occurrence)


@router.post(
    "/occurrences/{occurrence_id}/complete",
    response_model=OccurrenceResponse,
    responses={
        200: {"description": "Occurrence completed"},
        404: {"model": NotFoundErrorResponse, "description": "Occurrence not found"},
    },
)
async def complete_occurrence(
    occurrence_id: str,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> OccurrenceResponse:
    """
    Complete an occurrence and generate next occurrence if needed.

    Task Reference: T074 [US4], T075 [US4] (006-recurring-reminders)

    This endpoint:
    1. Marks the occurrence as completed
    2. Generates the next occurrence if there are fewer than 5 pending future occurrences

    Returns:
        200: Completed occurrence
        401: Authentication required
        404: Occurrence not found or not owned
    """
    occurrence = TodoService.complete_occurrence(
        session,
        current_user.id,
        occurrence_id,
    )

    if occurrence is None:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RESOURCE_NOT_FOUND",
                "message": "Occurrence not found",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )

    return _occurrence_to_response(occurrence)


@router.post(
    "/occurrences/{occurrence_id}/skip",
    response_model=OccurrenceResponse,
    responses={
        200: {"description": "Occurrence skipped"},
        404: {"model": NotFoundErrorResponse, "description": "Occurrence not found"},
    },
)
async def skip_occurrence(
    occurrence_id: str,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> OccurrenceResponse:
    """
    Skip an occurrence and generate next occurrence if needed.

    Task Reference: T087 [US6], T088 [US6] (006-recurring-reminders)

    This endpoint:
    1. Marks the occurrence as skipped
    2. Generates the next occurrence if there are fewer than 5 pending future occurrences

    Returns:
        200: Skipped occurrence
        401: Authentication required
        404: Occurrence not found or not owned
    """
    occurrence = TodoService.skip_occurrence(
        session,
        current_user.id,
        occurrence_id,
    )

    if occurrence is None:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RESOURCE_NOT_FOUND",
                "message": "Occurrence not found",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )

    return _occurrence_to_response(occurrence)


@router.get(
    "/todos/{todo_id}/current-occurrence",
    response_model=OccurrenceResponse,
    responses={
        200: {"description": "Current occurrence"},
        404: {"model": NotFoundErrorResponse, "description": "Todo or occurrence not found"},
    },
)
async def get_current_occurrence(
    todo_id: str,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> OccurrenceResponse:
    """
    Get the current or next pending occurrence for a recurring todo.

    Task Reference: T076 [US4] (006-recurring-reminders)

    Returns the occurrence for today if it exists, otherwise the next pending occurrence.
    Useful for showing what needs to be done next for a recurring todo.

    Returns:
        200: Current/next occurrence
        401: Authentication required
        404: Todo not found or no pending occurrences
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

    if not todo.is_recurring:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "VALIDATION_ERROR",
                "message": "Todo is not recurring",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )

    occurrence = TodoService.get_current_occurrence(
        session,
        current_user.id,
        todo_id,
    )

    if occurrence is None:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RESOURCE_NOT_FOUND",
                "message": "No pending occurrence found",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )

    return _occurrence_to_response(occurrence)
