"""
Daily digest service for sending daily todo summaries.

Task Reference: T118, T119 [US11] - Create DailyDigestService
Feature: 006-recurring-reminders

Provides functionality for:
- Processing users eligible for daily digest
- Generating digest content
- Creating daily digest notifications
"""

import logging
from datetime import date, datetime, time as dt_time, timezone
from typing import List, Optional

from sqlmodel import Session, select
from zoneinfo import ZoneInfo

from app.models.enums import NotificationType, OccurrenceStatus
from app.models.notification import Notification
from app.models.occurrence import TodoOccurrence
from app.models.todo import Todo
from app.models.user_preferences import UserPreferences

logger = logging.getLogger(__name__)


class DailyDigestService:
    """
    Service for managing daily digest notifications.

    Task Reference: T118, T119 [US11]
    """

    @staticmethod
    async def process_daily_digests(session: Session) -> int:
        """
        Process daily digests for all eligible users.

        This runs hourly and checks which users should receive their digest
        based on their configured digest time and timezone.

        Args:
            session: Database session

        Returns:
            Number of digests sent

        Task Reference: T118, T119 [US11]
        """
        sent_count = 0
        now_utc = datetime.now(timezone.utc)

        # Get all users with daily digest enabled
        prefs_list = session.exec(
            select(UserPreferences).where(
                UserPreferences.daily_digest_enabled == True,  # noqa: E712
                UserPreferences.daily_digest_time.isnot(None),
            )
        ).all()

        logger.debug(f"Found {len(prefs_list)} users with daily digest enabled")

        for prefs in prefs_list:
            try:
                # Check if it's time to send the digest for this user
                if DailyDigestService._is_digest_time(prefs, now_utc):
                    # Check if we already sent a digest today for this user
                    if DailyDigestService._already_sent_today(session, prefs.user_id):
                        logger.debug(
                            f"Already sent digest today for user {prefs.user_id}"
                        )
                        continue

                    # Generate and send the digest
                    sent = await DailyDigestService._send_digest(
                        session, prefs.user_id, prefs.timezone
                    )
                    if sent:
                        sent_count += 1
                        logger.info(f"Sent daily digest to user {prefs.user_id}")

            except Exception as e:
                logger.error(
                    f"Error processing digest for user {prefs.user_id}: {e}"
                )
                continue

        return sent_count

    @staticmethod
    def _is_digest_time(prefs: UserPreferences, now_utc: datetime) -> bool:
        """
        Check if the current time matches the user's digest time.

        Args:
            prefs: User preferences with timezone and digest_time
            now_utc: Current UTC time

        Returns:
            True if digest should be sent now
        """
        if prefs.daily_digest_time is None:
            return False

        try:
            # Convert current UTC time to user's timezone
            user_tz = ZoneInfo(prefs.timezone)
            now_user = now_utc.astimezone(user_tz)

            # Check if current hour matches digest time hour
            # We use hour matching since the job runs hourly
            return now_user.hour == prefs.daily_digest_time.hour

        except Exception as e:
            logger.warning(f"Invalid timezone {prefs.timezone}: {e}")
            return False

    @staticmethod
    def _already_sent_today(session: Session, user_id: str) -> bool:
        """
        Check if we already sent a digest notification today.

        Args:
            session: Database session
            user_id: User ID to check

        Returns:
            True if digest already sent today
        """
        today_start = datetime.combine(date.today(), dt_time.min, tzinfo=timezone.utc)

        existing = session.exec(
            select(Notification).where(
                Notification.user_id == user_id,
                Notification.type == NotificationType.DAILY_DIGEST,
                Notification.created_at >= today_start,
            )
        ).first()

        return existing is not None

    @staticmethod
    async def _send_digest(
        session: Session, user_id: str, user_timezone: str
    ) -> bool:
        """
        Generate and send a daily digest notification.

        Args:
            session: Database session
            user_id: User to send digest to
            user_timezone: User's timezone

        Returns:
            True if digest was sent
        """
        # Get todos due today
        today = date.today()

        # Get regular (non-recurring) todos due today
        regular_todos = session.exec(
            select(Todo).where(
                Todo.user_id == user_id,
                Todo.due_date == today,
                Todo.completed == False,  # noqa: E712
            )
        ).all()

        # Get recurring todo occurrences due today
        occurrences = session.exec(
            select(TodoOccurrence).where(
                TodoOccurrence.user_id == user_id,
                TodoOccurrence.occurrence_date == today,
                TodoOccurrence.status == OccurrenceStatus.PENDING,
            )
        ).all()

        # Get parent todos for occurrences
        recurring_todo_ids = [occ.parent_todo_id for occ in occurrences]
        recurring_todos: List[Todo] = []
        if recurring_todo_ids:
            recurring_todos = list(
                session.exec(
                    select(Todo).where(Todo.id.in_(recurring_todo_ids))
                ).all()
            )

        # Build digest content
        total_count = len(regular_todos) + len(recurring_todos)

        if total_count == 0:
            # No todos due today - still send a "you're all clear" digest
            title = "Daily Digest: No tasks due today"
            body = "You have no tasks due today. Enjoy your day!"
        else:
            title = f"Daily Digest: {total_count} task{'s' if total_count != 1 else ''} due today"

            # Build body with todo titles
            body_parts: List[str] = []

            # Add regular todos
            for todo in regular_todos[:5]:  # Limit to first 5
                priority_indicator = ""
                if todo.priority:
                    priority_map = {"high": "🔴", "medium": "🟡", "low": "🟢"}
                    priority_indicator = f" {priority_map.get(todo.priority.value, '')}"
                body_parts.append(f"• {todo.title}{priority_indicator}")

            # Add recurring todos
            for todo in recurring_todos[:5]:  # Limit to first 5
                body_parts.append(f"• {todo.title} (recurring)")

            # If more than shown
            remaining = total_count - len(body_parts)
            if remaining > 0:
                body_parts.append(f"...and {remaining} more")

            body = "\n".join(body_parts)

        # Create the notification
        notification = Notification(
            user_id=user_id,
            type=NotificationType.DAILY_DIGEST,
            title=title,
            body=body,
            todo_id=None,  # Digest doesn't link to a specific todo
            reminder_id=None,
        )
        session.add(notification)
        session.commit()

        return True

    @staticmethod
    async def get_digest_preview(
        session: Session, user_id: str
    ) -> dict:
        """
        Get a preview of what the daily digest would contain.

        Useful for testing or showing users what their digest will look like.

        Args:
            session: Database session
            user_id: User ID

        Returns:
            Dict with title and body of what digest would contain
        """
        today = date.today()

        # Get regular todos due today
        regular_todos = session.exec(
            select(Todo).where(
                Todo.user_id == user_id,
                Todo.due_date == today,
                Todo.completed == False,  # noqa: E712
            )
        ).all()

        # Get recurring occurrences due today
        occurrences = session.exec(
            select(TodoOccurrence).where(
                TodoOccurrence.user_id == user_id,
                TodoOccurrence.occurrence_date == today,
                TodoOccurrence.status == OccurrenceStatus.PENDING,
            )
        ).all()

        return {
            "regular_todos": len(regular_todos),
            "recurring_occurrences": len(occurrences),
            "total": len(regular_todos) + len(occurrences),
        }


# Singleton instance for easy import
daily_digest_service = DailyDigestService()
