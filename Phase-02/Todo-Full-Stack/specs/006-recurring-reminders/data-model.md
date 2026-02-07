# Data Model: Recurring Tasks & Smart Reminders

**Feature**: 006-recurring-reminders
**Date**: 2026-01-23

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────────┐
│    User     │──────<│       Todo       │──────<│   TodoOccurrence │
│             │   1:N │                  │   1:N │                 │
└─────────────┘       └──────────────────┘       └─────────────────┘
      │                       │                          │
      │ 1:1                   │ 1:N                      │ 1:N
      ▼                       ▼                          ▼
┌─────────────────┐   ┌──────────────┐           ┌──────────────┐
│ UserPreferences │   │   Reminder   │           │  Notification │
└─────────────────┘   └──────────────┘           └──────────────┘
                              │
                              │ 1:N
                              ▼
                      ┌──────────────┐
                      │PushSubscription│
                      └──────────────┘
```

---

## 1. RecurrenceRule (Embedded in Todo)

Recurrence is stored as fields on the existing `Todo` model rather than a separate table, simplifying the relationship.

### Extended Todo Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `is_recurring` | `bool` | default: false | Whether this todo is a recurring series |
| `rrule` | `str \| null` | max 500 chars | RFC 5545 RRULE string (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR") |
| `recurrence_end_date` | `date \| null` | | Explicit end date for the series |
| `recurrence_count` | `int \| null` | min: 1, max: 365 | Number of occurrences (alternative to end date) |
| `occurrences_generated` | `int` | default: 0 | Count of occurrences created so far |

**SQLModel Definition**:
```python
class Todo(SQLModel, table=True):
    # ... existing fields ...

    # Recurrence fields (006-recurring-reminders)
    is_recurring: bool = Field(default=False)
    rrule: Optional[str] = Field(default=None, max_length=500)
    recurrence_end_date: Optional[date] = Field(default=None)
    recurrence_count: Optional[int] = Field(default=None, ge=1, le=365)
    occurrences_generated: int = Field(default=0)

    # Relationships
    occurrences: List["TodoOccurrence"] = Relationship(back_populates="parent_todo")
    reminders: List["Reminder"] = Relationship(back_populates="todo")
```

**Indexes**:
```sql
CREATE INDEX idx_todos_recurring ON todos(user_id, is_recurring) WHERE is_recurring = true;
```

---

## 2. TodoOccurrence

Represents a single instance of a recurring todo. Non-recurring todos don't use this table.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `str` | PK, nanoid(21) | Unique occurrence identifier |
| `parent_todo_id` | `str` | FK → todos.id, indexed | The recurring series this belongs to |
| `user_id` | `str` | indexed | Owner (denormalized for query efficiency) |
| `occurrence_date` | `date` | not null, indexed | Scheduled date for this occurrence |
| `status` | `OccurrenceStatus` | enum | pending, completed, skipped |
| `completed_at` | `datetime \| null` | | When marked complete |
| `created_at` | `datetime` | auto | Record creation time |
| `updated_at` | `datetime` | auto | Last modification time |

**Enum: OccurrenceStatus**
```python
class OccurrenceStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    SKIPPED = "skipped"
```

**SQLModel Definition**:
```python
class TodoOccurrence(SQLModel, table=True):
    __tablename__ = "todo_occurrences"
    __table_args__ = (
        Index("idx_occurrences_parent", "parent_todo_id"),
        Index("idx_occurrences_user_date", "user_id", "occurrence_date"),
        UniqueConstraint("parent_todo_id", "occurrence_date", name="uq_occurrence_date"),
    )

    id: str = Field(default_factory=generate_nanoid, primary_key=True, max_length=21)
    parent_todo_id: str = Field(foreign_key="todos.id", index=True)
    user_id: str = Field(index=True)
    occurrence_date: date = Field(index=True)
    status: OccurrenceStatus = Field(default=OccurrenceStatus.PENDING)
    completed_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    parent_todo: "Todo" = Relationship(back_populates="occurrences")
```

---

## 3. Reminder

Scheduled notification for a todo (or occurrence).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `str` | PK, nanoid(21) | Unique reminder identifier |
| `todo_id` | `str` | FK → todos.id, indexed | Associated todo |
| `occurrence_id` | `str \| null` | FK → todo_occurrences.id | Specific occurrence (if recurring) |
| `user_id` | `str` | indexed | Owner |
| `fire_at` | `datetime` | not null, indexed | When to send notification (UTC) |
| `offset_minutes` | `int` | not null | Minutes before due (-5, -60, -1440, etc.) |
| `status` | `ReminderStatus` | enum | pending, sent, snoozed, cancelled |
| `sent_at` | `datetime \| null` | | When notification was sent |
| `snoozed_until` | `datetime \| null` | | If snoozed, when to re-fire |
| `created_at` | `datetime` | auto | Record creation time |

**Enum: ReminderStatus**
```python
class ReminderStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    SNOOZED = "snoozed"
    CANCELLED = "cancelled"
```

**SQLModel Definition**:
```python
class Reminder(SQLModel, table=True):
    __tablename__ = "reminders"
    __table_args__ = (
        Index("idx_reminders_fire", "fire_at", "status"),
        Index("idx_reminders_todo", "todo_id"),
    )

    id: str = Field(default_factory=generate_nanoid, primary_key=True, max_length=21)
    todo_id: str = Field(foreign_key="todos.id", index=True)
    occurrence_id: Optional[str] = Field(default=None, foreign_key="todo_occurrences.id")
    user_id: str = Field(index=True)
    fire_at: datetime = Field(index=True)
    offset_minutes: int = Field(description="Minutes before due time (negative)")
    status: ReminderStatus = Field(default=ReminderStatus.PENDING)
    sent_at: Optional[datetime] = Field(default=None)
    snoozed_until: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    todo: "Todo" = Relationship(back_populates="reminders")
```

**Standard Reminder Offsets**:
| UI Label | offset_minutes |
|----------|----------------|
| 5 minutes before | -5 |
| 15 minutes before | -15 |
| 30 minutes before | -30 |
| 1 hour before | -60 |
| 2 hours before | -120 |
| 1 day before | -1440 |
| 2 days before | -2880 |
| 1 week before | -10080 |

---

## 4. Notification

In-app notification record for the notification center.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `str` | PK, nanoid(21) | Unique notification identifier |
| `user_id` | `str` | indexed | Recipient |
| `type` | `NotificationType` | enum | reminder, daily_digest, recurring_due |
| `title` | `str` | max 200 | Notification title |
| `body` | `str \| null` | max 500 | Notification body text |
| `todo_id` | `str \| null` | FK → todos.id | Related todo (for click-through) |
| `read` | `bool` | default: false, indexed | Whether user has seen it |
| `created_at` | `datetime` | auto, indexed | When notification was created |

**Enum: NotificationType**
```python
class NotificationType(str, Enum):
    REMINDER = "reminder"
    DAILY_DIGEST = "daily_digest"
    RECURRING_DUE = "recurring_due"
```

**SQLModel Definition**:
```python
class Notification(SQLModel, table=True):
    __tablename__ = "notifications"
    __table_args__ = (
        Index("idx_notifications_user_read", "user_id", "read"),
        Index("idx_notifications_user_created", "user_id", "created_at"),
    )

    id: str = Field(default_factory=generate_nanoid, primary_key=True, max_length=21)
    user_id: str = Field(index=True)
    type: NotificationType
    title: str = Field(max_length=200)
    body: Optional[str] = Field(default=None, max_length=500)
    todo_id: Optional[str] = Field(default=None, foreign_key="todos.id")
    read: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
```

**Retention Policy**: Notifications older than 30 days are auto-deleted by a scheduled job.

---

## 5. PushSubscription

Browser push notification subscription for a user.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `str` | PK, nanoid(21) | Unique subscription identifier |
| `user_id` | `str` | indexed | Owner |
| `endpoint` | `str` | max 500, unique | Push service URL |
| `p256dh_key` | `str` | max 200 | Encryption key |
| `auth_key` | `str` | max 100 | Auth secret |
| `user_agent` | `str \| null` | max 300 | Browser user agent (for debugging) |
| `created_at` | `datetime` | auto | When registered |
| `last_used_at` | `datetime \| null` | | Last successful push |

**SQLModel Definition**:
```python
class PushSubscription(SQLModel, table=True):
    __tablename__ = "push_subscriptions"
    __table_args__ = (
        Index("idx_push_user", "user_id"),
    )

    id: str = Field(default_factory=generate_nanoid, primary_key=True, max_length=21)
    user_id: str = Field(index=True)
    endpoint: str = Field(max_length=500, unique=True)
    p256dh_key: str = Field(max_length=200)
    auth_key: str = Field(max_length=100)
    user_agent: Optional[str] = Field(default=None, max_length=300)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_used_at: Optional[datetime] = Field(default=None)
```

---

## 6. UserPreferences

User-specific settings for reminders and notifications.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `str` | PK, nanoid(21) | Unique identifier |
| `user_id` | `str` | unique, indexed | Associated user |
| `timezone` | `str` | max 50, default: "UTC" | IANA timezone (e.g., "America/New_York") |
| `default_reminder_offset` | `int \| null` | | Default minutes before due for auto-reminders |
| `push_enabled` | `bool` | default: true | Whether push notifications are enabled |
| `daily_digest_enabled` | `bool` | default: false | Whether daily digest is enabled |
| `daily_digest_time` | `time \| null` | | Time to send daily digest (in user's TZ) |
| `created_at` | `datetime` | auto | Record creation time |
| `updated_at` | `datetime` | auto | Last modification time |

**SQLModel Definition**:
```python
class UserPreferences(SQLModel, table=True):
    __tablename__ = "user_preferences"

    id: str = Field(default_factory=generate_nanoid, primary_key=True, max_length=21)
    user_id: str = Field(unique=True, index=True)
    timezone: str = Field(default="UTC", max_length=50)
    default_reminder_offset: Optional[int] = Field(default=None)
    push_enabled: bool = Field(default=True)
    daily_digest_enabled: bool = Field(default=False)
    daily_digest_time: Optional[time] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
```

---

## Migration Strategy

### Migration 1: Add recurrence fields to todos
```python
# alembic/versions/xxx_add_recurring_fields_to_todos.py
def upgrade():
    op.add_column('todos', sa.Column('is_recurring', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('todos', sa.Column('rrule', sa.String(500), nullable=True))
    op.add_column('todos', sa.Column('recurrence_end_date', sa.Date(), nullable=True))
    op.add_column('todos', sa.Column('recurrence_count', sa.Integer(), nullable=True))
    op.add_column('todos', sa.Column('occurrences_generated', sa.Integer(), nullable=False, server_default='0'))
    op.create_index('idx_todos_recurring', 'todos', ['user_id', 'is_recurring'])
```

### Migration 2: Create todo_occurrences table
```python
def upgrade():
    op.create_table('todo_occurrences',
        sa.Column('id', sa.String(21), primary_key=True),
        sa.Column('parent_todo_id', sa.String(21), sa.ForeignKey('todos.id', ondelete='CASCADE')),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('occurrence_date', sa.Date(), nullable=False),
        sa.Column('status', sa.Enum('pending', 'completed', 'skipped', name='occurrence_status')),
        sa.Column('completed_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_occurrences_parent', 'todo_occurrences', ['parent_todo_id'])
    op.create_index('idx_occurrences_user_date', 'todo_occurrences', ['user_id', 'occurrence_date'])
    op.create_unique_constraint('uq_occurrence_date', 'todo_occurrences', ['parent_todo_id', 'occurrence_date'])
```

### Migration 3: Create reminders table
### Migration 4: Create notifications table
### Migration 5: Create push_subscriptions table
### Migration 6: Create user_preferences table

---

## Validation Rules

### Todo (extended)
- If `is_recurring` is true, `rrule` must be set
- If `recurrence_count` is set, `recurrence_end_date` must be null (and vice versa)
- `rrule` must be a valid RFC 5545 RRULE string

### TodoOccurrence
- `occurrence_date` must be unique per `parent_todo_id`
- Cannot create occurrence for past dates (on creation)

### Reminder
- Maximum 5 reminders per todo (enforced at API level)
- `fire_at` must be in the future (on creation)
- `offset_minutes` must be negative (before due time)

### Notification
- `title` is required and non-empty
- Auto-delete after 30 days (background job)

### UserPreferences
- `timezone` must be a valid IANA timezone identifier
- `daily_digest_time` required if `daily_digest_enabled` is true
