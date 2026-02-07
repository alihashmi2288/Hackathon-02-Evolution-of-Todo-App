"""
Notification service for in-app notifications.

Task Reference: T025 - Create NotificationService for creating in-app notifications
Feature: 006-recurring-reminders

Provides functionality for:
- Creating notifications
- Listing user notifications
- Marking notifications as read
"""

from datetime import datetime, timezone
from typing import List, Optional

from sqlmodel import Session, select

from app.models.enums import NotificationType
from app.models.notification import Notification


class NotificationService:
    """
    Service for managing in-app notifications.

    Task Reference: T025
    """

    @staticmethod
    async def create_notification(
        session: Session,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        body: str,
        todo_id: Optional[str] = None,
        reminder_id: Optional[str] = None,
    ) -> Notification:
        """
        Create a new in-app notification.

        Args:
            session: Database session
            user_id: User to notify
            notification_type: Type of notification
            title: Notification title
            body: Notification body text
            todo_id: Optional related todo ID
            reminder_id: Optional related reminder ID (for snooze action)

        Returns:
            Created notification

        Task Reference: T054, T115 [US10]
        """
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            body=body,
            todo_id=todo_id,
            reminder_id=reminder_id,
        )
        session.add(notification)
        session.commit()
        session.refresh(notification)
        return notification

    @staticmethod
    async def get_user_notifications(
        session: Session,
        user_id: str,
        unread_only: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[List[Notification], int, int]:
        """
        Get notifications for a user.

        Args:
            session: Database session
            user_id: User whose notifications to fetch
            unread_only: If True, only return unread notifications
            limit: Maximum number to return
            offset: Offset for pagination

        Returns:
            Tuple of (notifications, total_count, unread_count)
        """
        # Base query
        query = select(Notification).where(Notification.user_id == user_id)

        if unread_only:
            query = query.where(Notification.read == False)

        # Order by created_at descending (newest first)
        query = query.order_by(Notification.created_at.desc())

        # Get total count
        count_query = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            count_query = count_query.where(Notification.read == False)
        total = len(session.exec(count_query).all())

        # Get unread count
        unread_query = select(Notification).where(
            Notification.user_id == user_id,
            Notification.read == False,
        )
        unread_count = len(session.exec(unread_query).all())

        # Apply pagination
        query = query.offset(offset).limit(limit)
        notifications = session.exec(query).all()

        return list(notifications), total, unread_count

    @staticmethod
    async def mark_as_read(
        session: Session,
        user_id: str,
        notification_ids: List[str],
    ) -> int:
        """
        Mark notifications as read.

        Args:
            session: Database session
            user_id: User who owns the notifications
            notification_ids: IDs of notifications to mark as read

        Returns:
            Number of notifications updated
        """
        query = select(Notification).where(
            Notification.user_id == user_id,
            Notification.id.in_(notification_ids),
            Notification.read == False,
        )
        notifications = session.exec(query).all()

        count = 0
        for notification in notifications:
            notification.read = True
            session.add(notification)
            count += 1

        session.commit()
        return count

    @staticmethod
    async def mark_all_as_read(session: Session, user_id: str) -> int:
        """
        Mark all notifications as read for a user.

        Args:
            session: Database session
            user_id: User whose notifications to mark as read

        Returns:
            Number of notifications updated
        """
        query = select(Notification).where(
            Notification.user_id == user_id,
            Notification.read == False,
        )
        notifications = session.exec(query).all()

        count = 0
        for notification in notifications:
            notification.read = True
            session.add(notification)
            count += 1

        session.commit()
        return count

    @staticmethod
    async def delete_notification(
        session: Session,
        user_id: str,
        notification_id: str,
    ) -> bool:
        """
        Delete a notification.

        Args:
            session: Database session
            user_id: User who owns the notification
            notification_id: ID of notification to delete

        Returns:
            True if deleted, False if not found
        """
        query = select(Notification).where(
            Notification.user_id == user_id,
            Notification.id == notification_id,
        )
        notification = session.exec(query).first()

        if notification:
            session.delete(notification)
            session.commit()
            return True
        return False


# Singleton instance for easy import
notification_service = NotificationService()
