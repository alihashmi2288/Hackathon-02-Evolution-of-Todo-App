# Tasks: Authentication & Identity Model

**Input**: Design documents from `/specs/002-auth-identity/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests not explicitly requested - implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/` (Next.js 16.0.10 with Better Auth)
- **Backend**: `backend/app/` (FastAPI with python-jose)
- Paths based on plan.md structure for web application

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency setup

- [x] T001 Install drizzle-orm and @neondatabase/serverless in frontend/package.json
- [x] T002 [P] Verify better-auth version supports JWT plugin in frontend/package.json
- [x] T003 [P] Verify python-jose installed in backend/requirements.txt
- [x] T004 Create frontend/drizzle.config.ts for Drizzle ORM configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema (Better Auth Tables)

- [x] T005 Create frontend/src/lib/db.ts with Neon database connection
- [x] T006 Create frontend/drizzle/schema.ts with Better Auth tables (user, session, account, verification)
- [ ] T007 Run Better Auth CLI to generate migrations: `npx @better-auth/cli generate` (MANUAL: run after npm install)
- [ ] T008 Run Better Auth CLI to apply migrations: `npx @better-auth/cli migrate` (MANUAL: run after T007)

### Better Auth Server Configuration

- [x] T009 Update frontend/src/lib/auth-server.ts to add JWT plugin with HS256, 15-min expiry, definePayload for sub+email
- [x] T010 Update frontend/src/lib/auth-server.ts to add Drizzle database adapter

### Backend Token Validation

- [x] T011 Update backend/app/dependencies.py TokenPayload to include email claim
- [x] T012 Update backend/app/dependencies.py CurrentUser model to include email field
- [x] T013 [P] Create backend/app/models/user.py with User reference model for type hints
- [x] T014 Add clock skew tolerance (30s) to token expiration validation in backend/app/dependencies.py

### Environment Synchronization

- [x] T015 [P] Update .env.example with BETTER_AUTH_SECRET and JWT_SECRET alignment documentation
- [x] T016 [P] Add startup validation in backend/app/config.py to verify JWT_SECRET is 32+ characters (already implemented)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - New User Registration (Priority: P1) 🎯 MVP

**Goal**: Allow new users to register with email/password and receive a valid JWT token

**Independent Test**: Complete signup form with valid credentials and verify JWT token is issued

**Subagent**: Use `better-auth-engineer` skill for frontend, `nextjs-frontend` for UI

### Implementation for User Story 1

- [x] T017 [US1] Update frontend/src/lib/auth.ts to export signUp method with proper typing
- [x] T018 [P] [US1] Create frontend/src/components/auth/RegisterForm.tsx with email, password, name fields
- [x] T019 [US1] Update frontend/src/app/(auth)/register/page.tsx to use RegisterForm component
- [x] T020 [US1] Add password requirements display (min 8 chars) in RegisterForm.tsx
- [x] T021 [US1] Add form validation with error messages for invalid email format in RegisterForm.tsx
- [x] T022 [US1] Add loading state during registration submission in RegisterForm.tsx
- [x] T023 [US1] Handle duplicate email error response (409) with user-friendly message in RegisterForm.tsx
- [x] T024 [US1] Redirect to home page on successful registration in register/page.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Existing User Sign In (Priority: P1)

**Goal**: Allow registered users to sign in with email/password and receive a valid JWT token

**Independent Test**: Enter valid credentials for existing account and verify JWT token is issued

**Subagent**: Use `better-auth-engineer` skill for auth, `nextjs-frontend` for UI

### Implementation for User Story 2

- [x] T025 [US2] Update frontend/src/lib/auth.ts to export signIn method with proper typing
- [x] T026 [P] [US2] Create frontend/src/components/auth/LoginForm.tsx with email, password fields
- [x] T027 [US2] Update frontend/src/app/(auth)/login/page.tsx to use LoginForm component
- [x] T028 [US2] Add form validation with generic error message for invalid credentials in LoginForm.tsx
- [x] T029 [US2] Add loading state during sign-in submission in LoginForm.tsx
- [x] T030 [US2] Handle 401 error response with generic "Invalid credentials" message in LoginForm.tsx
- [x] T031 [US2] Redirect to home page on successful sign-in in login/page.tsx
- [x] T032 [US2] Add "Create account" link to login page pointing to /register

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Token-Based Access to Protected Resources (Priority: P1)

**Goal**: Enable authenticated users to access protected backend endpoints using JWT tokens

**Independent Test**: Make request with valid token → access granted; with invalid/expired token → access denied

**Subagent**: Use `fastapi-backend-architect` skill for backend, `nextjs-frontend` for API client

### Implementation for User Story 3

- [x] T033 [US3] Update frontend/src/lib/auth.ts getSessionToken function to return JWT from session
- [x] T034 [US3] Update frontend/src/services/api.ts to include Authorization header from getSessionToken
- [x] T035 [P] [US3] Create backend/app/routers/auth.py with /health/auth endpoint to verify JWT config
- [x] T036 [US3] Register auth router in backend/app/main.py
- [x] T037 [P] [US3] Create backend/app/routers/me.py with GET /me endpoint returning current user info
- [x] T038 [US3] Register me router in backend/app/main.py (protected endpoint example)
- [x] T039 [US3] Add proper 401 error response format for expired tokens in backend/app/dependencies.py
- [x] T040 [US3] Add proper 401 error response format for malformed tokens in backend/app/dependencies.py

**Checkpoint**: All P1 user stories should now be independently functional

---

## Phase 6: User Story 4 - User Sign Out (Priority: P2)

**Goal**: Allow authenticated users to sign out and clear their session tokens

**Independent Test**: Sign out and verify subsequent requests are treated as unauthenticated

**Subagent**: Use `nextjs-frontend` skill for UI implementation

### Implementation for User Story 4

- [x] T041 [US4] Update frontend/src/lib/auth.ts to export signOut method with proper typing
- [x] T042 [P] [US4] Create frontend/src/components/auth/SignOutButton.tsx component
- [x] T043 [US4] Add SignOutButton to frontend/src/app/page.tsx for authenticated users
- [x] T044 [US4] Implement session check in page.tsx to show/hide SignOutButton based on auth state
- [x] T045 [US4] Clear local storage/cookies on sign out via Better Auth signOut method
- [x] T046 [US4] Redirect to login page after successful sign out

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

**Subagent**: Use `security-auditor` skill for security review

- [ ] T047 [P] Run security-auditor to review auth implementation for OWASP vulnerabilities (MANUAL: run /security-auditor)
- [x] T048 [P] Add structured logging for auth events in backend/app/dependencies.py
- [x] T049 Verify no credential leakage in error messages across all auth error responses
- [x] T050 [P] Update frontend/src/app/layout.tsx to include auth provider wrapper if needed (N/A: Better Auth doesn't require provider)
- [ ] T051 Test token tampering detection by modifying JWT signature and verifying rejection (MANUAL: integration test)
- [x] T052 [P] Add environment check in frontend/src/lib/env.ts for BETTER_AUTH_SECRET presence (already implemented)
- [ ] T053 Run quickstart.md validation to verify setup instructions work end-to-end (MANUAL: requires npm install + db setup)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1: US1, US2, US3 → P2: US4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story | Priority | Depends On | Can Start After |
|-------|----------|------------|-----------------|
| US1 (Registration) | P1 | Foundational only | Phase 2 complete |
| US2 (Sign In) | P1 | Foundational only | Phase 2 complete |
| US3 (Token Access) | P1 | Foundational only | Phase 2 complete |
| US4 (Sign Out) | P2 | Foundational + US2 (user must sign in first) | Phase 4 complete |

### Within Each User Story

1. Models/types before services
2. Services before endpoints
3. Backend before frontend integration (for US3)
4. Core implementation before polish

### Parallel Opportunities

**Setup Phase (3 parallel):**
- T002, T003 can run in parallel

**Foundational Phase (4 parallel):**
- T013, T015, T016 can run in parallel after core deps complete

**User Stories (after Foundational):**
- US1, US2, US3 can all start in parallel (different files, independent)
- Within US1: T018 can run in parallel with T017
- Within US2: T026 can run in parallel with T025
- Within US3: T035, T037 can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch parallel foundational tasks (after T005-T010):
Task: "Create backend/app/models/user.py with User reference model"
Task: "Update .env.example with secret alignment documentation"
Task: "Add startup validation for JWT_SECRET length"
```

## Parallel Example: User Stories After Foundational

```bash
# Launch all P1 user stories together (after Phase 2):
# Developer A:
Task: "Update frontend/src/lib/auth.ts to export signUp method" (US1)

# Developer B:
Task: "Update frontend/src/lib/auth.ts to export signIn method" (US2)

# Developer C:
Task: "Create backend/app/routers/auth.py with /health/auth endpoint" (US3)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Registration)
4. **STOP and VALIDATE**: Test registration independently
5. Deploy/demo if ready - users can now create accounts

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Users can register (MVP!)
3. Add User Story 2 → Test independently → Users can sign in
4. Add User Story 3 → Test independently → Users can access protected resources
5. Add User Story 4 → Test independently → Users can sign out
6. Each story adds value without breaking previous stories

### Subagent Execution Strategy

```bash
# Phase 2: Database/Auth foundation
/database-sqlmodel  # For schema creation
/auth-better-jwt    # For Better Auth JWT plugin configuration

# Phase 3-4: Frontend auth forms
/nextjs-frontend    # For login/register UI components

# Phase 5: Backend protected endpoints
/fastapi-backend    # For JWT validation and protected routes

# Phase 7: Security review
/security-auditor   # For OWASP vulnerability review
```

---

## Summary

| Phase | Tasks | Parallel Tasks | Story Coverage |
|-------|-------|----------------|----------------|
| Setup | 4 | 2 | Infrastructure |
| Foundational | 12 | 3 | Core auth setup |
| US1 (Registration) | 8 | 1 | P1 - MVP |
| US2 (Sign In) | 8 | 1 | P1 |
| US3 (Token Access) | 8 | 2 | P1 |
| US4 (Sign Out) | 6 | 1 | P2 |
| Polish | 7 | 4 | Cross-cutting |
| **Total** | **53** | **14** | 4 stories |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Use subagents/skills as indicated for specialized work
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
