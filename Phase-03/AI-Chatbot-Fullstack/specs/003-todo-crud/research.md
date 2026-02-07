# Research: Todo CRUD Operations

**Feature**: 003-todo-crud
**Date**: 2026-01-17
**Status**: Complete

## Research Questions

### 1. ID Generation Strategy

**Decision**: Use `nanoid` for generating unique todo IDs

**Rationale**:
- Matches Better Auth's text-based ID format for consistency
- URL-safe characters (no encoding needed in REST endpoints)
- Shorter than UUID while maintaining uniqueness (21 chars default)
- Good collision resistance (1% collision after 149 billion IDs at 1000 IDs/hour)

**Alternatives Considered**:
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| UUID v4 | Standard, widely supported | 36 chars, hyphens in URLs | Rejected |
| Auto-increment | Simple, sequential | Predictable, security risk | Rejected |
| CUID2 | Secure, sortable | Larger library | Considered |
| nanoid | Fast, small, URL-safe | Not sortable | **Selected** |

**Implementation**: Use `nanoid` Python package with default 21-character length.

---

### 2. Todo Model Schema

**Decision**: Extend `UserOwnedMixin` from base.py

**Rationale**:
- Reuses existing pattern from SPEC-001
- Automatically includes `user_id` field with index
- Follows Constitution Principle VI (Data Ownership)

**Fields Defined** (per spec):
```
id: str (primary key, nanoid)
title: str (required, max 255)
description: str | None (optional)
completed: bool (default False)
user_id: str (from JWT, indexed)
created_at: datetime (auto)
updated_at: datetime (auto)
```

---

### 3. Timestamp Management

**Decision**: Use SQLModel's `default_factory` with timezone-aware UTC datetimes

**Rationale**:
- Consistent with existing base.py TimestampMixin
- Always store UTC, convert on display
- Use `sa_column_kwargs` for automatic `updated_at` on modification

**Implementation**:
```python
from datetime import datetime, timezone

created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
updated_at: datetime = Field(
    default_factory=lambda: datetime.now(timezone.utc),
    sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)}
)
```

---

### 4. Error Response Format

**Decision**: Follow existing error taxonomy from SPEC-001

**Rationale**:
- Consistency across API endpoints
- Already implemented in `backend/app/schemas/error.py`
- Matches Constitution Principle VIII (Observable Resilience)

**Error Codes for Todos**:
| HTTP Status | Error Code | When |
|-------------|------------|------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 401 | AUTHENTICATION_REQUIRED | Missing/invalid JWT |
| 404 | RESOURCE_NOT_FOUND | Todo doesn't exist OR not owned |
| 500 | INTERNAL_ERROR | Unexpected server error |

---

### 5. Query Pattern for Owner Filtering

**Decision**: Always include `user_id` in WHERE clause

**Rationale**:
- Constitution Principle VI requires filtering by authenticated subject
- Returns 404 (not 403) when user doesn't own resource
- Prevents information disclosure about other users' todos

**Pattern**:
```python
# Get single todo
statement = select(Todo).where(
    Todo.id == todo_id,
    Todo.user_id == current_user.id
)
todo = session.exec(statement).first()
if not todo:
    raise HTTPException(status_code=404, detail="Todo not found")
```

---

### 6. Service Layer Pattern

**Decision**: Implement thin service layer for business logic

**Rationale**:
- Separation of concerns per Constitution Principle II
- Testable business logic independent of HTTP layer
- Keeps routers focused on HTTP concerns only

**Service Methods**:
- `create_todo(session, user_id, data) -> Todo`
- `get_todos(session, user_id) -> list[Todo]`
- `get_todo(session, user_id, todo_id) -> Todo | None`
- `update_todo(session, user_id, todo_id, data) -> Todo | None`
- `delete_todo(session, user_id, todo_id) -> bool`

---

## Dependencies to Add

| Package | Version | Purpose |
|---------|---------|---------|
| nanoid | ^2.0.0 | ID generation |

**Note**: All other dependencies (FastAPI, SQLModel, etc.) already installed.

## References

- [nanoid Python package](https://github.com/puyuan/py-nanoid)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [FastAPI Best Practices](https://fastapi.tiangolo.com/tutorial/)
- SPEC-001: Project Init Architecture
- SPEC-002: Auth & Identity Model
