---
name: database-sqlmodel
description: Expert Database Architect for SQLModel and Neon PostgreSQL. Use for designing schemas, managing migrations with Alembic, and optimizing queries for the Todo app.
---

# Database & SQLModel Skill

## Stack
- Neon PostgreSQL (Serverless)
- SQLModel
- Alembic (Migrations)
- SQLAlchemy (Underlying engine)

## Core Patterns
- **Models**: Defined in `backend/models.py`. Inherit from `SQLModel, table=True`.
- **Relationships**: Use `Relationship()` for foreign key associations.
- **Sessions**: Use `Session(engine)` via a dependency generator.
- **Migrations**: Always generate migrations for schema changes: `alembic revision --autogenerate`.

## Guidelines
- Use UUIDs for primary keys where appropriate for security.
- Ensure indexes are added for frequently queried columns.
- Follow "Scale-Forward" patterns: additive changes only when possible.
- Never hardcode `DATABASE_URL`; use environment variables.
