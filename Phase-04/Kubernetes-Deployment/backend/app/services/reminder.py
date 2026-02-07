"""
Reminder service for scheduling and firing reminders.

Task Reference: T027 - Create ReminderService for scheduling/firing reminders
Feature: 006-recurring-reminders

Provides functionality for:
- Creating reminders for todos
- Calculating fire times from due dates
- Processing pending reminders
- Snoozing reminders
"""

from datetime import datetime, timedelta, timezone
from typing import List, Optional

from sqlmodel import Session, select

from app.models.enums import NotificationType, ReminderStatus
from app.models.reminder import Reminder
from app.models.todo import Todo
from app.services.notification import notification_service
from app.services.push import push_service


# Maximum reminders per todo
MAX_REMINDERS_PER_TODO = 5


class ReminderService:
    """
    Service for managing reminders.

    Task Reference: T027
    """

    @staticmethod
    async def create_reminder(
        session: Session,
        user_id: str,
        todo_id: str,
        fire_at: Optional[datetime] = None,
        offset_minutes: Optional[int] = None,
        occurrence_id: Optional[str] = None,
    ) -> Reminder:
        """
        Create a reminder for a todo.

        Args:
            session: Database session
            user_id: User creating the reminder
            todo_id: Todo to attach reminder to
            fire_at: Absolute time to fire (mutually exclusive with offset_minutes)
            offset_minutes: Minutes before due_date (negative value)
            occurrence_id: Optional specific occurrence ID

        Returns:
            Created reminder

        Raises:
            ValueError: If validation fails

        Task Reference: T049
        """
        # Validate max reminders
        existing_count = len(session.exec(
            select(Reminder).where(
                Reminder.todo_id == todo_id,
                Reminder.status.in_([ReminderStatus.PENDING, ReminderStatus.SNOOZED]),
            )
        ).all())

        if existing_count >= MAX_REMINDERS_PER_TODO:
            raise ValueError(f"Maximum {MAX_REMINDERS_PER_TODO} reminders per todo")

        # Get the todo to calculate fire_at if using offset
        todo = session.get(Todo, todo_id)
        if not todo:
            raise ValueError("Todo not found")

        if todo.user_id != user_id:
            raise ValueError("Todo does not belong to user")

        # Calculate fire_at if using offset
        calculated_fire_at = fire_at
        if offset_minutes is not None:
            if not todo.due_date:
                raise ValueError("Cannot use offset_minutes without a due_date on the todo")

            # Convert due_date to datetime at midnight
            due_datetime = datetime.combine(
                todo.due_date,
                datetime.min.time(),
                tzinfo=timezone.utc,
            )
            calculated_fire_at = due_datetime + timedelta(minutes=offset_minutes)

        if not calculated_fire_at:
            raise ValueError("Either fire_at or offset_minutes must be provided")

        # Create the reminder
        reminder = Reminder(
            todo_id=todo_id,
            occurrence_id=occurrence_id,
            user_id=user_id,
            fire_at=calculated_fire_at,
            offset_minutes=offset_minutes,
            status=ReminderStatus.PENDING,
        )
        session.add(reminder)
        session.commit()
        session.refresh(reminder)
        return reminder

    @staticmethod
    async def get_todo_reminders(
        session: Session,
        user_id: str,
        todo_id: str,
        include_fired: bool = False,
    ) -> List[Reminder]:
        """
        Get reminders for a todo.

        Args:
            session: Database session
            user_id: User who owns the todo
            todo_id: Todo to get reminders for
            include_fired: If True, include sent/cancelled reminders

        Returns:
            List of reminders

        Task Reference: T050
        """
        query = select(Reminder).where(
            Reminder.todo_id == todo_id,
            Reminder.user_id == user_id,
        )

        if not include_fired:
            query = query.where(
                Reminder.status.in_([ReminderStatus.PENDING, ReminderStatus.SNOOZED])
            )

        query = query.order_by(Reminder.fire_at)
        return list(session.exec(query).all())

    @staticmethod
    async def delete_reminder(
        session: Session,
        user_id: str,
        reminder_id: str,
    ) -> bool:
        """
        Delete a reminder.

        Args:
            session: Database session
            user_id: User who owns the reminder
            reminder_id: Reminder to delete

        Returns:
            True if deleted, False if not found

        Task Reference: T051
        """
        reminder = session.exec(
            select(Reminder).where(
                Reminder.id == reminder_id,
                Reminder.user_id == user_id,
            )
        ).first()

        if reminder:
            session.delete(reminder)
            session.commit()
            return True
        return False

    @staticmethod
    async def snooze_reminder(
        session: Session,
        user_id: str,
        reminder_id: str,
        snooze_minutes: int,
    ) -> Optional[Reminder]:
        """
        Snooze a reminder for a specified duration.

        Args:
            session: Database session
            user_id: User who owns the reminder
            reminder_id: Reminder to snooze
            snooze_minutes: Minutes to snooze for

        Returns:
            Updated reminder, or None if not found
        """
        reminder = session.exec(
            select(Reminder).where(
                Reminder.id == reminder_id,
                Reminder.user_id == user_id,
            )
        ).first()

        if not reminder:
            return None

        # Update snooze fields
        reminder.status = ReminderStatus.SNOOZED
        reminder.snoozed_until = datetime.now(timezone.utc) + timedelta(minutes=snooze_minutes)
        # Update fire_at to the snooze end time
        reminder.fire_at = reminder.snoozed_until

        session.add(reminder)
        session.commit()
        session.refresh(reminder)
        return reminder

    @staticmethod
    async def get_pending_reminders(
        session: Session,
        before: Optional[datetime] = None,
    ) -> List[Reminder]:
        """
        Get reminders that are due to fire.

        Args:
            session: Database session
            before: Get reminders with fire_at before this time (default: now)

        Returns:
            List of pending reminders

        Task Reference: T053
        """
        if before is None:
            before = datetime.now(timezone.utc)

        # Get pending reminders and snoozed reminders whose snooze has expired
        query = select(Reminder).where(
            Reminder.fire_at <= before,
            Reminder.status.in_([ReminderStatus.PENDING, ReminderStatus.SNOOZED]),
        ).order_by(Reminder.fire_at)

        return list(session.exec(query).all())

    @staticmethod
    async def fire_reminder(
        session: Session,
        reminder: Reminder,
    ) -> bool:
        """
        Fire a reminder - create notification and optionally send push.

        Args:
            session: Database session
            reminder: Reminder to fire

        Returns:
            True if fired successfully

        Task Reference: T053, T054
        """
        # Get the associated todo
        todo = session.get(Todo, reminder.todo_id)
        if not todo:
            # Todo was deleted, cancel the reminder
            reminder.status = ReminderStatus.CANCELLED
            session.add(reminder)
            session.commit()
            return False

        # Create in-app notification
        title = f"Reminder: {todo.title}"
        body = "Due soon" if todo.due_date else "Task reminder"
        if todo.due_date:
            body = f"Due: {todo.due_date.strftime('%b %d, %Y')}"

        await notification_service.create_notification(
            session=session,
            user_id=reminder.user_id,
            notification_type=NotificationType.REMINDER,
            title=title,
            body=body,
            todo_id=todo.id,
            reminder_id=reminder.id,
        )

        # Send push notification
        await push_service.send_to_user(
            session=session,
            user_id=reminder.user_id,
            title=title,
            body=body,
            url=f"/todos/{todo.id}",
            tag=f"reminder-{reminder.id}",
        )

        # Mark reminder as sent
        reminder.status = ReminderStatus.SENT
        reminder.sent_at = datetime.now(timezone.utc)
        session.add(reminder)
        session.commit()

        return True

    @staticmethod
    async def process_pending_reminders(session: Session) -> int:
        """
        Process all pending reminders that are due.

        Args:
            session: Database session

        Returns:
            Number of reminders processed

        Task Reference: T053
        """
        reminders = await ReminderService.get_pending_reminders(session)
        processed = 0

        for reminder in reminders:
            if await ReminderService.fire_reminder(session, reminder):
                processed += 1

        return processed

    @staticmethod
    async def cancel_todo_reminders(
        session: Session,
        todo_id: str,
    ) -> int:
        """
        Cancel all pending reminders for a todo.

        Args:
            session: Database session
            todo_id: Todo whose reminders to cancel

        Returns:
            Number of reminders cancelled
        """
        reminders = session.exec(
            select(Reminder).where(
                Reminder.todo_id == todo_id,
                Reminder.status.in_([ReminderStatus.PENDING, ReminderStatus.SNOOZED]),
            )
        ).all()

        count = 0
        for reminder in reminders:
            reminder.status = ReminderStatus.CANCELLED
            session.add(reminder)
            count += 1

        session.commit()
        return count


# Singleton instance for easy import
reminder_service = ReminderService()
