"""
Todo CRUD router.

Task Reference: T007 - Create todos router file skeleton (003-todo-crud)
Task Reference: T022 - Add due_before and due_after query params to GET /todos (005-todo-enhancements)
Task Reference: T023 - Update POST /todos to accept due_date (005-todo-enhancements)
Task Reference: T024 - Update PATCH /todos/{id} to accept due_date (005-todo-enhancements)
Task Reference: T035 - Add priority query param (array) to GET /todos (005-todo-enhancements)
Task Reference: T036 - Update POST /todos to accept priority (005-todo-enhancements)
Task Reference: T037 - Update PATCH /todos/{id} to accept priority (005-todo-enhancements)
Task Reference: T085 - Add sort query param to GET /todos (005-todo-enhancements)
Task Reference: T102 - Add edit_scope query param to PATCH /todos/{id} (006-recurring-reminders)
Feature: 003-todo-crud, 005-todo-enhancements, 006-recurring-reminders

Provides RESTful endpoints for Todo CRUD operations:
- GET /todos - List user's todos with optional filtering (due_date, priority) and sorting
- POST /todos - Create new todo (with due_date, priority support)
- GET /todos/{id} - Get specific todo
- PATCH /todos/{id} - Update todo (with due_date, priority support)
- DELETE /todos/{id} - Delete todo

All endpoints require JWT authentication.
Owner-only access is enforced (404 for unauthorized access).
"""

from datetime import date, datetime, timezone
from enum import Enum
from typing import Annotated, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.database import get_session
from app.dependencies import CurrentUserDep
from app.models.priority import Priority
from app.schemas.error import ErrorResponse, NotFoundErrorResponse
from app.schemas.todo import TagInTodoResponse, TodoCreate, TodoResponse, TodoUpdate
from app.services.todo import TodoService

router = APIRouter(
    prefix="/todos",
    tags=["Todos"],
    responses={
        401: {
            "model": ErrorResponse,
            "description": "Authentication required",
        },
    },
)

# Type alias for session dependency
SessionDep = Annotated[Session, Depends(get_session)]


def _todo_to_response(
    todo,
    next_occurrence_date=None,
    current_occurrence_id=None,
    current_occurrence_status=None,
) -> TodoResponse:
    """
    Convert Todo model to TodoResponse with tags and recurrence fields.

    Task Reference: T041 [US1] (006-recurring-reminders)
    Task Reference: T076, T078 [US4] - Add current occurrence info
    """
    # Extract tags from todo_tags relationship
    tags = []
    if hasattr(todo, "todo_tags") and todo.todo_tags:
        for todo_tag in todo.todo_tags:
            if todo_tag.tag:
                tags.append(
                    TagInTodoResponse(
                        id=todo_tag.tag.id,
                        name=todo_tag.tag.name,
                        color=todo_tag.tag.color,
                    )
                )

    return TodoResponse(
        id=todo.id,
        title=todo.title,
        description=todo.description,
        completed=todo.completed,
        user_id=todo.user_id,
        created_at=todo.created_at,
        updated_at=todo.updated_at,
        due_date=todo.due_date,
        priority=todo.priority,
        tags=tags,
        # Recurrence fields - T041 [US1]
        is_recurring=todo.is_recurring,
        rrule=todo.rrule,
        recurrence_end_date=todo.recurrence_end_date,
        next_occurrence_date=next_occurrence_date,
        # T076, T078 [US4] - Current occurrence info
        current_occurrence_id=current_occurrence_id,
        current_occurrence_status=current_occurrence_status,
    )


def _get_todo_with_occurrence_info(session: Session, user_id: str, todo) -> TodoResponse:
    """
    Convert a todo to response with current occurrence info populated.

    Task Reference: T076, T078 [US4] (006-recurring-reminders)
    """
    next_occurrence_date = None
    current_occurrence_id = None
    current_occurrence_status = None

    if todo.is_recurring:
        occurrence = TodoService.get_current_occurrence(session, user_id, todo.id)
        if occurrence:
            next_occurrence_date = occurrence.occurrence_date
            current_occurrence_id = occurrence.id
            current_occurrence_status = (
                occurrence.status.value
                if hasattr(occurrence.status, "value")
                else occurrence.status
            )

    return _todo_to_response(
        todo,
        next_occurrence_date=next_occurrence_date,
        current_occurrence_id=current_occurrence_id,
        current_occurrence_status=current_occurrence_status,
    )


@router.post(
    "",
    response_model=TodoResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Todo created successfully"},
        400: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def create_todo(
    data: TodoCreate,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> TodoResponse:
    """
    Create a new todo for the authenticated user.

    Task Reference: T010 [US1] (003-todo-crud)
    Task Reference: T023 [US1] (005-todo-enhancements)
    Task Reference: T036 [US2] (005-todo-enhancements)

    The todo is automatically associated with the authenticated user.
    Supports optional due_date and priority fields.

    Returns:
        201: Created todo with ID and timestamps
        400: Validation error (missing/invalid title)
        401: Authentication required
    """
    todo = TodoService.create_todo(session, current_user.id, data)
    return _get_todo_with_occurrence_info(session, current_user.id, todo)


@router.get(
    "",
    response_model=List[TodoResponse],
    responses={
        200: {"description": "List of user's todos"},
    },
)
async def list_todos(
    current_user: CurrentUserDep,
    session: SessionDep,
    due_before: Annotated[
        Optional[date],
        Query(description="Filter todos due on or before this date (YYYY-MM-DD)"),
    ] = None,
    due_after: Annotated[
        Optional[date],
        Query(description="Filter todos due on or after this date (YYYY-MM-DD)"),
    ] = None,
    priority: Annotated[
        Optional[List[Priority]],
        Query(description="Filter by priority levels (can specify multiple)"),
    ] = None,
    search: Annotated[
        Optional[str],
        Query(description="Search text (matches title or description, case-insensitive)"),
    ] = None,
    status: Annotated[
        Optional[str],
        Query(description="Filter by status: all, active, or completed"),
    ] = None,
    tag: Annotated[
        Optional[List[str]],
        Query(description="Filter by tag IDs (can specify multiple)"),
    ] = None,
    sort: Annotated[
        Optional[str],
        Query(
            description="Sort field and direction (format: field:direction, e.g., due_date:asc). "
            "Fields: created_at, due_date, priority. Directions: asc, desc. Default: created_at:desc"
        ),
    ] = None,
) -> List[TodoResponse]:
    """
    List all todos for the authenticated user.

    Task Reference: T013 [US2] (003-todo-crud)
    Task Reference: T022 [US1] (005-todo-enhancements)
    Task Reference: T035 [US2] (005-todo-enhancements)
    Task Reference: T066-T068 [US4] (005-todo-enhancements)
    Task Reference: T085 [US5] (005-todo-enhancements)

    Returns only todos owned by the authenticated user.
    Returns empty list if user has no todos.

    Query Parameters:
        due_before: Filter for todos due on or before this date (inclusive)
        due_after: Filter for todos due on or after this date (inclusive)
        priority: Filter by priority levels (can specify multiple, e.g., ?priority=high&priority=medium)
        search: Search text (matches title or description, case-insensitive) - T066
        status: Filter by status (all/active/completed) - T067
        tag: Filter by tag IDs (can specify multiple, e.g., ?tag=abc&tag=def) - T068
        sort: Sort field and direction (format: field:direction) - T085
              Fields: created_at (default), due_date, priority
              Directions: asc, desc (default)

    Returns:
        200: List of todos (may be empty)
        401: Authentication required
    """
    # Parse sort parameter - T085 [US5]
    sort_by = None
    sort_direction = None
    if sort:
        parts = sort.split(":")
        if len(parts) >= 1:
            sort_by = parts[0]
        if len(parts) >= 2:
            sort_direction = parts[1]

    todos = TodoService.get_todos(
        session,
        current_user.id,
        due_before=due_before,
        due_after=due_after,
        priorities=priority,
        search=search,
        status=status,
        tag_ids=tag,
        sort_by=sort_by,
        sort_direction=sort_direction,
    )
    # T076, T078 [US4] - Include current occurrence info for each todo
    return [_get_todo_with_occurrence_info(session, current_user.id, todo) for todo in todos]


@router.get(
    "/{todo_id}",
    response_model=TodoResponse,
    responses={
        200: {"description": "Todo details"},
        404: {"model": NotFoundErrorResponse, "description": "Todo not found"},
    },
)
async def get_todo(
    todo_id: str,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> TodoResponse:
    """
    Get a specific todo by ID.

    Task Reference: T019 [US5]

    Only returns todos owned by the authenticated user.
    Returns 404 for non-existent or non-owned todos (security: prevents info disclosure).

    Returns:
        200: Todo details
        401: Authentication required
        404: Todo not found or not owned
    """
    todo = TodoService.get_todo_by_id(session, current_user.id, todo_id)
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RESOURCE_NOT_FOUND",
                "message": "Todo not found",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )
    return _get_todo_with_occurrence_info(session, current_user.id, todo)


@router.patch(
    "/{todo_id}",
    response_model=TodoResponse,
    responses={
        200: {"description": "Todo updated successfully"},
        400: {"model": ErrorResponse, "description": "Validation error"},
        404: {"model": NotFoundErrorResponse, "description": "Todo not found"},
    },
)
async def update_todo(
    todo_id: str,
    data: TodoUpdate,
    current_user: CurrentUserDep,
    session: SessionDep,
    edit_scope: Annotated[
        Optional[Literal["this_only", "all_future"]],
        Query(description="For recurring todos: 'this_only' or 'all_future'"),
    ] = None,
) -> TodoResponse:
    """
    Update a todo (partial update).

    Task Reference: T016 [US3] (003-todo-crud)
    Task Reference: T024 [US1] (005-todo-enhancements)
    Task Reference: T037 [US2] (005-todo-enhancements)
    Task Reference: T102 [US8] (006-recurring-reminders) - Add edit_scope param

    Only updates provided fields. Automatically updates updated_at.
    Only allows updating todos owned by the authenticated user.
    Returns 404 for non-existent or non-owned todos (security: prevents info disclosure).

    For recurring todos, edit_scope controls behavior:
    - "this_only": Creates a new non-recurring todo with the changes, skips original occurrence
    - "all_future": Updates the parent todo (affects all future occurrences)
    - None: For non-recurring todos, or defaults to "all_future" for recurring

    Returns:
        200: Updated todo
        400: Validation error
        401: Authentication required
        404: Todo not found or not owned
    """
    todo = TodoService.update_todo(
        session, current_user.id, todo_id, data, edit_scope=edit_scope
    )
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RESOURCE_NOT_FOUND",
                "message": "Todo not found",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )
    return _get_todo_with_occurrence_info(session, current_user.id, todo)


@router.delete(
    "/{todo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        204: {"description": "Todo deleted successfully"},
        404: {"model": NotFoundErrorResponse, "description": "Todo not found"},
    },
)
async def delete_todo(
    todo_id: str,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> None:
    """
    Delete a todo.

    Task Reference: T018 [US4]

    Only allows deleting todos owned by the authenticated user.
    Returns 404 for non-existent or non-owned todos (security: prevents info disclosure).

    Returns:
        204: Todo deleted (no content)
        401: Authentication required
        404: Todo not found or not owned
    """
    deleted = TodoService.delete_todo(session, current_user.id, todo_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RESOURCE_NOT_FOUND",
                "message": "Todo not found",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )


@router.post(
    "/{todo_id}/stop-recurring",
    response_model=TodoResponse,
    responses={
        200: {"description": "Recurring stopped successfully"},
        400: {"model": ErrorResponse, "description": "Todo is not recurring"},
        404: {"model": NotFoundErrorResponse, "description": "Todo not found"},
    },
)
async def stop_recurring(
    todo_id: str,
    current_user: CurrentUserDep,
    session: SessionDep,
    keep_pending: Annotated[
        bool,
        Query(description="If true, keep pending future occurrences"),
    ] = False,
) -> TodoResponse:
    """
    Stop a recurring todo series.

    Task Reference: T108 [US9] (006-recurring-reminders)

    This endpoint stops a recurring todo from generating new occurrences.
    By default, it also deletes all pending future occurrences.

    Query Parameters:
        keep_pending: If true, keep pending future occurrences (default: false)

    Returns:
        200: Updated todo (no longer recurring)
        400: Todo is not recurring
        401: Authentication required
        404: Todo not found or not owned
    """
    # First check if todo exists and is recurring
    todo = TodoService.get_todo_by_id(session, current_user.id, todo_id)
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RESOURCE_NOT_FOUND",
                "message": "Todo not found",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )

    if not todo.is_recurring:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "VALIDATION_ERROR",
                "message": "Todo is not recurring",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
        )

    updated_todo = TodoService.stop_recurring(
        session, current_user.id, todo_id, keep_pending=keep_pending
    )
    return _get_todo_with_occurrence_info(session, current_user.id, updated_todo)
