# Implementation Plan: Project Initialization & Architecture Setup

**Branch**: `001-project-init-architecture` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-project-init-architecture/spec.md`

## Summary

Establish the foundational architecture for a full-stack Todo web application using Next.js 16.0.10 (App Router) for the frontend, FastAPI for the backend, SQLModel ORM, Neon Serverless PostgreSQL for data persistence, and Better Auth for JWT-based authentication. This plan defines project structure, environment configuration strategy, layer responsibilities, and the spec-driven development workflow.

## Technical Context

**Language/Version**: Python 3.10+ (Backend), TypeScript 5.x (Frontend)
**Primary Dependencies**: FastAPI 0.100+, Next.js 16.0.10 (exact version), SQLModel, Better Auth
**Storage**: Neon Serverless PostgreSQL
**Testing**: Pytest (Backend), Vitest/Playwright (Frontend)
**Target Platform**: Web (server-rendered frontend, REST API backend)
**Project Type**: Web application (frontend + backend monorepo)
**Performance Goals**: < 200ms API response time (p95)
**Constraints**: Stateless JWT authentication, no direct frontend-to-database access
**Scale/Scope**: Single-user development, foundation for multi-tenant expansion

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | This plan follows spec -> plan -> tasks workflow |
| II. Agentic Separation | PASS | Frontend, Backend, Auth agents defined with clear boundaries |
| III. Security-First | PASS | JWT verification on backend, no direct DB access from frontend |
| IV. API Contract Stability | PASS | OpenAPI contracts defined in `/contracts/` |
| V. Stateless JWT Auth | PASS | Better Auth with JWT plugin, backend verification |
| VI. Persistent Data Ownership | PASS | All data linked to user_id via SQLModel |
| VII. Simplicity & Reviewability | PASS | Standard project structure, no unnecessary abstractions |
| VIII. Observable Resilience | PASS | Error taxonomy defined, structured logging required |
| IX. Deployment & CI/CD | DEFERRED | Out of scope for this foundational spec |

**Gate Result**: PASS - All applicable principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-init-architecture/
├── plan.md              # This file
├── research.md          # Phase 0 output - technology research
├── data-model.md        # Phase 1 output - entity definitions
├── quickstart.md        # Phase 1 output - developer guide
├── contracts/           # Phase 1 output - API contracts
│   ├── health.yaml      # Health check endpoints
│   └── error-taxonomy.yaml # Standardized error responses
└── tasks.md             # Phase 2 output (created by /sp.tasks)
```

### Source Code (repository root)

```text
/
├── frontend/                          # Next.js 16.0.10 application
│   ├── src/
│   │   ├── app/                       # App Router pages and layouts
│   │   │   ├── layout.tsx             # Root layout (required)
│   │   │   ├── page.tsx               # Home page
│   │   │   ├── (auth)/                # Auth route group
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── register/
│   │   │   │       └── page.tsx
│   │   │   └── api/
│   │   │       └── auth/
│   │   │           └── [...all]/      # Better Auth handler
│   │   │               └── route.ts
│   │   ├── components/                # Shared React components
│   │   │   └── ui/                    # UI primitives
│   │   ├── lib/                       # Utilities, auth client
│   │   │   └── auth.ts                # Better Auth configuration
│   │   └── services/                  # API communication layer
│   │       └── api.ts                 # Backend API client
│   ├── public/                        # Static assets
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── CLAUDE.md                      # Frontend-specific instructions
│
├── backend/                           # FastAPI application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app entry point
│   │   ├── config.py                  # Pydantic Settings
│   │   ├── database.py                # SQLModel engine and session
│   │   ├── dependencies.py            # Shared dependencies (auth, etc.)
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── base.py                # Base model with user_id
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   └── health.py              # Health check endpoints
│   │   ├── services/
│   │   │   └── __init__.py
│   │   └── schemas/
│   │       ├── __init__.py
│   │       └── error.py               # Error response schemas
│   ├── tests/
│   │   ├── __init__.py
│   │   └── conftest.py                # Pytest fixtures
│   ├── alembic/                       # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── CLAUDE.md                      # Backend-specific instructions
│
├── specs/                             # Feature specifications
│   └── 001-project-init-architecture/
│
├── history/                           # Development history
│   ├── prompts/                       # PHRs organized by feature
│   │   ├── constitution/
│   │   ├── 001-project-init-architecture/
│   │   └── general/
│   └── adr/                           # Architecture Decision Records
│
├── .specify/                          # Spec-Kit configuration
│   ├── memory/
│   │   └── constitution.md
│   ├── templates/
│   └── scripts/
│
├── .env.example                       # Environment template
├── .env                               # Local config (git-ignored)
├── .gitignore
├── CLAUDE.md                          # Root AI instructions
└── AGENTS.md                          # Agent behaviors
```

**Structure Decision**: Web application pattern with monorepo structure. Frontend and backend are independently deployable. Specs follow folder-per-feature pattern as defined in CLAUDE.md.

## Complexity Tracking

> No constitution violations requiring justification. All principles are satisfied with standard patterns.

| Area | Complexity Level | Justification |
|------|-----------------|---------------|
| Project Structure | Standard | Follows FastAPI and Next.js official patterns |
| Authentication | Standard | Better Auth with JWT - no custom implementation |
| Database | Standard | SQLModel with Alembic migrations |
| Environment Config | Standard | .env files with validation |

## Key Architectural Decisions

### 1. Monorepo vs Separate Repositories

**Decision**: Monorepo with `/frontend` and `/backend` directories

**Rationale**:
- Shared environment configuration
- Coordinated spec-driven development
- Single source of truth for specifications
- Simplified local development

**Trade-offs**:
- Larger repository size
- Requires discipline to maintain layer separation

### 2. Authentication Strategy

**Decision**: Better Auth (frontend) + JWT verification (backend)

**Rationale**:
- Better Auth handles session management and OAuth flows
- JWT tokens enable stateless backend authentication
- Constitution Principle V mandates stateless auth
- Clean separation: frontend creates sessions, backend verifies tokens

**Flow**:
```
User -> Frontend -> Better Auth -> JWT Token
             |
             v
          Backend <- Verify JWT <- Extract user_id
```

### 3. Database Migration Strategy

**Decision**: Alembic for migrations, never use `create_all()` in production

**Rationale**:
- Alembic provides version-controlled migrations
- Supports rollback capabilities
- Required for production database management

### 4. Environment Variable Organization

**Decision**: Single root `.env` with layer-specific prefixes

**Rationale**:
- Simplifies local development (one file to configure)
- Clear ownership via prefixes (NEXT_PUBLIC_, DATABASE_, etc.)
- `.env.example` documents all required variables

## Phase 0 Artifacts

- [x] [research.md](./research.md) - Technology research and decisions

## Phase 1 Artifacts

- [x] [data-model.md](./data-model.md) - Configuration entities
- [x] [contracts/health.yaml](./contracts/health.yaml) - Health check API
- [x] [contracts/error-taxonomy.yaml](./contracts/error-taxonomy.yaml) - Error responses
- [x] [quickstart.md](./quickstart.md) - Developer setup guide

## Implementation Phases

### Phase 1: Project Scaffolding
- Create directory structure
- Initialize frontend (Next.js 16.0.10)
- Initialize backend (FastAPI)
- Create environment templates

### Phase 2: Configuration Layer
- Implement backend settings (Pydantic)
- Configure frontend environment
- Create validation for required variables

### Phase 3: Database Foundation
- Configure SQLModel with Neon connection
- Set up Alembic for migrations
- Create base model with user_id support

### Phase 4: Authentication Integration
- Configure Better Auth on frontend
- Implement JWT verification middleware on backend
- Create auth dependency for protected routes

### Phase 5: Health and Observability
- Implement health check endpoints
- Add structured logging
- Implement error taxonomy

### Phase 6: Documentation and Validation
- Update CLAUDE.md files
- Verify 15-minute onboarding target
- Run security audit

## Success Criteria Mapping

| Spec Success Criteria | Implementation Task |
|----------------------|---------------------|
| SC-001: 15-min onboarding | quickstart.md, environment templates |
| SC-002: No hardcoded secrets | .env.example, Pydantic Settings |
| SC-003: 95% layer identification | Layer docs in data-model.md |
| SC-004: Spec-driven workflow | CLAUDE.md, AGENTS.md |
| SC-005: Clear error messages | Error taxonomy, config validation |
| SC-006: Independent deployment | Separate frontend/backend dirs |

## Next Steps

Run `/sp.tasks` to generate atomic implementation tasks from this plan.

## References

- [research.md](./research.md) - Detailed technology research
- [Constitution](./../../../.specify/memory/constitution.md) - Project principles
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [FastAPI Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications)
- [SQLModel Docs](https://sqlmodel.tiangolo.com/)
- [Better Auth Docs](https://www.better-auth.com/)
