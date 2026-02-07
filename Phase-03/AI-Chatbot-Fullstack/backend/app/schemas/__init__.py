# Pydantic Schemas
# Request and response schemas for API validation.

from app.schemas.error import ErrorResponse
from app.schemas.tag import TagCreate, TagResponse, TagUpdate, TagWithCountResponse
from app.schemas.todo import (
    TagInTodoResponse,
    TodoCreate,
    TodoResponse,
    TodoUpdate,
)

# 006-recurring-reminders schemas
from app.schemas.notification import (
    NotificationListResponse,
    NotificationMarkRead,
    NotificationResponse,
)
from app.schemas.occurrence import (
    OccurrenceListResponse,
    OccurrenceResponse,
    OccurrenceUpdate,
)
from app.schemas.push_subscription import (
    PushSubscriptionCreate,
    PushSubscriptionKeys,
    PushSubscriptionListResponse,
    PushSubscriptionResponse,
)
from app.schemas.recurrence import RecurrenceConfig
from app.schemas.reminder import (
    ReminderCreate,
    ReminderListResponse,
    ReminderResponse,
    ReminderSnooze,
)
from app.schemas.user_preferences import UserPreferencesResponse, UserPreferencesUpdate

__all__ = [
    # Error schemas
    "ErrorResponse",
    # Todo schemas
    "TodoCreate",
    "TodoUpdate",
    "TodoResponse",
    "TagInTodoResponse",
    # Tag schemas (005-todo-enhancements)
    "TagCreate",
    "TagUpdate",
    "TagResponse",
    "TagWithCountResponse",
    # 006-recurring-reminders schemas
    "RecurrenceConfig",
    "OccurrenceResponse",
    "OccurrenceUpdate",
    "OccurrenceListResponse",
    "ReminderCreate",
    "ReminderResponse",
    "ReminderSnooze",
    "ReminderListResponse",
    "NotificationResponse",
    "NotificationMarkRead",
    "NotificationListResponse",
    "PushSubscriptionKeys",
    "PushSubscriptionCreate",
    "PushSubscriptionResponse",
    "PushSubscriptionListResponse",
    "UserPreferencesUpdate",
    "UserPreferencesResponse",
]
