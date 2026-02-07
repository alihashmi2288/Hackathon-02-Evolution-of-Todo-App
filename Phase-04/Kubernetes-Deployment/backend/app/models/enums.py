"""
Enums for recurring tasks and reminders feature.

Task Reference: T008, T009, T010 - Create status enums
Feature: 006-recurring-reminders

Provides PostgreSQL ENUM types for:
- OccurrenceStatus: Status of a recurring todo occurrence
- ReminderStatus: Status of a reminder
- NotificationType: Type of notification
"""

from enum import Enum


class OccurrenceStatus(str, Enum):
    """
    Status of a single occurrence in a recurring series.

    Values:
        PENDING: Occurrence is scheduled but not completed
        COMPLETED: Occurrence has been marked as done
        SKIPPED: Occurrence was skipped (not completed, not affecting series)
    """

    PENDING = "pending"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class ReminderStatus(str, Enum):
    """
    Status of a reminder.

    Values:
        PENDING: Reminder is scheduled to fire
        SENT: Reminder notification was sent
        SNOOZED: Reminder was snoozed, will fire again later
        CANCELLED: Reminder was cancelled (todo deleted or manually cancelled)
    """

    PENDING = "pending"
    SENT = "sent"
    SNOOZED = "snoozed"
    CANCELLED = "cancelled"


class NotificationType(str, Enum):
    """
    Type of notification for the notification center.

    Values:
        REMINDER: Reminder notification for a todo
        DAILY_DIGEST: Daily summary of todos
        RECURRING_DUE: Recurring todo is due
    """

    REMINDER = "reminder"
    DAILY_DIGEST = "daily_digest"
    RECURRING_DUE = "recurring_due"
