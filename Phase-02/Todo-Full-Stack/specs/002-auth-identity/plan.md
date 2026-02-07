# Implementation Plan: Authentication & Identity Model

**Branch**: `002-auth-identity` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-auth-identity/spec.md`

## Summary

Implement stateless JWT-based authentication using Better Auth on the Next.js frontend with token validation on the FastAPI backend. The frontend manages user registration, sign-in, session storage, and token refresh, while the backend validates tokens using a shared secret (`BETTER_AUTH_SECRET`/`JWT_SECRET`) without managing sessions.

## Technical Context

**Language/Version**: TypeScript 5.x (Frontend), Python 3.12 (Backend)
**Primary Dependencies**: Better Auth + JWT plugin (Frontend), python-jose (Backend)
**Storage**: Neon Serverless PostgreSQL (user, session, account tables)
**Testing**: Vitest/Playwright (Frontend), Pytest (Backend)
**Target Platform**: Linux server (backend), Browser (frontend)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <5s sign-in, <50ms token validation per request
**Constraints**: Stateless backend, HS256 JWT algorithm, 15-minute token expiry
**Scale/Scope**: Single-tenant, initial user base <10k

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | Implementing from spec.md with validated tasks |
| II. Agentic Separation | PASS | Frontend auth (better-auth-engineer), Backend validation (fastapi-backend-architect), Security (security-auditor) |
| III. Security-First | PASS | JWT validation, password hashing, no credential leakage |
| IV. API Contract Stability | PASS | Contracts defined in contracts/auth-api.yaml |
| V. Stateless Auth via JWT | PASS | Better Auth issues, FastAPI validates, no session management |
| VI. Persistent Data Ownership | PASS | All sessions linked to user_id via FK |
| VII. Simplicity & Reviewability | PASS | Standard Better Auth patterns, no custom auth logic |
| VIII. Observable Resilience | PASS | Structured error responses with error codes |
| IX. Deployment & CI/CD | PASS | E2E tests planned for auth flow |

## Project Structure

### Documentation (this feature)

```text
specs/002-auth-identity/
├── spec.md              # Feature requirements (WHAT)
├── plan.md              # This file - architecture (HOW)
├── research.md          # Phase 0 - research findings
├── data-model.md        # Phase 1 - entity definitions
├── quickstart.md        # Phase 1 - developer guide
├── contracts/
│   └── auth-api.yaml    # Phase 1 - OpenAPI contract
└── tasks.md             # Phase 2 - implementation tasks (run /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── dependencies.py      # JWT validation dependency (EXISTS - update)
│   ├── config.py            # JWT_SECRET config (EXISTS - verified)
│   ├── models/
│   │   └── user.py          # User model for reference (NEW)
│   └── routers/
│       └── health.py        # Add /health/auth endpoint (UPDATE)
└── alembic/
    └── versions/
        └── xxx_auth_tables.py  # Auth table migration (NEW)

frontend/
├── src/
│   ├── lib/
│   │   ├── auth.ts          # Better Auth client (EXISTS - update)
│   │   ├── auth-server.ts   # Better Auth server (EXISTS - add JWT plugin)
│   │   └── db.ts            # Database adapter config (NEW)
│   ├── app/
│   │   ├── api/auth/[...all]/route.ts  # Auth routes (EXISTS - verified)
│   │   └── (auth)/
│   │       ├── login/page.tsx     # Login page (EXISTS - enhance)
│   │       └── register/page.tsx  # Register page (EXISTS - enhance)
│   └── services/
│       └── api.ts           # API client (EXISTS - add auth header)
└── drizzle/
    └── schema.ts            # Better Auth schema (NEW)
```

**Structure Decision**: Web application structure with separate frontend/ and backend/ directories. Frontend handles auth flows via Better Auth; backend validates tokens as a stateless service.

## Architecture Decisions

### AD-1: JWT Algorithm Selection

**Decision**: HS256 (symmetric)

**Rationale**: Trusted internal boundary between services; single administrative domain; 10x performance over asymmetric.

**Trade-off**: Cannot share public key with external services. Acceptable for current scope.

### AD-2: Token Expiration Strategy

**Decision**: 15-minute access tokens with 7-day refresh tokens

**Rationale**: Industry standard balancing security (short attack window) and UX (infrequent re-auth).

### AD-3: Database Adapter

**Decision**: Drizzle ORM adapter for Better Auth

**Rationale**: Consistent with potential frontend DB access needs; excellent TypeScript types; supports Neon PostgreSQL.

### AD-4: Session Management Location

**Decision**: Frontend-only session management

**Rationale**: Backend remains stateless per constitution; Better Auth handles session complexity; reduces backend coupling.

## Subagent Implementation Strategy

This feature uses specialized Claude subagents for implementation:

| Phase | Agent | Responsibility |
|-------|-------|----------------|
| 1 | `database-architect` | Design auth tables, create Alembic migration |
| 2 | `better-auth-engineer` | Configure JWT plugin, database adapter, definePayload |
| 3 | `fastapi-backend-architect` | Update dependencies.py with email claim support |
| 4 | `nextjs-frontend` | Enhance login/register pages, integrate API client |
| 5 | `security-auditor` | Review implementation for OWASP vulnerabilities |

### Skills to Use

```bash
# For auth configuration
/auth-better-jwt

# For database migrations
/database-sqlmodel

# For backend API updates
/fastapi-backend

# For frontend components
/nextjs-frontend

# For security review
/security-auditor
```

## Implementation Phases

### Phase 1: Database Foundation

1. Create Drizzle schema for Better Auth tables (user, session, account)
2. Generate and run migration via Better Auth CLI
3. Verify tables exist in Neon database

### Phase 2: Better Auth Configuration

1. Add JWT plugin to `auth-server.ts` with:
   - HS256 algorithm
   - 15-minute expiration
   - Custom payload (sub, email)
2. Configure Drizzle adapter with Neon connection
3. Update `auth.ts` client configuration

### Phase 3: Backend Token Validation

1. Update `TokenPayload` in dependencies.py to include `email` claim
2. Add email extraction to `CurrentUser` model
3. Create `/health/auth` endpoint for validation testing
4. Add clock skew tolerance (30 seconds)

### Phase 4: Frontend Integration

1. Update `api.ts` to include Authorization header from session
2. Enhance login page with error handling
3. Enhance register page with password requirements display
4. Add loading states and form validation

### Phase 5: Security Validation

1. Run security-auditor on auth implementation
2. Verify no credential leakage in error messages
3. Test token tampering detection
4. Verify HTTPS enforcement in production config

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Secret mismatch frontend/backend | Medium | High | Environment validation on startup |
| Token expiration too aggressive | Low | Medium | Monitor user session complaints |
| Clock skew causing validation failures | Low | Medium | 30s tolerance in backend |

## Complexity Tracking

No constitution violations requiring justification. Implementation follows standard patterns.

## Generated Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Research | `specs/002-auth-identity/research.md` | Complete |
| Data Model | `specs/002-auth-identity/data-model.md` | Complete |
| API Contract | `specs/002-auth-identity/contracts/auth-api.yaml` | Complete |
| Quickstart | `specs/002-auth-identity/quickstart.md` | Complete |

## Next Steps

Run `/sp.tasks` to generate implementation tasks with test cases.
