# Research: Project Initialization & Architecture Setup

**Feature Branch**: `001-project-init-architecture`
**Date**: 2026-01-15
**Status**: Complete

## Research Summary

This document consolidates research findings for the foundational architecture of the Todo Full-Stack application.

---

## 1. Project Structure Decisions

### Decision: Monorepo with Separate Frontend/Backend Directories

**Rationale**:
- Aligns with spec requirements FR-001, FR-002, FR-003
- Enables independent development and deployment (SC-006)
- Standard pattern for full-stack applications with separate technology stacks

**Structure Selected**:
```
/
├── frontend/          # Next.js 16.0.10 application
├── backend/           # FastAPI application
├── specs/             # Spec-Kit Plus specifications
├── history/           # PHRs and ADRs
├── .specify/          # Spec-Kit configuration
├── CLAUDE.md          # AI assistant instructions
├── AGENTS.md          # Agent behaviors
└── .env.example       # Environment template
```

**Alternatives Considered**:
- Monolith with shared directories: Rejected - violates layer separation principle
- Separate repositories: Rejected - complicates shared configuration and coordination

---

## 2. Next.js Frontend Structure

### Decision: App Router with src/ Directory Organization

**Rationale**:
- Next.js 16.0.10 uses App Router as default (stable since Next.js 13.4)
- `src/` directory separates application code from configuration files
- Follows Next.js official documentation recommendations

**Structure**:
```
frontend/
├── src/
│   ├── app/                    # App Router pages and layouts
│   │   ├── layout.tsx          # Root layout (required)
│   │   ├── page.tsx            # Home page
│   │   ├── (auth)/             # Auth route group
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── api/
│   │       └── auth/
│   │           └── [...all]/   # Better Auth handler
│   ├── components/             # Shared React components
│   ├── lib/                    # Utility functions, auth client
│   └── services/               # API communication layer
├── public/                     # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

**Key Patterns**:
- Route groups `(groupname)/` for logical organization without URL impact
- `layout.tsx` in each route for nested layouts
- `page.tsx` defines the actual page content
- Catch-all routes `[...slug]` for dynamic routing

**Source**: [Next.js Documentation - App Router](https://github.com/vercel/next.js/blob/canary/docs/01-app/01-getting-started/01-installation.mdx)

---

## 3. FastAPI Backend Structure

### Decision: Modular Router-Based Organization

**Rationale**:
- Follows FastAPI official "Bigger Applications" pattern
- Enables separation of concerns (routers, services, models)
- Supports dependency injection for database sessions

**Structure**:
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Environment configuration
│   ├── database.py             # SQLModel engine and session
│   ├── dependencies.py         # Shared dependencies (auth, etc.)
│   ├── models/
│   │   ├── __init__.py
│   │   └── todo.py             # SQLModel models
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py           # Health check endpoints
│   │   └── todos.py            # Todo CRUD endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   └── todo_service.py     # Business logic
│   └── schemas/
│       ├── __init__.py
│       └── todo.py             # Pydantic request/response schemas
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # Pytest fixtures
│   └── test_todos.py
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
├── alembic.ini
├── requirements.txt
└── pyproject.toml
```

**Key Patterns**:
- `routers/` contains APIRouter instances grouped by domain
- `services/` contains business logic, separate from HTTP layer
- `models/` contains SQLModel table definitions
- `schemas/` contains Pydantic models for API validation
- Dependency injection via `Depends()` for session management

**Source**: [FastAPI Documentation - Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications)

---

## 4. SQLModel and Database Configuration

### Decision: SQLModel with Neon PostgreSQL via Connection String

**Rationale**:
- SQLModel combines SQLAlchemy ORM with Pydantic validation
- Single model definition serves both database and API needs
- Neon provides serverless PostgreSQL with connection pooling

**Connection Pattern**:
```python
# Connection string from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# For Neon, use SSL mode
engine = create_engine(
    DATABASE_URL,
    echo=True,  # SQL logging in dev
    pool_pre_ping=True  # Connection health check
)
```

**Session Management**:
```python
def get_session():
    with Session(engine) as session:
        yield session
```

**Migration Strategy**:
- Use Alembic for database migrations
- Migrations stored in `backend/alembic/versions/`
- Never use `SQLModel.metadata.create_all()` in production

**Alternatives Considered**:
- Raw SQLAlchemy: Rejected - SQLModel provides better FastAPI integration
- Prisma: Rejected - Python ecosystem prefers SQLAlchemy-based tools

---

## 5. Better Auth Integration

### Decision: Better Auth with JWT Plugin for Cross-Service Authentication

**Rationale**:
- Constitution mandates JWT-based stateless authentication (Principle V)
- Better Auth provides TypeScript-first auth with JWT support
- Frontend handles auth UI, backend verifies JWT tokens

**Frontend Setup**:
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    jwt({
      algorithm: "HS256",
      expiresIn: "7d",
      issuer: "https://your-domain.com",
      audience: ["https://api.your-domain.com"],
    }),
  ],
});
```

**API Route Handler**:
```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

**Server-Side Session Validation**:
```typescript
// In server components
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(),
});
```

**Backend JWT Verification**:
- FastAPI middleware verifies JWT signature
- Extract `user_id` from token for data ownership
- No session storage on backend (stateless)

**Alternatives Considered**:
- NextAuth.js: Rejected - Better Auth has simpler JWT integration
- Auth0/Clerk: Rejected - external service adds complexity and cost
- Custom JWT: Rejected - Better Auth provides tested implementation

---

## 6. Environment Variable Strategy

### Decision: Layered Environment Configuration with Templates

**Rationale**:
- Security requirement: no hardcoded secrets (FR-007, SC-002)
- Clear separation between frontend public and private vars
- Environment templates for developer onboarding

**Variable Categories**:

| Category | Prefix | Example | Location |
|----------|--------|---------|----------|
| Frontend Public | `NEXT_PUBLIC_` | `NEXT_PUBLIC_API_URL` | Exposed to browser |
| Frontend Private | - | `BETTER_AUTH_SECRET` | Server-only |
| Backend | - | `DATABASE_URL` | Backend only |
| Database | `DATABASE_` | `DATABASE_URL` | Backend only |
| Auth | `AUTH_` or `BETTER_AUTH_` | `BETTER_AUTH_SECRET` | Both layers |

**File Structure**:
```
/.env.example          # Template with all variables (no secrets)
/.env                   # Local development (git-ignored)
/frontend/.env.local    # Frontend-specific overrides (optional)
/backend/.env           # Backend-specific (optional)
```

**Required Variables** (documented in .env.example):
```bash
# Database (Backend)
DATABASE_URL=postgresql://...

# Auth (Shared)
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Validation Strategy**:
- Backend: Pydantic Settings class validates on startup
- Frontend: Next.js build fails on missing required vars
- Both: Clear error messages for missing configuration (SC-005)

---

## 7. Layer Responsibility Matrix

### Decision: Clear Boundary Definition

| Concern | Frontend | Backend | Notes |
|---------|----------|---------|-------|
| UI Rendering | Yes | No | React Server Components |
| Client State | Yes | No | React hooks, context |
| Form Validation | Yes | Yes | Client-side for UX, server-side for security |
| API Communication | Yes | No | Fetch to backend API |
| Business Logic | No | Yes | All domain rules |
| Data Persistence | No | Yes | SQLModel operations |
| Auth UI | Yes | No | Better Auth components |
| Auth Session | Yes | Yes | Frontend creates, backend verifies |
| JWT Verification | No | Yes | Backend validates all requests |
| Direct DB Access | No | Yes | Frontend never touches DB |

**API Contract Enforcement**:
- Backend exposes OpenAPI schema
- Frontend consumes typed API client
- Contract changes require spec amendment (Constitution Principle IV)

---

## 8. Development Workflow Integration

### Decision: Spec-Kit Plus with Claude Code

**Workflow**:
1. `/sp.specify` - Create feature specification
2. `/sp.plan` - Generate implementation plan
3. `/sp.tasks` - Break into atomic tasks
4. Implementation with task ID references
5. Security audit post-implementation
6. PHR creation for traceability

**Agent Responsibilities** (from AGENTS.md):
- Each agent has exclusive responsibility
- Backend, Frontend, Auth, Security agents operate in isolation
- All changes reference Task IDs

**Source**: Constitution Principle I (Spec-Driven Development)

---

## Unresolved Items

None - all technical decisions have been made based on:
- Project constitution requirements
- Spec functional requirements
- Industry best practices from official documentation

---

## References

1. [Next.js App Router Documentation](https://nextjs.org/docs/app)
2. [FastAPI Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications)
3. [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
4. [Better Auth Documentation](https://www.better-auth.com/)
5. [Neon PostgreSQL Documentation](https://neon.tech/docs)
