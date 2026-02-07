# Implementation Plan: Todo CRUD Operations

**Branch**: `003-todo-crud` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-todo-crud/spec.md`

## Summary

Implement RESTful CRUD API endpoints for a multi-user Todo application. The backend will use FastAPI with SQLModel ORM to manage Todo entities in Neon PostgreSQL. All endpoints require JWT authentication (already implemented in SPEC-002), with strict owner-only access enforced through user_id filtering from JWT claims.

## Technical Context

**Language/Version**: Python 3.12 (Backend), TypeScript 5.x (Frontend - future)
**Primary Dependencies**: FastAPI 0.100+, SQLModel, python-jose (JWT validation)
**Storage**: Neon Serverless PostgreSQL via SQLModel ORM
**Testing**: Pytest (Backend API tests)
**Target Platform**: Linux server (Docker container)
**Project Type**: Web application (backend API focus for this spec)
**Performance Goals**: <500ms response time for all CRUD operations
**Constraints**: <500ms p95 latency, stateless JWT auth, owner-only data access
**Scale/Scope**: Support up to 100 todos per user without pagination

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | ✅ PASS | spec.md complete with 21 FRs, 5 user stories |
| II. Agentic Separation | ✅ PASS | Backend-only implementation, clear boundaries |
| III. Security-First | ✅ PASS | JWT required on all endpoints, 404 for unauthorized access |
| IV. API Contract Stability | ✅ PASS | OpenAPI contract defined in contracts/ |
| V. Stateless Auth | ✅ PASS | JWT token validation, no session state |
| VI. Data Ownership | ✅ PASS | user_id required on Todo, queries filtered by owner |
| VII. Simplicity | ✅ PASS | Standard CRUD pattern, no unnecessary abstractions |
| VIII. Observable Resilience | ✅ PASS | Structured logging, standardized error taxonomy |
| IX. CI/CD Integrity | ✅ PASS | 24 API tests passing in test_todos.py |

## Project Structure

### Documentation (this feature)

```text
specs/003-todo-crud/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output - technology decisions
├── data-model.md        # Phase 1 output - Todo entity definition
├── quickstart.md        # Phase 1 output - developer guide
├── contracts/           # Phase 1 output - OpenAPI spec
│   └── todo-api.yaml    # REST API contract
├── checklists/          # Validation checklists
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── models/
│   │   ├── __init__.py      # Model exports
│   │   ├── base.py          # Base model with user_id (exists)
│   │   └── todo.py          # NEW: Todo SQLModel entity
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py        # Health endpoints (exists)
│   │   ├── auth.py          # Auth health endpoint (exists)
│   │   ├── me.py            # User info endpoint (exists)
│   │   └── todos.py         # NEW: Todo CRUD endpoints
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── error.py         # Error schemas (exists)
│   │   └── todo.py          # NEW: Todo request/response schemas
│   ├── services/
│   │   ├── __init__.py
│   │   └── todo.py          # NEW: Todo business logic
│   ├── dependencies.py      # Auth dependencies (exists)
│   ├── database.py          # DB connection (exists)
│   └── main.py              # FastAPI app (exists, add router)
└── tests/
    └── test_todos.py        # NEW: Todo API tests
```

**Structure Decision**: Web application backend-only structure. Extends existing FastAPI backend with new Todo module following established patterns from auth implementation.

## Complexity Tracking

> No constitution violations - standard CRUD implementation

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| ID Generation | Text (nanoid/cuid) | Matches Better Auth ID format, user consistency |
| Soft Delete | Not implemented | YAGNI - hard delete per spec, add later if needed |
| Pagination | Not implemented | Out of scope per spec, <100 todos expected |

## Implementation Architecture

### Layer Responsibilities

```
┌─────────────────────────────────────────────────────────────┐
│                     HTTP Layer (Routers)                     │
│  - Request validation (Pydantic schemas)                     │
│  - Authentication (JWT dependency)                           │
│  - Response formatting                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer (Services)                   │
│  - Business logic                                            │
│  - Owner validation                                          │
│  - Timestamp management                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer (Models)                        │
│  - SQLModel entities                                         │
│  - Database queries                                          │
│  - Data persistence                                          │
└─────────────────────────────────────────────────────────────┘
```

### Security Model

```
Request → JWT Validation → User Extraction → Owner Check → Database Query
                │                 │               │
                ▼                 ▼               ▼
         401 if invalid    CurrentUser      404 if not owner
                          (id, email)       (not 403!)
```

## Subagent Strategy

| Phase | Agent | Responsibility |
|-------|-------|----------------|
| Model Creation | `database-architect` | Todo SQLModel entity, migrations |
| API Endpoints | `fastapi-backend-architect` | Router, schemas, service layer |
| Security Review | `security-auditor` | OWASP check, owner validation |
| Testing | `test-automator` | Pytest API tests |

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ID collision | Low | Medium | Use nanoid with sufficient entropy |
| Race condition on update | Low | Low | Database-level optimistic locking if needed |
| N+1 queries on list | Medium | Low | Use SQLModel relationships, eager loading |

## Definition of Done

- [x] Todo model created with all fields per spec
- [x] All 5 CRUD endpoints implemented and tested
- [x] JWT authentication enforced on all endpoints
- [x] Owner-only access validated (404 for unauthorized)
- [x] OpenAPI spec matches implementation
- [x] All tests passing (24/24)
- [x] Security audit completed
