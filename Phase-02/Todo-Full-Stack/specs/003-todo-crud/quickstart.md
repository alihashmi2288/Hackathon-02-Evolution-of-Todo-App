# Quickstart: Todo CRUD Operations

**Feature**: 003-todo-crud
**Date**: 2026-01-17

## Prerequisites

Before implementing this feature, ensure you have:

1. ✅ SPEC-001 (Project Init) completed - FastAPI backend running
2. ✅ SPEC-002 (Auth & Identity) completed - JWT authentication working
3. ✅ Database connection configured (Neon PostgreSQL)
4. ✅ Development environment set up

## Quick Setup

### 1. Install Additional Dependency

```bash
cd backend
pip install nanoid
# or add to requirements.txt: nanoid>=2.0.0
```

### 2. Create the Todo Model

Create `backend/app/models/todo.py`:

```python
from datetime import datetime, timezone
from typing import Optional

from nanoid import generate
from sqlmodel import Field, SQLModel


def generate_todo_id() -> str:
    return generate(size=21)


class Todo(SQLModel, table=True):
    __tablename__ = "todos"

    id: str = Field(default_factory=generate_todo_id, primary_key=True)
    title: str = Field(..., max_length=255)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False)
    user_id: str = Field(..., index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
```

### 3. Run Database Migration

```bash
cd backend
alembic revision --autogenerate -m "add todos table"
alembic upgrade head
```

### 4. Create Todo Router

Create `backend/app/routers/todos.py` with CRUD endpoints (see contracts/todo-api.yaml for full spec).

### 5. Register Router

In `backend/app/main.py`:

```python
from app.routers import todos

app.include_router(todos.router)
```

## API Usage Examples

### Authentication Header

All requests require JWT token:

```
Authorization: Bearer <your-jwt-token>
```

### Create Todo

```bash
curl -X POST http://localhost:8000/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'
```

Response (201 Created):
```json
{
  "id": "V1StGXR8_Z5jdHi6B-myT",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "user_id": "user_abc123",
  "created_at": "2026-01-17T10:30:00Z",
  "updated_at": "2026-01-17T10:30:00Z"
}
```

### List Todos

```bash
curl http://localhost:8000/todos \
  -H "Authorization: Bearer $TOKEN"
```

Response (200 OK):
```json
[
  {
    "id": "V1StGXR8_Z5jdHi6B-myT",
    "title": "Buy groceries",
    "completed": false,
    ...
  }
]
```

### Get Single Todo

```bash
curl http://localhost:8000/todos/V1StGXR8_Z5jdHi6B-myT \
  -H "Authorization: Bearer $TOKEN"
```

### Update Todo

```bash
curl -X PATCH http://localhost:8000/todos/V1StGXR8_Z5jdHi6B-myT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Delete Todo

```bash
curl -X DELETE http://localhost:8000/todos/V1StGXR8_Z5jdHi6B-myT \
  -H "Authorization: Bearer $TOKEN"
```

Response: 204 No Content

## Error Handling

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input (missing title, too long, etc.) |
| 401 | AUTHENTICATION_REQUIRED | Missing or invalid JWT token |
| 404 | RESOURCE_NOT_FOUND | Todo not found or not owned by user |

## Testing

### Run Tests

```bash
cd backend
pytest tests/test_todos.py -v
```

### Manual Testing with Swagger UI

1. Start the backend: `uvicorn app.main:app --reload`
2. Open http://localhost:8000/docs
3. Click "Authorize" and enter your JWT token
4. Test each endpoint interactively

## Troubleshooting

### "401 Unauthorized" on all requests
- Ensure JWT token is valid and not expired
- Check that BETTER_AUTH_SECRET matches between frontend and backend

### "404 Not Found" when todo exists
- Verify you're using the correct user's JWT token
- Todo may belong to a different user (owner-only access)

### Migration fails
- Ensure DATABASE_URL is set correctly
- Check that Neon database is accessible
- Review alembic.ini for correct connection string

## Next Steps

After implementing Todo CRUD:

1. Run `/sp.tasks` to generate implementation tasks
2. Implement each task following the plan
3. Run security audit with `security-auditor`
4. Add frontend UI (separate spec)
