"""
Todo service layer for business logic.

Task Reference: T006 - Create TodoService class with base methods (003-todo-crud)
Task Reference: T019 - Add due_date filtering logic (005-todo-enhancements)
Task Reference: T020 - Add due_date handling to create_todo (005-todo-enhancements)
Task Reference: T021 - Add due_date handling to update_todo (005-todo-enhancements)
Task Reference: T032 - Add priority filtering logic (005-todo-enhancements)
Task Reference: T033 - Add priority handling to create_todo (005-todo-enhancements)
Task Reference: T034 - Add priority handling to update_todo (005-todo-enhancements)
Task Reference: T044 - Add tag_ids handling to create_todo (005-todo-enhancements)
Task Reference: T045 - Add tag_ids handling to update_todo (005-todo-enhancements)
Task Reference: T036 - Extend create_todo for recurrence (006-recurring-reminders)
Task Reference: T038 - Generate initial occurrences (006-recurring-reminders)
Task Reference: T095 - Auto-apply default reminder when creating todo with due_date (006-recurring-reminders)
Task Reference: T103 - Implement "this_only" edit logic (006-recurring-reminders)
Task Reference: T104 - Implement "all_future" edit logic (006-recurring-reminders)
Feature: 003-todo-crud, 005-todo-enhancements, 006-recurring-reminders

Provides business logic for Todo CRUD operations with:
- User ownership validation (filter by user_id)
- Timestamp management
- Due date filtering
- Priority filtering
- Tag assignment and management
- Data persistence through SQLModel
"""

from datetime import date, datetime, timezone
from typing import List, Optional

from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.models.enums import OccurrenceStatus, ReminderStatus
from app.models.occurrence import TodoOccurrence
from app.models.priority import Priority
from app.models.reminder import Reminder
from app.models.tag import Tag
from app.models.todo import Todo
from app.models.todo_tag import TodoTag
from app.models.user_preferences import UserPreferences
from app.schemas.todo import TodoCreate, TodoUpdate
from app.services.recurrence import recurrence_service


class TodoService:
    """
    Service layer for Todo operations.

    All methods require user_id for owner validation.
    Returns None for not found or unauthorized access (returns 404 to client).
    """

    @staticmethod
    def create_todo(session: Session, user_id: str, data: TodoCreate) -> Todo:
        """
        Create a new todo for the specified user.

        Task Reference: T009 [US1] (003-todo-crud)
        Task Reference: T020 [US1] (005-todo-enhancements)
        Task Reference: T033 [US2] (005-todo-enhancements)
        Task Reference: T044 [US3] (005-todo-enhancements)
        Task Reference: T036 [US1] (006-recurring-reminders)
        Task Reference: T038 [US1] (006-recurring-reminders)

        Args:
            session: Database session
            user_id: Owner's user ID from JWT
            data: Todo creation data (includes due_date, priority, tag_ids, recurrence)

        Returns:
            Created Todo instance with tags loaded
        """
        # Handle recurrence configuration - T036, T038 [US1]
        is_recurring = False
        rrule = None
        recurrence_end_date = None
        recurrence_count = None

        if data.recurrence is not None:
            # Recurrence requires a due_date as the start date
            if data.due_date is None:
                raise ValueError("due_date is required for recurring todos")

            is_recurring = True
            rrule = recurrence_service.config_to_rrule(data.recurrence, data.due_date)
            recurrence_end_date = data.recurrence.end_date
            recurrence_count = data.recurrence.end_count

        todo = Todo(
            title=data.title,
            description=data.description,
            user_id=user_id,
            due_date=data.due_date,
            priority=data.priority,
            is_recurring=is_recurring,
            rrule=rrule,
            recurrence_end_date=recurrence_end_date,
            recurrence_count=recurrence_count,
        )
        session.add(todo)
        session.commit()
        session.refresh(todo)

        # Handle tag assignments - T044 [US3]
        if data.tag_ids:
            TodoService._assign_tags(session, user_id, todo.id, data.tag_ids)
            session.refresh(todo)

        # Generate initial occurrences for recurring todos - T038 [US1]
        if is_recurring and rrule and data.due_date:
            TodoService._generate_occurrences(
                session, user_id, todo.id, rrule, data.due_date
            )
            session.refresh(todo)

        # T095 [US7] - Auto-apply default reminder when creating todo with due_date
        if data.due_date is not None:
            TodoService._auto_apply_default_reminder(
                session, user_id, todo.id, data.due_date
            )

        return todo

    @staticmethod
    def get_todos(
        session: Session,
        user_id: str,
        *,
        due_before: Optional[date] = None,
        due_after: Optional[date] = None,
        priorities: Optional[List[Priority]] = None,
        search: Optional[str] = None,
        status: Optional[str] = None,
        tag_ids: Optional[List[str]] = None,
        sort_by: Optional[str] = None,
        sort_direction: Optional[str] = None,
    ) -> List[Todo]:
        """
        Get all todos for the specified user with optional filtering and sorting.

        Task Reference: T012 [US2] (003-todo-crud)
        Task Reference: T019 [US1] (005-todo-enhancements)
        Task Reference: T032 [US2] (005-todo-enhancements)
        Task Reference: T062-T065 [US4] (005-todo-enhancements)
        Task Reference: T082-T084 [US5] (005-todo-enhancements)

        Args:
            session: Database session
            user_id: Owner's user ID from JWT
            due_before: Filter for todos due before this date (inclusive)
            due_after: Filter for todos due after this date (inclusive)
            priorities: Filter for todos with these priority levels
            search: Search text (ILIKE on title/description) - T062
            status: Filter by status (all/active/completed) - T063
            tag_ids: Filter by tag IDs (todos must have at least one) - T064
            sort_by: Sort field (created_at, due_date, priority) - T082
            sort_direction: Sort direction (asc, desc) - T082

        Returns:
            List of todos owned by the user
        """
        statement = (
            select(Todo)
            .where(Todo.user_id == user_id)
            .options(selectinload(Todo.todo_tags).selectinload(TodoTag.tag))
        )

        # Apply search filter - T062 [US4]
        if search is not None and search.strip():
            search_pattern = f"%{search.strip()}%"
            from sqlalchemy import or_
            statement = statement.where(
                or_(
                    Todo.title.ilike(search_pattern),
                    Todo.description.ilike(search_pattern),
                )
            )

        # Apply status filter - T063 [US4]
        if status is not None:
            if status == "active":
                statement = statement.where(Todo.completed == False)  # noqa: E712
            elif status == "completed":
                statement = statement.where(Todo.completed == True)  # noqa: E712
            # "all" means no filter

        # Apply due date filters
        if due_before is not None:
            statement = statement.where(Todo.due_date <= due_before)

        if due_after is not None:
            statement = statement.where(Todo.due_date >= due_after)

        # Apply priority filter - T032 [US2]
        if priorities is not None and len(priorities) > 0:
            statement = statement.where(Todo.priority.in_(priorities))

        # Apply tag filter - T064 [US4]
        # Filter todos that have at least one of the specified tags
        if tag_ids is not None and len(tag_ids) > 0:
            statement = statement.where(
                Todo.id.in_(
                    select(TodoTag.todo_id).where(TodoTag.tag_id.in_(tag_ids))
                )
            )

        # Apply sorting - T082, T083, T084 [US5]
        from sqlalchemy import asc, desc, nulls_last, case

        is_desc = sort_direction == "desc" if sort_direction else True  # Default desc

        if sort_by == "due_date":
            # T083 - Nulls last for due_date
            order_col = Todo.due_date
            if is_desc:
                statement = statement.order_by(nulls_last(desc(order_col)))
            else:
                statement = statement.order_by(nulls_last(asc(order_col)))
        elif sort_by == "priority":
            # T084 - Priority ordering: high(0) > medium(1) > low(2) > null(3)
            priority_order = case(
                (Todo.priority == Priority.high, 0),
                (Todo.priority == Priority.medium, 1),
                (Todo.priority == Priority.low, 2),
                else_=3,  # null is last
            )
            if is_desc:
                # desc means high priority first
                statement = statement.order_by(asc(priority_order))
            else:
                # asc means low priority first
                statement = statement.order_by(desc(priority_order))
        else:
            # Default: sort by created_at
            if is_desc:
                statement = statement.order_by(desc(Todo.created_at))
            else:
                statement = statement.order_by(asc(Todo.created_at))

        return list(session.exec(statement).all())

    @staticmethod
    def get_todo_by_id(
        session: Session, user_id: str, todo_id: str
    ) -> Optional[Todo]:
        """
        Get a specific todo by ID for the specified user.

        Task Reference: T014 [US3]

        Always filters by BOTH id AND user_id to ensure owner-only access.
        Returns None if not found or not owned (client receives 404).

        Args:
            session: Database session
            user_id: Owner's user ID from JWT
            todo_id: Todo ID to retrieve

        Returns:
            Todo if found and owned, None otherwise
        """
        statement = (
            select(Todo)
            .where(Todo.id == todo_id, Todo.user_id == user_id)
            .options(selectinload(Todo.todo_tags).selectinload(TodoTag.tag))
        )
        return session.exec(statement).first()

    @staticmethod
    def update_todo(
        session: Session,
        user_id: str,
        todo_id: str,
        data: TodoUpdate,
        edit_scope: Optional[str] = None,
    ) -> Optional[Todo]:
        """
        Update a todo for the specified user.

        Task Reference: T015 [US3] (003-todo-crud)
        Task Reference: T021 [US1] (005-todo-enhancements)
        Task Reference: T034 [US2] (005-todo-enhancements)
        Task Reference: T045 [US3] (005-todo-enhancements)
        Task Reference: T103, T104 [US8] (006-recurring-reminders)

        Only updates fields that are provided (non-None).
        Automatically updates updated_at timestamp.
        If tag_ids is provided, replaces all existing tag assignments.

        For recurring todos with edit_scope:
        - "this_only": Creates a new non-recurring todo, skips the current occurrence
        - "all_future": Updates the parent todo directly

        Args:
            session: Database session
            user_id: Owner's user ID from JWT
            todo_id: Todo ID to update
            data: Update data (partial, includes due_date, priority, tag_ids)
            edit_scope: For recurring todos: "this_only" or "all_future"

        Returns:
            Updated Todo if found and owned, None otherwise
        """
        todo = TodoService.get_todo_by_id(session, user_id, todo_id)
        if todo is None:
            return None

        # T103, T104 [US8] - Handle edit scope for recurring todos
        if todo.is_recurring and edit_scope == "this_only":
            return TodoService._update_this_only(session, user_id, todo, data)

        # For non-recurring or "all_future", update the todo directly
        # Update only provided fields (excluding tag_ids which is handled separately)
        update_data = data.model_dump(exclude_unset=True, exclude={"tag_ids"})
        for field, value in update_data.items():
            setattr(todo, field, value)

        # Always update the timestamp
        todo.updated_at = datetime.now(timezone.utc)

        session.add(todo)
        session.commit()

        # Handle tag assignments if provided - T045 [US3]
        if data.tag_ids is not None:
            TodoService._replace_tags(session, user_id, todo_id, data.tag_ids)

        session.refresh(todo)
        return todo

    @staticmethod
    def _update_this_only(
        session: Session,
        user_id: str,
        todo: Todo,
        data: TodoUpdate,
    ) -> Todo:
        """
        Handle "this_only" edit for recurring todos.

        Task Reference: T103 [US8] (006-recurring-reminders)

        Creates a new non-recurring todo with the modified values and
        skips the current occurrence of the recurring series.

        Args:
            session: Database session
            user_id: Owner's user ID
            todo: The recurring todo being edited
            data: Update data

        Returns:
            The newly created non-recurring todo
        """
        # Get the current occurrence to determine the date
        current_occ = TodoService.get_current_occurrence(session, user_id, todo.id)

        # Merge existing todo data with updates
        new_title = data.title if data.title is not None else todo.title
        new_description = data.description if data.description is not None else todo.description
        new_priority = data.priority if data.priority is not None else todo.priority

        # Use occurrence date if available, otherwise todo's due_date
        new_due_date = current_occ.occurrence_date if current_occ else todo.due_date
        if data.due_date is not None:
            new_due_date = data.due_date

        # Create a new non-recurring todo with the modified values
        new_todo = Todo(
            title=new_title,
            description=new_description,
            user_id=user_id,
            due_date=new_due_date,
            priority=new_priority,
            is_recurring=False,
            completed=data.completed if data.completed is not None else False,
        )
        session.add(new_todo)
        session.commit()
        session.refresh(new_todo)

        # Copy tags from original todo if no new tags specified
        if data.tag_ids is not None:
            TodoService._assign_tags(session, user_id, new_todo.id, data.tag_ids)
        else:
            # Copy existing tags
            existing_tags = [tt.tag_id for tt in todo.todo_tags] if todo.todo_tags else []
            if existing_tags:
                TodoService._assign_tags(session, user_id, new_todo.id, existing_tags)

        # Skip the current occurrence so it doesn't show up anymore
        if current_occ:
            current_occ.status = OccurrenceStatus.SKIPPED
            current_occ.updated_at = datetime.now(timezone.utc)
            session.add(current_occ)
            session.commit()

            # Ensure future occurrences exist
            TodoService._ensure_future_occurrences(session, user_id, todo.id)

        session.refresh(new_todo)
        return new_todo

    @staticmethod
    def delete_todo(session: Session, user_id: str, todo_id: str) -> bool:
        """
        Delete a todo for the specified user.

        Task Reference: T017 [US4]

        Args:
            session: Database session
            user_id: Owner's user ID from JWT
            todo_id: Todo ID to delete

        Returns:
            True if deleted, False if not found or not owned
        """
        todo = TodoService.get_todo_by_id(session, user_id, todo_id)
        if todo is None:
            return False

        session.delete(todo)
        session.commit()
        return True

    @staticmethod
    def _assign_tags(
        session: Session, user_id: str, todo_id: str, tag_ids: List[str]
    ) -> None:
        """
        Assign tags to a todo (internal helper).

        Task Reference: T044 [US3]

        Only assigns tags that exist and are owned by the user.
        Invalid tag IDs are silently ignored.

        Args:
            session: Database session
            user_id: Owner's user ID from JWT
            todo_id: Todo ID to assign tags to
            tag_ids: List of tag IDs to assign
        """
        for tag_id in tag_ids:
            # Verify tag exists and belongs to user
            tag = session.exec(
                select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id)
            ).first()
            if tag:
                # Create the association
                todo_tag = TodoTag(todo_id=todo_id, tag_id=tag_id)
                session.add(todo_tag)
        session.commit()

    @staticmethod
    def _replace_tags(
        session: Session, user_id: str, todo_id: str, tag_ids: List[str]
    ) -> None:
        """
        Replace all tags for a todo (internal helper).

        Task Reference: T045 [US3]

        Removes existing tag assignments and creates new ones.
        Only assigns tags that exist and are owned by the user.

        Args:
            session: Database session
            user_id: Owner's user ID from JWT
            todo_id: Todo ID to replace tags for
            tag_ids: List of new tag IDs (replaces all existing)
        """
        # Remove existing tag assignments
        existing = session.exec(
            select(TodoTag).where(TodoTag.todo_id == todo_id)
        ).all()
        for todo_tag in existing:
            session.delete(todo_tag)
        session.commit()

        # Assign new tags
        if tag_ids:
            TodoService._assign_tags(session, user_id, todo_id, tag_ids)

    @staticmethod
    def _generate_occurrences(
        session: Session,
        user_id: str,
        todo_id: str,
        rrule: str,
        start_date: date,
        max_occurrences: int = 30,
    ) -> int:
        """
        Generate occurrences for a recurring todo (internal helper).

        Task Reference: T038 [US1] (006-recurring-reminders)

        Generates up to 30 days of occurrences from start_date.
        Skips dates that already have occurrences.

        Args:
            session: Database session
            user_id: Owner's user ID
            todo_id: Recurring todo ID
            rrule: RFC 5545 RRULE string
            start_date: Start date for occurrence generation
            max_occurrences: Maximum occurrences to generate

        Returns:
            Number of occurrences created
        """
        # Get existing occurrence dates for this todo
        existing = session.exec(
            select(TodoOccurrence.occurrence_date).where(
                TodoOccurrence.parent_todo_id == todo_id
            )
        ).all()
        existing_dates = set(existing)

        # Generate new occurrence dates
        occurrence_dates = recurrence_service.generate_occurrences(
            rrule_str=rrule,
            start_date=start_date,
            window_start=start_date,
            max_occurrences=max_occurrences,
        )

        # Create occurrences for dates that don't exist yet
        created = 0
        for occ_date in occurrence_dates:
            if occ_date not in existing_dates:
                occurrence = TodoOccurrence(
                    parent_todo_id=todo_id,
                    user_id=user_id,
                    occurrence_date=occ_date,
                    status=OccurrenceStatus.PENDING,
                )
                session.add(occurrence)
                created += 1

        if created > 0:
            # Update the todo's occurrences_generated count
            todo = session.get(Todo, todo_id)
            if todo:
                todo.occurrences_generated += created
                session.add(todo)
            session.commit()

        return created

    @staticmethod
    def _auto_apply_default_reminder(
        session: Session,
        user_id: str,
        todo_id: str,
        due_date: date,
    ) -> Optional[Reminder]:
        """
        Auto-apply default reminder if user has default_reminder_offset set.

        Task Reference: T095 [US7] (006-recurring-reminders)

        Creates a reminder based on user's default preferences when creating
        a todo with a due date.

        Args:
            session: Database session
            user_id: Owner's user ID
            todo_id: Todo ID to add reminder to
            due_date: Due date of the todo

        Returns:
            Created reminder, or None if no default offset is set
        """
        # Get user preferences
        prefs = session.exec(
            select(UserPreferences).where(UserPreferences.user_id == user_id)
        ).first()

        if prefs is None or prefs.default_reminder_offset is None:
            return None

        # Calculate fire_at from due_date + offset
        # due_date is a date, assume end of day for reminder calculation
        from datetime import time as dt_time, timedelta
        due_datetime = datetime.combine(due_date, dt_time(23, 59, 59), tzinfo=timezone.utc)
        fire_at = due_datetime + timedelta(minutes=prefs.default_reminder_offset)

        # Don't create reminder if fire_at is in the past
        if fire_at <= datetime.now(timezone.utc):
            return None

        # Create the reminder
        reminder = Reminder(
            todo_id=todo_id,
            user_id=user_id,
            fire_at=fire_at,
            offset_minutes=prefs.default_reminder_offset,
            status=ReminderStatus.PENDING,
        )
        session.add(reminder)
        session.commit()
        session.refresh(reminder)

        return reminder

    @staticmethod
    def get_occurrences(
        session: Session,
        user_id: str,
        todo_id: str,
        status: Optional[OccurrenceStatus] = None,
    ) -> List[TodoOccurrence]:
        """
        Get occurrences for a recurring todo.

        Task Reference: T039 [US1] (006-recurring-reminders)

        Args:
            session: Database session
            user_id: Owner's user ID
            todo_id: Todo ID to get occurrences for
            status: Optional filter by occurrence status

        Returns:
            List of occurrences, ordered by date
        """
        # Verify the todo belongs to the user
        todo = TodoService.get_todo_by_id(session, user_id, todo_id)
        if todo is None:
            return []

        query = select(TodoOccurrence).where(
            TodoOccurrence.parent_todo_id == todo_id,
            TodoOccurrence.user_id == user_id,
        )

        if status is not None:
            query = query.where(TodoOccurrence.status == status)

        query = query.order_by(TodoOccurrence.occurrence_date)
        return list(session.exec(query).all())

    @staticmethod
    def update_occurrence_status(
        session: Session,
        user_id: str,
        occurrence_id: str,
        new_status: OccurrenceStatus,
    ) -> Optional[TodoOccurrence]:
        """
        Update the status of an occurrence.

        Task Reference: T039 [US1] (006-recurring-reminders)

        Args:
            session: Database session
            user_id: Owner's user ID
            occurrence_id: Occurrence ID to update
            new_status: New status to set

        Returns:
            Updated occurrence, or None if not found
        """
        occurrence = session.exec(
            select(TodoOccurrence).where(
                TodoOccurrence.id == occurrence_id,
                TodoOccurrence.user_id == user_id,
            )
        ).first()

        if occurrence is None:
            return None

        occurrence.status = new_status
        occurrence.updated_at = datetime.now(timezone.utc)

        if new_status == OccurrenceStatus.COMPLETED:
            occurrence.completed_at = datetime.now(timezone.utc)
        elif new_status == OccurrenceStatus.PENDING:
            occurrence.completed_at = None

        session.add(occurrence)
        session.commit()
        session.refresh(occurrence)
        return occurrence

    @staticmethod
    def complete_occurrence(
        session: Session,
        user_id: str,
        occurrence_id: str,
    ) -> Optional[TodoOccurrence]:
        """
        Complete an occurrence and generate next occurrence if needed.

        Task Reference: T074 [US4], T075 [US4] (006-recurring-reminders)

        When completing an occurrence:
        1. Mark the occurrence as completed
        2. If there's no future occurrence, generate the next one

        Args:
            session: Database session
            user_id: Owner's user ID
            occurrence_id: Occurrence ID to complete

        Returns:
            Completed occurrence, or None if not found
        """
        # Mark as completed
        occurrence = TodoService.update_occurrence_status(
            session, user_id, occurrence_id, OccurrenceStatus.COMPLETED
        )

        if occurrence is None:
            return None

        # T075: Generate next occurrence if needed
        TodoService._ensure_future_occurrences(
            session, user_id, occurrence.parent_todo_id
        )

        return occurrence

    @staticmethod
    def skip_occurrence(
        session: Session,
        user_id: str,
        occurrence_id: str,
    ) -> Optional[TodoOccurrence]:
        """
        Skip an occurrence and generate next occurrence if needed.

        Task Reference: T087, T088 [US6] (006-recurring-reminders)

        Args:
            session: Database session
            user_id: Owner's user ID
            occurrence_id: Occurrence ID to skip

        Returns:
            Skipped occurrence, or None if not found
        """
        occurrence = TodoService.update_occurrence_status(
            session, user_id, occurrence_id, OccurrenceStatus.SKIPPED
        )

        if occurrence is None:
            return None

        # Generate next occurrence if needed
        TodoService._ensure_future_occurrences(
            session, user_id, occurrence.parent_todo_id
        )

        return occurrence

    @staticmethod
    def _ensure_future_occurrences(
        session: Session,
        user_id: str,
        todo_id: str,
        min_future: int = 5,
    ) -> int:
        """
        Ensure there are enough future occurrences for a recurring todo.

        Task Reference: T075 [US4] (006-recurring-reminders)

        If there are fewer than min_future pending occurrences in the future,
        generate more occurrences.

        Args:
            session: Database session
            user_id: Owner's user ID
            todo_id: Todo ID
            min_future: Minimum number of future pending occurrences to maintain

        Returns:
            Number of new occurrences created
        """
        todo = TodoService.get_todo_by_id(session, user_id, todo_id)
        if todo is None or not todo.is_recurring or not todo.rrule:
            return 0

        # Count pending future occurrences
        today = date.today()
        pending_count = session.exec(
            select(TodoOccurrence).where(
                TodoOccurrence.parent_todo_id == todo_id,
                TodoOccurrence.user_id == user_id,
                TodoOccurrence.status == OccurrenceStatus.PENDING,
                TodoOccurrence.occurrence_date >= today,
            )
        ).all()

        if len(pending_count) >= min_future:
            return 0

        # Find the latest occurrence date to start generation from
        latest = session.exec(
            select(TodoOccurrence.occurrence_date)
            .where(TodoOccurrence.parent_todo_id == todo_id)
            .order_by(TodoOccurrence.occurrence_date.desc())
        ).first()

        start_from = latest if latest else todo.due_date
        if start_from is None:
            return 0

        # Generate more occurrences starting from the day after the latest
        from datetime import timedelta
        next_start = start_from + timedelta(days=1)

        return TodoService._generate_occurrences(
            session,
            user_id,
            todo_id,
            todo.rrule,
            next_start,
            max_occurrences=min_future * 2,
        )

    @staticmethod
    def get_current_occurrence(
        session: Session,
        user_id: str,
        todo_id: str,
    ) -> Optional[TodoOccurrence]:
        """
        Get the current or next pending occurrence for a recurring todo.

        Task Reference: T076 [US4] (006-recurring-reminders)

        Returns the earliest pending occurrence that is today or in the future.
        If there's one for today, return that; otherwise return the next future one.

        Args:
            session: Database session
            user_id: Owner's user ID
            todo_id: Todo ID

        Returns:
            The current/next occurrence, or None if no pending occurrences
        """
        today = date.today()

        # First try to find today's occurrence
        today_occurrence = session.exec(
            select(TodoOccurrence).where(
                TodoOccurrence.parent_todo_id == todo_id,
                TodoOccurrence.user_id == user_id,
                TodoOccurrence.occurrence_date == today,
            )
        ).first()

        if today_occurrence:
            return today_occurrence

        # Otherwise, get the next pending occurrence
        next_occurrence = session.exec(
            select(TodoOccurrence)
            .where(
                TodoOccurrence.parent_todo_id == todo_id,
                TodoOccurrence.user_id == user_id,
                TodoOccurrence.status == OccurrenceStatus.PENDING,
                TodoOccurrence.occurrence_date > today,
            )
            .order_by(TodoOccurrence.occurrence_date)
        ).first()

        return next_occurrence

    @staticmethod
    def stop_recurring(
        session: Session,
        user_id: str,
        todo_id: str,
        keep_pending: bool = False,
    ) -> Optional[Todo]:
        """
        Stop a recurring todo series.

        Task Reference: T108 [US9] (006-recurring-reminders)

        This will:
        1. Set is_recurring to False
        2. Clear the rrule
        3. Optionally delete all pending future occurrences

        Args:
            session: Database session
            user_id: Owner's user ID
            todo_id: Todo ID
            keep_pending: If True, keep pending occurrences; if False, delete them

        Returns:
            Updated todo, or None if not found
        """
        todo = TodoService.get_todo_by_id(session, user_id, todo_id)
        if todo is None:
            return None

        if not todo.is_recurring:
            return todo  # Already not recurring

        # Update the todo to stop recurring
        todo.is_recurring = False
        todo.rrule = None
        todo.recurrence_end_date = date.today()
        todo.updated_at = datetime.now(timezone.utc)

        session.add(todo)

        # Delete pending future occurrences if requested
        if not keep_pending:
            today = date.today()
            pending_occurrences = session.exec(
                select(TodoOccurrence).where(
                    TodoOccurrence.parent_todo_id == todo_id,
                    TodoOccurrence.user_id == user_id,
                    TodoOccurrence.status == OccurrenceStatus.PENDING,
                    TodoOccurrence.occurrence_date > today,
                )
            ).all()

            for occ in pending_occurrences:
                session.delete(occ)

        session.commit()
        session.refresh(todo)
        return todo
