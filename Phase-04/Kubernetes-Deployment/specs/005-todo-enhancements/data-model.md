# Data Model: Todo Enhancements

**Feature**: 005-todo-enhancements
**Date**: 2026-01-18
**Status**: Complete

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          users                               │
│  (managed by Better Auth - reference only)                  │
├─────────────────────────────────────────────────────────────┤
│  id: varchar(36) [PK]                                       │
│  email: varchar(255)                                        │
│  name: varchar(255)                                         │
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────────────────────────────────────────────┐
│                          todos                               │
├─────────────────────────────────────────────────────────────┤
│  id: varchar(21) [PK]          # nanoid                     │
│  title: varchar(255) [NOT NULL]                             │
│  description: text [NULL]                                   │
│  completed: boolean [DEFAULT false]                         │
│  user_id: varchar(36) [FK → users.id, INDEX]               │
│  created_at: timestamptz [DEFAULT now()]                    │
│  updated_at: timestamptz [DEFAULT now()]                    │
│  ─────────────────────────────────────────────────────────  │
│  due_date: date [NULL, INDEX]           # NEW               │
│  priority: priority_enum [NULL, INDEX]  # NEW               │
└─────────────────────────────────────────────────────────────┘
          │
          │ N:M (via todo_tags)
          ▼
┌─────────────────────────────────────────────────────────────┐
│                       todo_tags                              │
│  (junction table)                                           │
├─────────────────────────────────────────────────────────────┤
│  todo_id: varchar(21) [PK, FK → todos.id, ON DELETE CASCADE]│
│  tag_id: varchar(21) [PK, FK → tags.id, ON DELETE CASCADE]  │
└─────────────────────────────────────────────────────────────┘
          │
          │ N:1
          ▼
┌─────────────────────────────────────────────────────────────┐
│                          tags                                │
│  (NEW table)                                                │
├─────────────────────────────────────────────────────────────┤
│  id: varchar(21) [PK]              # nanoid                 │
│  name: varchar(50) [NOT NULL]                               │
│  color: varchar(7) [NOT NULL, DEFAULT '#3B82F6']  # hex     │
│  user_id: varchar(36) [FK → users.id, INDEX]               │
│  created_at: timestamptz [DEFAULT now()]                    │
│  updated_at: timestamptz [DEFAULT now()]                    │
│  ─────────────────────────────────────────────────────────  │
│  UNIQUE(user_id, lower(name))      # case-insensitive      │
└─────────────────────────────────────────────────────────────┘
```

## Entities

### Todo (Extended)

Extends the existing Todo model from SPEC-003.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | varchar(21) | PK | nanoid, URL-safe |
| title | varchar(255) | NOT NULL, 1-255 chars | Required |
| description | text | NULL | Optional |
| completed | boolean | DEFAULT false | |
| user_id | varchar(36) | FK, NOT NULL, INDEX | Owner reference |
| created_at | timestamptz | DEFAULT now() | UTC |
| updated_at | timestamptz | DEFAULT now() | Auto-updated |
| **due_date** | date | NULL, INDEX | **NEW** - Optional deadline |
| **priority** | priority_enum | NULL, INDEX | **NEW** - High/Medium/Low/NULL |

**Validation Rules**:
- `title`: 1-255 characters, non-empty after trim
- `due_date`: Valid date or null (past dates allowed)
- `priority`: One of HIGH, MEDIUM, LOW, or null

**Indexes**:
- `idx_todos_user_id` (existing)
- `idx_todos_due_date` (new) - for date range filtering
- `idx_todos_priority` (new) - for priority filtering
- `idx_todos_user_completed` (new) - composite for status filtering

### Tag (New)

User-created categorization labels.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | varchar(21) | PK | nanoid, URL-safe |
| name | varchar(50) | NOT NULL, 1-50 chars | Display name |
| color | varchar(7) | NOT NULL, DEFAULT '#3B82F6' | Hex color code |
| user_id | varchar(36) | FK, NOT NULL, INDEX | Owner reference |
| created_at | timestamptz | DEFAULT now() | UTC |
| updated_at | timestamptz | DEFAULT now() | Auto-updated |

**Validation Rules**:
- `name`: 1-50 characters, non-empty after trim
- `color`: Valid hex color (#RRGGBB format)
- `name` + `user_id`: Unique combination (case-insensitive)

**Indexes**:
- `idx_tags_user_id` - for listing user's tags
- `uq_tags_user_name` - unique constraint (user_id, lower(name))

### TodoTag (New)

Junction table for many-to-many relationship.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| todo_id | varchar(21) | PK, FK → todos.id | ON DELETE CASCADE |
| tag_id | varchar(21) | PK, FK → tags.id | ON DELETE CASCADE |

**Cascade Behavior**:
- Delete todo → deletes all associated todo_tags
- Delete tag → deletes all associated todo_tags

**Indexes**:
- Primary key covers (todo_id, tag_id)
- `idx_todo_tags_tag_id` - for reverse lookup (find todos by tag)

## Enums

### Priority

PostgreSQL ENUM type for type safety.

```sql
CREATE TYPE priority_enum AS ENUM ('high', 'medium', 'low');
```

| Value | Display | Color |
|-------|---------|-------|
| high | High | #EF4444 (red) |
| medium | Medium | #EAB308 (yellow) |
| low | Low | #6B7280 (gray) |
| NULL | (none) | (no indicator) |

## SQLModel Definitions

### Priority Enum

```python
# backend/app/models/priority.py
from enum import Enum

class Priority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
```

### Todo Model (Extended)

```python
# backend/app/models/todo.py
from datetime import date, datetime
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Enum as SAEnum, Index
from typing import TYPE_CHECKING

from .priority import Priority

if TYPE_CHECKING:
    from .tag import Tag
    from .todo_tag import TodoTag

class Todo(SQLModel, table=True):
    __tablename__ = "todos"
    __table_args__ = (
        Index("idx_todos_due_date", "due_date"),
        Index("idx_todos_priority", "priority"),
        Index("idx_todos_user_completed", "user_id", "completed"),
    )

    id: str = Field(primary_key=True, max_length=21)
    title: str = Field(max_length=255)
    description: str | None = Field(default=None)
    completed: bool = Field(default=False)
    user_id: str = Field(foreign_key="user.id", index=True, max_length=36)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # NEW fields
    due_date: date | None = Field(default=None)
    priority: Priority | None = Field(
        default=None,
        sa_type=SAEnum(Priority, name="priority_enum", create_type=True)
    )

    # Relationships
    todo_tags: list["TodoTag"] = Relationship(back_populates="todo")
    tags: list["Tag"] = Relationship(
        back_populates="todos",
        link_model="TodoTag"
    )
```

### Tag Model

```python
# backend/app/models/tag.py
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Index, UniqueConstraint
from sqlalchemy import func
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .todo import Todo
    from .todo_tag import TodoTag

class Tag(SQLModel, table=True):
    __tablename__ = "tags"
    __table_args__ = (
        UniqueConstraint("user_id", func.lower("name"), name="uq_tags_user_name"),
        Index("idx_tags_user_id", "user_id"),
    )

    id: str = Field(primary_key=True, max_length=21)
    name: str = Field(max_length=50)
    color: str = Field(max_length=7, default="#3B82F6")
    user_id: str = Field(foreign_key="user.id", max_length=36)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    todo_tags: list["TodoTag"] = Relationship(back_populates="tag")
    todos: list["Todo"] = Relationship(
        back_populates="tags",
        link_model="TodoTag"
    )
```

### TodoTag Model

```python
# backend/app/models/todo_tag.py
from sqlmodel import SQLModel, Field, Relationship, Index
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .todo import Todo
    from .tag import Tag

class TodoTag(SQLModel, table=True):
    __tablename__ = "todo_tags"
    __table_args__ = (
        Index("idx_todo_tags_tag_id", "tag_id"),
    )

    todo_id: str = Field(
        foreign_key="todos.id",
        primary_key=True,
        max_length=21,
        ondelete="CASCADE"
    )
    tag_id: str = Field(
        foreign_key="tags.id",
        primary_key=True,
        max_length=21,
        ondelete="CASCADE"
    )

    # Relationships
    todo: "Todo" = Relationship(back_populates="todo_tags")
    tag: "Tag" = Relationship(back_populates="todo_tags")
```

## Migration

### Alembic Migration Script

```python
# alembic/versions/xxx_add_todo_enhancements.py
"""Add todo enhancements: due_date, priority, tags

Revision ID: xxx
Revises: [previous_revision]
Create Date: 2026-01-18
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'xxx'
down_revision = '[previous_revision]'
branch_labels = None
depends_on = None

def upgrade():
    # Create priority enum
    priority_enum = postgresql.ENUM('high', 'medium', 'low', name='priority_enum')
    priority_enum.create(op.get_bind(), checkfirst=True)

    # Add columns to todos
    op.add_column('todos', sa.Column('due_date', sa.Date(), nullable=True))
    op.add_column('todos', sa.Column('priority', priority_enum, nullable=True))

    # Create indexes on todos
    op.create_index('idx_todos_due_date', 'todos', ['due_date'])
    op.create_index('idx_todos_priority', 'todos', ['priority'])
    op.create_index('idx_todos_user_completed', 'todos', ['user_id', 'completed'])

    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.String(21), primary_key=True),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('color', sa.String(7), nullable=False, server_default='#3B82F6'),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_tags_user_id', 'tags', ['user_id'])
    op.execute(
        "CREATE UNIQUE INDEX uq_tags_user_name ON tags (user_id, lower(name))"
    )

    # Create todo_tags junction table
    op.create_table(
        'todo_tags',
        sa.Column('todo_id', sa.String(21), sa.ForeignKey('todos.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('tag_id', sa.String(21), sa.ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True),
    )
    op.create_index('idx_todo_tags_tag_id', 'todo_tags', ['tag_id'])

def downgrade():
    # Drop todo_tags
    op.drop_index('idx_todo_tags_tag_id', 'todo_tags')
    op.drop_table('todo_tags')

    # Drop tags
    op.execute("DROP INDEX IF EXISTS uq_tags_user_name")
    op.drop_index('idx_tags_user_id', 'tags')
    op.drop_table('tags')

    # Remove columns from todos
    op.drop_index('idx_todos_user_completed', 'todos')
    op.drop_index('idx_todos_priority', 'todos')
    op.drop_index('idx_todos_due_date', 'todos')
    op.drop_column('todos', 'priority')
    op.drop_column('todos', 'due_date')

    # Drop enum
    priority_enum = postgresql.ENUM('high', 'medium', 'low', name='priority_enum')
    priority_enum.drop(op.get_bind(), checkfirst=True)
```

## TypeScript Types

### Frontend Type Definitions

```typescript
// frontend/src/types/todo.ts (extended)
export type Priority = "high" | "medium" | "low";

export interface Tag {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  // NEW fields
  due_date: string | null;  // ISO date string (YYYY-MM-DD)
  priority: Priority | null;
  tags: Tag[];
}

export interface TodoCreate {
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: Priority | null;
  tag_ids?: string[];
}

export interface TodoUpdate {
  title?: string;
  description?: string | null;
  completed?: boolean;
  due_date?: string | null;
  priority?: Priority | null;
  tag_ids?: string[];
}

// frontend/src/types/tag.ts (new)
export interface TagCreate {
  name: string;
  color?: string;
}

export interface TagUpdate {
  name?: string;
  color?: string;
}

// frontend/src/types/filters.ts (new)
export interface FilterState {
  search: string;
  priorities: Priority[];
  tagIds: string[];
  dueBefore: string | null;
  dueAfter: string | null;
  status: "all" | "active" | "completed";
  sortBy: "created_at" | "due_date" | "priority";
}
```

## Data Constraints Summary

| Entity | Constraint | Rule |
|--------|------------|------|
| Todo.title | Length | 1-255 characters |
| Todo.due_date | Valid | ISO date or null |
| Todo.priority | Enum | high, medium, low, or null |
| Tag.name | Length | 1-50 characters |
| Tag.name | Unique | Per user (case-insensitive) |
| Tag.color | Format | #RRGGBB hex code |
| TodoTag | Cascade | Deleted with parent todo or tag |
