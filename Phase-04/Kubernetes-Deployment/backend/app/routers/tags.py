"""
Tags CRUD router.

Task Reference: T048 - Create tags router with CRUD endpoints (005-todo-enhancements)
Task Reference: T049 - Add /tags/suggest endpoint for autocomplete (005-todo-enhancements)
Feature: 005-todo-enhancements

Provides RESTful endpoints for Tag CRUD operations:
- GET /tags - List user's tags
- POST /tags - Create new tag
- GET /tags/{id} - Get specific tag
- PATCH /tags/{id} - Update tag
- DELETE /tags/{id} - Delete tag
- GET /tags/suggest - Autocomplete suggestions

All endpoints require JWT authentication.
Owner-only access is enforced (404 for unauthorized access).
"""

from datetime import datetime, timezone
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.database import get_session
from app.dependencies import CurrentUserDep
from app.schemas.error import ErrorResponse, NotFoundErrorResponse
from app.schemas.tag import TagCreate, TagResponse, TagUpdate, TagWithCountResponse
from app.services.tag import TagService

router = APIRouter(
    prefix="/tags",
    tags=["Tags"],
    responses={
        401: {
            "model": ErrorResponse,
            "description": "Authentication required",
        },
    },
)

# Type alias for session dependency
SessionDep = Annotated[Session, Depends(get_session)]


def _tag_to_response(tag, count: int = 0) -> TagWithCountResponse:
    """Convert Tag model to TagWithCountResponse."""
    return TagWithCountResponse(
        id=tag.id,
        name=tag.name,
        color=tag.color,
        user_id=tag.user_id,
        created_at=tag.created_at,
        updated_at=tag.updated_at,
        todo_count=count,
    )


@router.post(
    "",
    response_model=TagResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Tag created successfully"},
        400: {"model": ErrorResponse, "description": "Validation error or duplicate name"},
    },
)
async def create_tag(
    data: TagCreate,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> TagResponse:
    """
    Create a new tag for the authenticated user.

    Task Reference: T048 [US3]

    The tag is automatically associated with the authenticated user.
    Tag names must be unique per user (case-insensitive).

    Returns:
        201: Created tag with ID and timestamps
        400: Validation error or duplicate name
        401: Authentication required
    """
    try:
        tag = TagService.create_tag(session, current_user.id, data)
        return TagResponse(
            id=tag.id,
            name=tag.name,
            color=tag.color,
            user_id=tag.user_id,
            created_at=tag.created_at,
            updated_at=tag.updated_at,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "DUPLICATE_TAG",
                "message": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )


@router.get(
    "",
    response_model=List[TagWithCountResponse],
    responses={
        200: {"description": "List of user's tags with todo counts"},
    },
)
async def list_tags(
    current_user: CurrentUserDep,
    session: SessionDep,
) -> List[TagWithCountResponse]:
    """
    List all tags for the authenticated user.

    Task Reference: T048 [US3]

    Returns tags with their todo counts.
    Returns empty list if user has no tags.

    Returns:
        200: List of tags with counts (may be empty)
        401: Authentication required
    """
    tags_with_counts = TagService.get_tags_with_counts(session, current_user.id)
    return [_tag_to_response(tag, count) for tag, count in tags_with_counts]


@router.get(
    "/suggest",
    response_model=List[TagResponse],
    responses={
        200: {"description": "Suggested tags matching prefix"},
    },
)
async def suggest_tags(
    current_user: CurrentUserDep,
    session: SessionDep,
    prefix: Annotated[
        str,
        Query(description="Search prefix for tag name", min_length=1),
    ],
    limit: Annotated[
        int,
        Query(description="Maximum number of suggestions", ge=1, le=50),
    ] = 10,
) -> List[TagResponse]:
    """
    Get tag suggestions for autocomplete.

    Task Reference: T049 [US3]

    Returns tags matching the prefix (case-insensitive).

    Returns:
        200: List of matching tags
        401: Authentication required
    """
    tags = TagService.suggest_tags(session, current_user.id, prefix, limit)
    return [
        TagResponse(
            id=tag.id,
            name=tag.name,
            color=tag.color,
            user_id=tag.user_id,
            created_at=tag.created_at,
            updated_at=tag.updated_at,
        )
        for tag in tags
    ]


@router.get(
    "/{tag_id}",
    response_model=TagWithCountResponse,
    responses={
        200: {"description": "Tag details"},
        404: {"model": NotFoundErrorResponse, "description": "Tag not found"},
    },
)
async def get_tag(
    tag_id: str,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> TagWithCountResponse:
    """
    Get a specific tag by ID.

    Task Reference: T048 [US3]

    Only returns tags owned by the authenticated user.
    Returns 404 for non-existent or non-owned tags.

    Returns:
        200: Tag details with todo count
        401: Authentication required
        404: Tag not found or not owned
    """
    tag = TagService.get_tag_by_id(session, current_user.id, tag_id)
    if tag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RESOURCE_NOT_FOUND",
                "message": "Tag not found",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )
    count = TagService.get_tag_todo_count(session, tag_id)
    return _tag_to_response(tag, count)


@router.patch(
    "/{tag_id}",
    response_model=TagResponse,
    responses={
        200: {"description": "Tag updated successfully"},
        400: {"model": ErrorResponse, "description": "Validation error or duplicate name"},
        404: {"model": NotFoundErrorResponse, "description": "Tag not found"},
    },
)
async def update_tag(
    tag_id: str,
    data: TagUpdate,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> TagResponse:
    """
    Update a tag (partial update).

    Task Reference: T048 [US3]

    Only updates provided fields. Automatically updates updated_at.
    Only allows updating tags owned by the authenticated user.

    Returns:
        200: Updated tag
        400: Validation error or duplicate name
        401: Authentication required
        404: Tag not found or not owned
    """
    try:
        tag = TagService.update_tag(session, current_user.id, tag_id, data)
        if tag is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "RESOURCE_NOT_FOUND",
                    "message": "Tag not found",
                    "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                },
            )
        return TagResponse(
            id=tag.id,
            name=tag.name,
            color=tag.color,
            user_id=tag.user_id,
            created_at=tag.created_at,
            updated_at=tag.updated_at,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "DUPLICATE_TAG",
                "message": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )


@router.delete(
    "/{tag_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        204: {"description": "Tag deleted successfully"},
        404: {"model": NotFoundErrorResponse, "description": "Tag not found"},
    },
)
async def delete_tag(
    tag_id: str,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> None:
    """
    Delete a tag.

    Task Reference: T048 [US3]

    Cascade delete removes all todo associations automatically.
    Only allows deleting tags owned by the authenticated user.

    Returns:
        204: Tag deleted (no content)
        401: Authentication required
        404: Tag not found or not owned
    """
    deleted = TagService.delete_tag(session, current_user.id, tag_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RESOURCE_NOT_FOUND",
                "message": "Tag not found",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )
