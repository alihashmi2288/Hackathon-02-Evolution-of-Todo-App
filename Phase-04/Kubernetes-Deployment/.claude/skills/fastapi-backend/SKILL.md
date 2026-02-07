---
name: fastapi-backend
description: Senior FastAPI backend development. Use for creating API endpoints, implementing business logic, handling request validation, and orchestrating the backend service in the Todo app.
---

# FastAPI Backend Skill

## Stack
- Python 3.10+
- FastAPI
- Pydantic v2
- SQLModel

## Core Patterns
- **Routes**: Organize by feature in `backend/routes/`.
- **Dependency Injection**: Use `Depends()` for database sessions and auth.
- **Models**: Use SQLModel for unified ORM and Pydantic schemas.
- **Error Handling**: Use `fastapi.HTTPException` with clear status codes and messages.

## Guidelines
- All routes should be prefixed with `/api`.
- Use async/await for all IO-bound operations (DB, external APIs).
- Follow PEP 8 style guide.
- Ensure all endpoints have proper Pydantic `response_model` definitions.
