"""
Notifications router for managing in-app notifications.

Task Reference: T061 - Create notifications router skeleton
Task Reference: T062 - GET /notifications endpoint
Task Reference: T063 - GET /notifications/unread-count endpoint
Task Reference: T064 - PATCH /notifications/{id} endpoint
Task Reference: T065 - POST /notifications/mark-all-read endpoint
Task Reference: T066 - DELETE /notifications/{id} endpoint
Feature: 006-recurring-reminders

Provides endpoints for notification management:
- GET /notifications - List notifications with pagination
- GET /notifications/unread-count - Get unread count
- PATCH /notifications/{id} - Mark as read
- POST /notifications/mark-all-read - Mark all as read
- DELETE /notifications/{id} - Delete notification
"""

from datetime import datetime, timezone
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import status as http_status
from sqlmodel import Session

from app.database import get_session
from app.dependencies import CurrentUserDep
from app.schemas.error import ErrorResponse, NotFoundErrorResponse
from app.schemas.notification import (
    NotificationListResponse,
    NotificationMarkRead,
    NotificationResponse,
)
from app.services.notification import notification_service

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
    responses={
        401: {
            "model": ErrorResponse,
            "description": "Authentication required",
        },
    },
)

# Type alias for session dependency
SessionDep = Annotated[Session, Depends(get_session)]


def _notification_to_response(notification) -> NotificationResponse:
    """Convert Notification model to NotificationResponse."""
    return NotificationResponse(
        id=notification.id,
        type=notification.type.value if hasattr(notification.type, 'value') else notification.type,
        title=notification.title,
        body=notification.body,
        todo_id=notification.todo_id,
        reminder_id=notification.reminder_id,
        read=notification.read,
        created_at=notification.created_at,
    )


@router.get(
    "",
    response_model=NotificationListResponse,
    responses={
        200: {"description": "List of notifications"},
    },
)
async def list_notifications(
    current_user: CurrentUserDep,
    session: SessionDep,
    unread_only: Annotated[
        bool,
        Query(description="Only return unread notifications"),
    ] = False,
    limit: Annotated[
        int,
        Query(ge=1, le=100, description="Maximum notifications to return"),
    ] = 50,
    offset: Annotated[
        int,
        Query(ge=0, description="Offset for pagination"),
    ] = 0,
) -> NotificationListResponse:
    """
    List notifications for the current user.

    Task Reference: T062 [US3] (006-recurring-reminders)

    Returns notifications ordered by created_at descending (newest first).

    Query Parameters:
        unread_only: If true, only return unread notifications
        limit: Maximum number to return (default 50, max 100)
        offset: Offset for pagination

    Returns:
        200: List of notifications with total and unread counts
        401: Authentication required
    """
    notifications, total, unread_count = await notification_service.get_user_notifications(
        session=session,
        user_id=current_user.id,
        unread_only=unread_only,
        limit=limit,
        offset=offset,
    )

    return NotificationListResponse(
        items=[_notification_to_response(n) for n in notifications],
        total=total,
        unread_count=unread_count,
    )


@router.get(
    "/unread-count",
    responses={
        200: {"description": "Unread notification count"},
    },
)
async def get_unread_count(
    current_user: CurrentUserDep,
    session: SessionDep,
) -> dict:
    """
    Get the count of unread notifications.

    Task Reference: T063 [US3] (006-recurring-reminders)

    Returns:
        200: Object with unread_count field
        401: Authentication required
    """
    _, _, unread_count = await notification_service.get_user_notifications(
        session=session,
        user_id=current_user.id,
        unread_only=True,
        limit=0,
        offset=0,
    )

    return {"unread_count": unread_count}


@router.patch(
    "/{notification_id}",
    response_model=NotificationResponse,
    responses={
        200: {"description": "Notification updated"},
        404: {"model": NotFoundErrorResponse, "description": "Notification not found"},
    },
)
async def mark_notification_read(
    notification_id: str,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> NotificationResponse:
    """
    Mark a notification as read.

    Task Reference: T064 [US3] (006-recurring-reminders)

    Returns:
        200: Updated notification
        401: Authentication required
        404: Notification not found or not owned
    """
    count = await notification_service.mark_as_read(
        session=session,
        user_id=current_user.id,
        notification_ids=[notification_id],
    )

    if count == 0:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RESOURCE_NOT_FOUND",
                "message": "Notification not found",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )

    # Fetch the updated notification
    notifications, _, _ = await notification_service.get_user_notifications(
        session=session,
        user_id=current_user.id,
        limit=100,
        offset=0,
    )

    for n in notifications:
        if n.id == notification_id:
            return _notification_to_response(n)

    # Should not happen, but handle gracefully
    raise HTTPException(
        status_code=http_status.HTTP_404_NOT_FOUND,
        detail={
            "error": "RESOURCE_NOT_FOUND",
            "message": "Notification not found",
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        },
    )


@router.post(
    "/mark-all-read",
    responses={
        200: {"description": "All notifications marked as read"},
    },
)
async def mark_all_read(
    current_user: CurrentUserDep,
    session: SessionDep,
) -> dict:
    """
    Mark all notifications as read.

    Task Reference: T065 [US3] (006-recurring-reminders)

    Returns:
        200: Object with count of notifications marked as read
        401: Authentication required
    """
    count = await notification_service.mark_all_as_read(
        session=session,
        user_id=current_user.id,
    )

    return {"marked_count": count}


@router.post(
    "/mark-read",
    responses={
        200: {"description": "Notifications marked as read"},
    },
)
async def mark_notifications_read(
    data: NotificationMarkRead,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> dict:
    """
    Mark specific notifications as read.

    Task Reference: T064 [US3] (006-recurring-reminders)

    Returns:
        200: Object with count of notifications marked as read
        401: Authentication required
    """
    count = await notification_service.mark_as_read(
        session=session,
        user_id=current_user.id,
        notification_ids=data.notification_ids,
    )

    return {"marked_count": count}


@router.delete(
    "/{notification_id}",
    status_code=http_status.HTTP_204_NO_CONTENT,
    responses={
        204: {"description": "Notification deleted"},
        404: {"model": NotFoundErrorResponse, "description": "Notification not found"},
    },
)
async def delete_notification(
    notification_id: str,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> None:
    """
    Delete a notification.

    Task Reference: T066 [US3] (006-recurring-reminders)

    Returns:
        204: Notification deleted
        401: Authentication required
        404: Notification not found or not owned
    """
    deleted = await notification_service.delete_notification(
        session=session,
        user_id=current_user.id,
        notification_id=notification_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RESOURCE_NOT_FOUND",
                "message": "Notification not found",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )
