# SQLModel database models
# All database table models are defined here.

from app.models.base import BaseModel, TimestampMixin, UserOwnedMixin, UserOwnedModel
from app.models.priority import Priority
from app.models.tag import Tag
from app.models.todo import Todo
from app.models.todo_tag import TodoTag
from app.models.user import User, UserMinimal, UserPublic

# 006-recurring-reminders models
from app.models.enums import NotificationType, OccurrenceStatus, ReminderStatus
from app.models.notification import Notification
from app.models.occurrence import TodoOccurrence
from app.models.push_subscription import PushSubscription
from app.models.reminder import Reminder
from app.models.user_preferences import UserPreferences

__all__ = [
    "BaseModel",
    "TimestampMixin",
    "UserOwnedMixin",
    "UserOwnedModel",
    "User",
    "UserPublic",
    "UserMinimal",
    "Todo",
    # 005-todo-enhancements
    "Priority",
    "Tag",
    "TodoTag",
    # 006-recurring-reminders
    "OccurrenceStatus",
    "ReminderStatus",
    "NotificationType",
    "TodoOccurrence",
    "Reminder",
    "Notification",
    "PushSubscription",
    "UserPreferences",
]
