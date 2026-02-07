# Backend CLAUDE.md

## Overview
FastAPI backend for the Todo Full-Stack application with SQLModel ORM.

## Tech Stack
- **Framework**: FastAPI 0.100+
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: Neon Serverless PostgreSQL
- **Migrations**: Alembic
- **AI Model**: **Google Gemini 2.5 Flash** (via `openai-agents` adapter)
- **Agent Protocol**: Model Context Protocol (MCP) using `fastmcp`
- **Authentication**: JWT verification (tokens from Better Auth)

## Directory Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Pydantic Settings for env vars
│   ├── database.py          # SQLModel engine and session
│   ├── agent.py             # Gemini model config + agent instructions
│   ├── mcp_server.py        # Plain tool functions (no decorators)
│   ├── dependencies.py      # FastAPI dependencies (auth, db)
│   ├── models/              # SQLModel database models
│   │   ├── __init__.py
│   │   └── base.py          # Base model with user_id
│   ├── routers/             # API route handlers
│   │   ├── chat.py          # Chat endpoint with user-scoped agents
│   │   ├── __init__.py
│   │   └── health.py        # Health check endpoints
│   ├── schemas/             # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   └── error.py         # Error response schemas
│   └── services/            # Business logic layer
│       └── __init__.py
├── alembic/                 # Database migrations
│   ├── versions/            # Migration files
│   └── env.py               # Alembic configuration
├── tests/                   # Test files
│   └── conftest.py          # Pytest fixtures
├── pyproject.toml           # Python project config
└── requirements.txt         # Dependencies
```

## Commands
```bash
# Development
uvicorn app.main:app --reload --port 8000

# Database migrations
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1

# Testing
pytest
pytest -v --cov=app

# Dependencies
pip install -r requirements.txt
```

## Environment Variables
Required in `.env`:
```
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=same-secret-as-better-auth
ENVIRONMENT=development
```

## API Endpoints

### Health
- `GET /health` - Basic liveness check
- `GET /health/ready` - Readiness with DB/config checks

### Chat (Phase 3 — 007-ai-todo-chatbot)
- `POST /api/chat` - Send message to AI agent (JWT auth, user from token)
- `GET /api/chat/history` - Get conversation history (JWT auth)

### Todos
- `GET /todos` - List user's todos
- `POST /todos` - Create todo
- `GET /todos/{id}` - Get specific todo
- `PATCH /todos/{id}` - Update todo
- `DELETE /todos/{id}` - Delete todo

## Authentication
Backend verifies JWT tokens from Better Auth:
```python
from app.dependencies import get_current_user

@router.get("/protected")
async def protected_route(user: User = Depends(get_current_user)):
    return {"user_id": user.id}
```

## Layer Responsibilities
1. **Routers** (`routers/`): HTTP handling, request validation
2. **Services** (`services/`): Business logic, orchestration
3. **Models** (`models/`): Database entities, SQLModel definitions
4. **Schemas** (`schemas/`): API request/response contracts

## Error Handling
Use standardized error responses per `contracts/error-taxonomy.yaml`:
```python
from app.schemas.error import ErrorResponse

raise HTTPException(
    status_code=404,
    detail=ErrorResponse(
        error="RESOURCE_NOT_FOUND",
        message="Todo not found",
        timestamp=datetime.utcnow().isoformat()
    ).model_dump()
)
```

## Testing
```bash
# Run all tests
pytest

# With coverage
pytest --cov=app --cov-report=html
```
