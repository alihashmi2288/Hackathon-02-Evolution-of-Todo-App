# Tasks: Project Initialization & Architecture Setup

**Input**: Design documents from `/specs/001-project-init-architecture/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested - tests are minimal for this foundational architecture spec.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

**IMPORTANT**: This project uses **Next.js 16.0.10** exactly. All frontend initialization and configuration must use this specific version.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` for FastAPI, `frontend/` for Next.js 16.0.10
- Root level for shared configuration (.env, CLAUDE.md, AGENTS.md)

## Technology Versions (CRITICAL)

| Component | Version | Notes |
|-----------|---------|-------|
| **Next.js** | **16.0.10** | Exact version required - do not upgrade/downgrade |
| TypeScript | 5.x | Latest 5.x compatible with Next.js 16.0.10 |
| Python | 3.10+ | Minimum version |
| FastAPI | 0.100+ | Latest stable |
| SQLModel | Latest | Compatible with FastAPI |
| Better Auth | Latest | JWT plugin required |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure creation

- [x] T001 Create root directory structure with frontend/, backend/, specs/, history/ directories
- [x] T002 [P] Create .gitignore with Python, Node.js, and common patterns
- [x] T003 [P] Create root package.json with monorepo scripts for dev commands

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [x] T004 Initialize backend Python project with pyproject.toml in backend/pyproject.toml
- [x] T005 Create backend/requirements.txt with FastAPI, SQLModel, uvicorn, python-dotenv, pydantic-settings, pyjwt, alembic, psycopg2-binary
- [x] T006 [P] Create backend/app/__init__.py (empty module file)
- [x] T007 [P] Create backend/app/models/__init__.py (empty module file)
- [x] T008 [P] Create backend/app/routers/__init__.py (empty module file)
- [x] T009 [P] Create backend/app/services/__init__.py (empty module file)
- [x] T010 [P] Create backend/app/schemas/__init__.py (empty module file)
- [x] T011 [P] Create backend/tests/__init__.py (empty module file)

### Frontend Foundation (Next.js 16.0.10)

- [x] T012 Initialize Next.js 16.0.10 project in frontend/ with App Router using `npx create-next-app@16.0.10` with TypeScript and Tailwind CSS
- [x] T013 Verify frontend/package.json has exact `"next": "16.0.10"` dependency - update if different
- [x] T014 Configure frontend/tailwind.config.js for Tailwind CSS (compatible with Next.js 16.0.10)
- [x] T015 [P] Create frontend/src/components/ui/ directory structure
- [x] T016 [P] Create frontend/src/lib/ directory for utilities
- [x] T017 [P] Create frontend/src/services/ directory for API client

### Test Infrastructure

- [x] T018 [P] Create backend/tests/conftest.py with pytest fixtures
- [x] T019 [P] Create backend/alembic/ directory structure for migrations

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Developer Onboarding (Priority: P1) MVP

**Goal**: New developers can understand project structure and start development within 15 minutes

**Independent Test**: Clone repo, follow documentation, start both frontend (Next.js 16.0.10) and backend services

### Implementation for User Story 1

- [x] T020 [US1] Create backend/app/main.py with FastAPI app initialization and health router
- [x] T021 [US1] Create backend/app/routers/health.py with /health and /health/ready endpoints per contracts/health.yaml
- [x] T022 [P] [US1] Create frontend/src/app/layout.tsx with root layout (html, body tags) - Next.js 16.0.10 App Router format
- [x] T023 [P] [US1] Create frontend/src/app/page.tsx with basic home page - Next.js 16.0.10 App Router format
- [x] T024 [US1] Create frontend/CLAUDE.md with frontend-specific AI instructions (mention Next.js 16.0.10)
- [x] T025 [US1] Create backend/CLAUDE.md with backend-specific AI instructions
- [x] T026 [US1] Update root CLAUDE.md to reference frontend and backend CLAUDE.md files

**Checkpoint**: At this point, both frontend (Next.js 16.0.10) and backend can start independently

---

## Phase 4: User Story 2 - Environment Configuration (Priority: P1)

**Goal**: All configuration externalized via environment variables with validation

**Independent Test**: Application fails gracefully with clear messages when required env vars missing

### Implementation for User Story 2

- [x] T027 [US2] Create .env.example with all required environment variables documented
- [x] T028 [US2] Create backend/app/config.py with Pydantic Settings class for env validation
- [x] T029 [US2] Create backend/app/database.py with SQLModel engine using DATABASE_URL from config
- [x] T030 [US2] Update backend/app/main.py to use config validation on startup
- [x] T031 [P] [US2] Create frontend/src/lib/env.ts for frontend environment validation (Next.js 16.0.10 compatible)
- [x] T032 [P] [US2] Configure frontend/next.config.js to expose NEXT_PUBLIC_ variables (Next.js 16.0.10 format)
- [x] T033 [US2] Create backend/app/schemas/error.py with error response schemas per contracts/error-taxonomy.yaml

**Checkpoint**: Environment configuration complete - app fails gracefully on missing config

---

## Phase 5: User Story 3 - Layer Responsibility Understanding (Priority: P2)

**Goal**: Developers can correctly identify which layer handles each concern

**Independent Test**: Developer can answer "which layer handles X?" correctly after reading docs

### Implementation for User Story 3

- [x] T034 [P] [US3] Create backend/app/models/base.py with BaseModel including user_id field
- [x] T035 [P] [US3] Create backend/app/dependencies.py with get_session and auth dependencies
- [x] T036 [US3] Create frontend/src/services/api.ts with typed API client for backend communication (Next.js 16.0.10 fetch patterns)
- [x] T037 [US3] Create frontend/src/lib/auth.ts with Better Auth client configuration (compatible with Next.js 16.0.10)
- [x] T038 [P] [US3] Create frontend/src/app/api/auth/[...all]/route.ts for Better Auth handler (Next.js 16.0.10 Route Handler format)
- [x] T039 [US3] Create frontend/src/app/(auth)/login/page.tsx placeholder for login (Next.js 16.0.10 route groups)
- [x] T040 [P] [US3] Create frontend/src/app/(auth)/register/page.tsx placeholder for register (Next.js 16.0.10 route groups)

**Checkpoint**: Layer responsibilities clear - auth, API, and data patterns established

---

## Phase 6: User Story 4 - AI-Assisted Development Workflow (Priority: P2)

**Goal**: Developers can use Claude Code and Spec-Kit Plus following defined workflow

**Independent Test**: Developer successfully creates a feature spec using /sp.specify

### Implementation for User Story 4

- [x] T041 [US4] Verify CLAUDE.md contains all required sections per FR-005 (including Next.js 16.0.10 note)
- [x] T042 [US4] Verify AGENTS.md contains all required sections per FR-006
- [x] T043 [US4] Ensure history/prompts/ directory structure exists with constitution/, general/ subdirectories
- [x] T044 [P] [US4] Ensure history/adr/ directory exists for Architecture Decision Records
- [x] T045 [US4] Verify specs/ follows folder-per-feature pattern per FR-004

**Checkpoint**: Spec-driven workflow enabled - development can follow spec -> plan -> tasks pattern

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T046 [P] Configure Alembic in backend/alembic.ini with Neon PostgreSQL connection
- [x] T047 Create backend/alembic/env.py with SQLModel metadata configuration
- [x] T048 [P] Add .dockerignore for future containerization
- [x] T049 Validate quickstart.md instructions work (15-minute target)
- [x] T050 Run security audit to verify no hardcoded secrets (SC-002)
- [x] T051 Verify both frontend (Next.js 16.0.10) and backend start independently (SC-006)
- [x] T052 Verify frontend/package.json contains exact `"next": "16.0.10"` version

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase
- **User Story 2 (Phase 4)**: Depends on Foundational phase, can run in parallel with US1
- **User Story 3 (Phase 5)**: Depends on Foundational phase, should follow US2 for config
- **User Story 4 (Phase 6)**: Depends on Foundational phase, can run in parallel with others
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 3 (P2)**: Can start after US2 (needs config patterns established)
- **User Story 4 (P2)**: Can start after Foundational - No dependencies on other stories

### Within Each User Story

- Models before services
- Config before dependent code
- Backend before frontend integration
- Core implementation before polish

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- T006-T011 (module init files) can all run in parallel
- T015-T017 (frontend directories) can all run in parallel
- User Stories 1 and 2 can be worked on in parallel after Foundational
- User Story 4 can be worked on in parallel with any other story

---

## Parallel Example: Foundational Phase

```bash
# Launch all module init files together:
Task: "Create backend/app/__init__.py"
Task: "Create backend/app/models/__init__.py"
Task: "Create backend/app/routers/__init__.py"
Task: "Create backend/app/services/__init__.py"
Task: "Create backend/app/schemas/__init__.py"
Task: "Create backend/tests/__init__.py"

# Launch all frontend directories together:
Task: "Create frontend/src/components/ui/ directory"
Task: "Create frontend/src/lib/ directory"
Task: "Create frontend/src/services/ directory"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Developer Onboarding)
4. Complete Phase 4: User Story 2 (Environment Configuration)
5. **STOP and VALIDATE**: Both frontend (Next.js 16.0.10) and backend should start independently
6. Deploy/demo if ready - basic project structure complete

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Verify project runs
3. Add User Story 2 → Test independently → Verify config validation
4. Add User Story 3 → Test independently → Verify layer separation
5. Add User Story 4 → Test independently → Verify workflow works
6. Each story adds value without breaking previous stories

### Task Summary

| Phase | Tasks | Parallel Tasks |
|-------|-------|----------------|
| Setup | 3 | 2 |
| Foundational | 16 | 11 |
| User Story 1 | 7 | 2 |
| User Story 2 | 7 | 2 |
| User Story 3 | 7 | 4 |
| User Story 4 | 5 | 1 |
| Polish | 7 | 2 |
| **Total** | **52** | **24** |

---

## Next.js 16.0.10 Specific Notes

**CRITICAL**: This project requires Next.js version 16.0.10 exactly.

### Installation Command
```bash
npx create-next-app@16.0.10 frontend --typescript --tailwind --eslint --app --src-dir
```

### Package.json Verification
Ensure `frontend/package.json` contains:
```json
{
  "dependencies": {
    "next": "16.0.10"
  }
}
```

### Compatibility Notes
- App Router is the default and required architecture
- Route handlers use `route.ts` convention
- Server Components are default
- Use `"use client"` directive for Client Components
- Better Auth is compatible with Next.js 16.0.10

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- This is a foundational spec - no domain features implemented yet
- **IMPORTANT**: Always verify Next.js version is 16.0.10 in package.json
