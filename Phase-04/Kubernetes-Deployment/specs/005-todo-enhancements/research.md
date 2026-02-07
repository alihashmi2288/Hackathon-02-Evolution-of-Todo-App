# Research: Todo Enhancements

**Feature**: 005-todo-enhancements
**Date**: 2026-01-18
**Status**: Complete

## Research Tasks

### 1. Priority Enum Implementation

**Question**: How to implement priority levels in PostgreSQL with SQLModel?

**Decision**: Use Python Enum with PostgreSQL native ENUM type

**Rationale**:
- Type safety at both Python and database levels
- Efficient storage (single byte)
- Indexable for fast filtering
- SQLModel/SQLAlchemy has native support via `sa_type`

**Alternatives Considered**:
- String column: Rejected - no type safety, larger storage
- Integer column: Rejected - magic numbers reduce readability
- Check constraint: Rejected - less type-safe than native ENUM

**Implementation**:
```python
from enum import Enum
from sqlmodel import Field
from sqlalchemy import Enum as SAEnum

class Priority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Todo(SQLModel, table=True):
    priority: Priority | None = Field(
        default=None,
        sa_type=SAEnum(Priority, name="priority_enum", create_type=True)
    )
```

---

### 2. Tag Color Palette

**Question**: How to handle tag colors - user-defined or predefined palette?

**Decision**: Predefined palette of 8 colors stored as hex codes

**Rationale**:
- Ensures visual consistency and accessibility
- Simplifies UI (dropdown vs color picker)
- Prevents poor color choices (low contrast, etc.)
- Hex codes are universal and frontend-agnostic

**Alternatives Considered**:
- Free-form color picker: Rejected - accessibility concerns, UI complexity
- Named colors (CSS): Rejected - limited palette, inconsistent across browsers
- No colors: Rejected - spec requires color-coded tags

**Color Palette**:
| Name | Hex | Use Case |
|------|-----|----------|
| Red | #EF4444 | Urgent, important |
| Orange | #F97316 | Warning, attention |
| Yellow | #EAB308 | Caution, pending |
| Green | #22C55E | Success, done |
| Blue | #3B82F6 | Information, default |
| Purple | #8B5CF6 | Creative, special |
| Pink | #EC4899 | Personal, fun |
| Gray | #6B7280 | Neutral, archive |

**Implementation**:
```python
TAG_COLORS = [
    "#EF4444", "#F97316", "#EAB308", "#22C55E",
    "#3B82F6", "#8B5CF6", "#EC4899", "#6B7280"
]

class Tag(SQLModel, table=True):
    color: str = Field(max_length=7, default="#3B82F6")  # Default: Blue
```

---

### 3. Search Implementation

**Question**: How to implement case-insensitive search across title and description?

**Decision**: PostgreSQL ILIKE with parameterized queries

**Rationale**:
- Simple and effective for MVP scale (<10k todos per user)
- No additional infrastructure (no Elasticsearch/full-text search)
- Case-insensitive by default
- SQLModel/SQLAlchemy provides safe parameterization

**Alternatives Considered**:
- Full-text search (tsvector): Rejected - overkill for MVP, adds complexity
- Elasticsearch: Rejected - requires additional infrastructure
- Application-level filtering: Rejected - inefficient, loads all data

**Implementation**:
```python
from sqlmodel import or_

def search_todos(session: Session, user_id: str, query: str) -> list[Todo]:
    search_term = f"%{query}%"
    return session.exec(
        select(Todo)
        .where(Todo.user_id == user_id)
        .where(or_(
            Todo.title.ilike(search_term),
            Todo.description.ilike(search_term)
        ))
    ).all()
```

**Performance Note**: Add index on `lower(title)` if search becomes slow.

---

### 4. Date Picker Component

**Question**: Which date picker approach for the frontend?

**Decision**: Native HTML5 `<input type="date">` with progressive enhancement

**Rationale**:
- Zero dependencies (no additional bundle size)
- Consistent with system date format preferences
- Accessible by default (screen readers, keyboard navigation)
- Mobile-optimized (native OS date pickers)
- Falls back gracefully in older browsers

**Alternatives Considered**:
- react-datepicker: Rejected - adds ~50KB, custom styling needed
- shadcn/ui Calendar: Rejected - requires additional dependencies (date-fns, etc.)
- Headless UI approach: Rejected - significant implementation effort

**Implementation**:
```tsx
// frontend/src/components/ui/DatePicker.tsx
interface DatePickerProps {
  value: string | null;
  onChange: (date: string | null) => void;
  min?: string;
  className?: string;
}

export function DatePicker({ value, onChange, min, className }: DatePickerProps) {
  return (
    <input
      type="date"
      value={value || ""}
      onChange={(e) => onChange(e.target.value || null)}
      min={min}
      className={cn("rounded-md border px-3 py-2", className)}
    />
  );
}
```

---

### 5. Filter State Persistence

**Question**: How to persist filter state during the user session?

**Decision**: URL query parameters + React state synchronization

**Rationale**:
- Shareable URLs with filters applied
- Browser back/forward navigation works
- Survives page refresh
- No additional storage mechanism needed
- Standard web pattern

**Alternatives Considered**:
- localStorage: Rejected - not shareable, persists beyond session
- sessionStorage: Rejected - not shareable via URL
- React state only: Rejected - lost on refresh

**Implementation**:
```tsx
// frontend/src/hooks/useFilters.ts
import { useSearchParams } from "next/navigation";

interface FilterState {
  search: string;
  priorities: Priority[];
  tagIds: string[];
  dueBefore: string | null;
  dueAfter: string | null;
  status: "all" | "active" | "completed";
  sortBy: "created_at" | "due_date" | "priority";
}

export function useFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filters: FilterState = {
    search: searchParams.get("search") || "",
    priorities: searchParams.getAll("priority") as Priority[],
    tagIds: searchParams.getAll("tag"),
    dueBefore: searchParams.get("due_before"),
    dueAfter: searchParams.get("due_after"),
    status: (searchParams.get("status") as FilterState["status"]) || "all",
    sortBy: (searchParams.get("sort") as FilterState["sortBy"]) || "created_at",
  };

  const setFilters = (newFilters: Partial<FilterState>) => {
    const params = new URLSearchParams();
    // ... build params from filters
    router.push(`?${params.toString()}`);
  };

  return { filters, setFilters, clearFilters };
}
```

---

### 6. Many-to-Many Tag Relationship

**Question**: How to model the todo-tag relationship in SQLModel?

**Decision**: Explicit junction table (TodoTag) with composite primary key

**Rationale**:
- Full control over the relationship
- Can add metadata later (e.g., tagged_at timestamp)
- Clear ownership model (user_id validation)
- Follows existing codebase patterns

**Alternatives Considered**:
- SQLAlchemy relationship with secondary: Rejected - less explicit, harder to extend
- JSON array of tag IDs: Rejected - no referential integrity, can't query by tag

**Implementation**:
```python
# backend/app/models/todo_tag.py
from sqlmodel import SQLModel, Field

class TodoTag(SQLModel, table=True):
    __tablename__ = "todo_tags"

    todo_id: str = Field(foreign_key="todos.id", primary_key=True)
    tag_id: str = Field(foreign_key="tags.id", primary_key=True)
```

---

### 7. Due Date Display Format

**Question**: How to display due dates in human-friendly format?

**Decision**: Relative dates for near-term, absolute for far-term

**Rationale**:
- "Today", "Tomorrow" are more scannable than dates
- Absolute dates for anything beyond 7 days
- Includes day-of-week for dates within a week
- Consistent with common todo apps (Todoist, Things, etc.)

**Format Rules**:
| Condition | Display |
|-----------|---------|
| Past (incomplete) | "Overdue" (red) |
| Today | "Today" |
| Tomorrow | "Tomorrow" |
| Within 7 days | "Wednesday" (day name) |
| This year | "Jan 15" (month day) |
| Different year | "Jan 15, 2027" |

**Implementation**:
```typescript
// frontend/src/lib/date-utils.ts
export function formatDueDate(date: string | null): string | null {
  if (!date) return null;

  const due = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return due.toLocaleDateString("en-US", { weekday: "long" });
  if (due.getFullYear() === today.getFullYear()) {
    return due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return due.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getDueDateStatus(date: string | null, completed: boolean): "overdue" | "due-soon" | "normal" | null {
  if (!date || completed) return null;

  const due = new Date(date);
  const now = new Date();
  const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0) return "overdue";
  if (diffHours <= 24) return "due-soon";
  return "normal";
}
```

---

### 8. API Query Parameter Design

**Question**: How to design filter query parameters for GET /todos?

**Decision**: Flat query parameters with array support for multi-select

**Rationale**:
- REST convention for filtering
- Easy to construct and parse
- Works with URL sharing
- Framework-agnostic

**API Design**:
```
GET /todos?search=meeting&priority=high&priority=medium&tag=abc123&tag=def456&due_before=2026-01-31&due_after=2026-01-01&status=active&sort=due_date
```

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Case-insensitive search in title/description |
| priority | string[] | Filter by priority levels (repeatable) |
| tag | string[] | Filter by tag IDs (repeatable) |
| due_before | date | Todos due on or before this date |
| due_after | date | Todos due on or after this date |
| status | enum | "all", "active", "completed" |
| sort | enum | "created_at", "due_date", "priority" |

**Implementation**:
```python
from fastapi import Query
from typing import Annotated

@router.get("/todos")
async def list_todos(
    current_user: CurrentUserDep,
    session: SessionDep,
    search: str | None = None,
    priority: Annotated[list[Priority] | None, Query()] = None,
    tag: Annotated[list[str] | None, Query()] = None,
    due_before: date | None = None,
    due_after: date | None = None,
    status: Literal["all", "active", "completed"] = "all",
    sort: Literal["created_at", "due_date", "priority"] = "created_at",
) -> list[TodoResponse]:
    ...
```

---

## Summary

All research tasks complete. No NEEDS CLARIFICATION items remain. Ready to proceed to Phase 1 design artifacts.
