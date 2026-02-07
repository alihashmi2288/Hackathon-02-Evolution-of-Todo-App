# Data Model: Todo CRUD Operations

**Feature**: 003-todo-crud
**Date**: 2026-01-17

## Entity: Todo

### Overview

The Todo entity represents a task item owned by a specific user. Each todo belongs to exactly one user (identified by `user_id`), enforcing data isolation at the database level.

### Schema Definition

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique identifier (nanoid, 21 chars) |
| `title` | VARCHAR(255) | NOT NULL | Task title/summary |
| `description` | TEXT | NULLABLE | Optional detailed description |
| `completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Task completion status |
| `user_id` | TEXT | NOT NULL, INDEX | Owner's user ID (from JWT) |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | Creation timestamp (UTC) |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | Last modification timestamp (UTC) |

### SQLModel Definition

```python
from datetime import datetime, timezone
from typing import Optional

from nanoid import generate
from sqlmodel import Field, SQLModel


def generate_todo_id() -> str:
    """Generate a unique todo ID using nanoid."""
    return generate(size=21)


class Todo(SQLModel, table=True):
    """
    Todo entity representing a user's task.

    Inherits timestamp behavior and enforces user ownership.
    """
    __tablename__ = "todos"

    id: str = Field(
        default_factory=generate_todo_id,
        primary_key=True,
        max_length=21,
        description="Unique todo identifier"
    )
    title: str = Field(
        ...,
        max_length=255,
        min_length=1,
        description="Task title (required)"
    )
    description: Optional[str] = Field(
        default=None,
        description="Optional detailed description"
    )
    completed: bool = Field(
        default=False,
        description="Whether the task is completed"
    )
    user_id: str = Field(
        ...,
        index=True,
        description="Owner's user ID from JWT"
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
        description="Last update timestamp"
    )
```

### Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `pk_todos` | `id` | PRIMARY KEY | Unique identification |
| `ix_todos_user_id` | `user_id` | INDEX | Fast user todo lookups |

### Relationships

```
┌─────────────────┐         ┌─────────────────┐
│      User       │         │      Todo       │
│  (Better Auth)  │ 1     * │                 │
├─────────────────┤─────────├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ email           │         │ title           │
│ name            │         │ description     │
│ ...             │         │ completed       │
│                 │         │ user_id (FK)    │
│                 │         │ created_at      │
│                 │         │ updated_at      │
└─────────────────┘         └─────────────────┘
```

**Note**: The User table is managed by Better Auth in the frontend database. The `user_id` in Todo references the user's ID but is not a formal foreign key constraint (cross-database reference).

### Validation Rules

| Rule | Field | Constraint | Error Code |
|------|-------|------------|------------|
| Required | `title` | NOT NULL, non-empty | VALIDATION_ERROR |
| Max Length | `title` | ≤ 255 characters | VALIDATION_ERROR |
| Whitespace | `title` | Cannot be whitespace-only | VALIDATION_ERROR |
| Owner | `user_id` | Must match JWT subject | 404 NOT FOUND |

### State Transitions

```
┌──────────────┐    create    ┌──────────────┐
│   (none)     │ ───────────► │   Active     │
└──────────────┘              │ completed=F  │
                              └──────────────┘
                                     │
                                     │ update (mark complete)
                                     ▼
                              ┌──────────────┐
                              │  Completed   │
                              │ completed=T  │
                              └──────────────┘
                                     │
                                     │ update (mark incomplete)
                                     ▼
                              ┌──────────────┐
                              │   Active     │
                              │ completed=F  │
                              └──────────────┘
                                     │
                                     │ delete
                                     ▼
                              ┌──────────────┐
                              │  (deleted)   │
                              └──────────────┘
```

### Migration Notes

**Table Creation SQL** (for reference):
```sql
CREATE TABLE todos (
    id VARCHAR(21) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_todos_user_id ON todos(user_id);
```

**Alembic Migration**: Will be auto-generated using `alembic revision --autogenerate -m "add todos table"`.
