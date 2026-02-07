# Tasks: Todo CRUD Operations

**Input**: Design documents from `/specs/003-todo-crud/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/todo-api.yaml

**Tests**: Not explicitly requested in spec - tests included for API validation per CI/CD Integrity principle.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- All paths relative to repository root

## Path Conventions

- **Backend**: `backend/app/` for source, `backend/tests/` for tests
- **Models**: `backend/app/models/`
- **Routers**: `backend/app/routers/`
- **Schemas**: `backend/app/schemas/`
- **Services**: `backend/app/services/`

---

## Phase 1: Setup

**Purpose**: Install new dependencies required for this feature

- [x] T001 Add nanoid dependency to backend/requirements.txt

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create Todo SQLModel entity in backend/app/models/todo.py per data-model.md
- [x] T003 [P] Create TodoCreate, TodoUpdate, TodoResponse schemas in backend/app/schemas/todo.py
- [x] T004 [P] Export Todo model in backend/app/models/__init__.py
- [x] T005 Create database migration for todos table using Alembic
- [x] T006 Create TodoService class with base methods in backend/app/services/todo.py
- [x] T007 Create todos router file skeleton in backend/app/routers/todos.py
- [x] T008 Register todos router in backend/app/main.py

**Checkpoint**: Foundation ready - all CRUD endpoint implementations can now begin

---

## Phase 3: User Story 1 - Create a New Todo (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can create new todo items with title and optional description

**Independent Test**: POST /todos with valid JWT and todo data returns 201 with created todo

**Acceptance Criteria** (from spec.md):
- Given I am authenticated, When I submit a new todo with a title, Then the system creates the todo and returns it with a unique ID and timestamps
- Given I am authenticated, When I submit a todo without a title, Then the system rejects with validation error (400)
- Given I am not authenticated, When I try to create a todo, Then the system returns 401

### Implementation for User Story 1

- [x] T009 [US1] Implement create_todo method in TodoService in backend/app/services/todo.py
- [x] T010 [US1] Implement POST /todos endpoint in backend/app/routers/todos.py
- [x] T011 [US1] Add title validation (required, non-empty, max 255 chars) in TodoCreate schema

**Checkpoint**: User Story 1 complete - can create todos via POST /todos

---

## Phase 4: User Story 2 - View My Todos (Priority: P1)

**Goal**: Authenticated users can view all their own todos (not other users' todos)

**Independent Test**: GET /todos returns only authenticated user's todos, empty list if none

**Acceptance Criteria** (from spec.md):
- Given I am authenticated and have todos, When I request my todo list, Then the system returns only my todos
- Given I am authenticated and have no todos, When I request my todo list, Then the system returns an empty list
- Given I am not authenticated, When I try to view todos, Then the system returns 401

### Implementation for User Story 2

- [x] T012 [US2] Implement get_todos method in TodoService (filter by user_id) in backend/app/services/todo.py
- [x] T013 [US2] Implement GET /todos endpoint in backend/app/routers/todos.py

**Checkpoint**: User Story 2 complete - can list todos via GET /todos

---

## Phase 5: User Story 3 - Update a Todo (Priority: P1)

**Goal**: Authenticated users can update their own todos (title, description, completed status)

**Independent Test**: PATCH /todos/{id} with valid data updates todo and returns 200; returns 404 for non-owned/non-existent todos

**Acceptance Criteria** (from spec.md):
- Given I own a todo, When I update its title, Then the system saves the change and returns updated todo
- Given I own a todo, When I mark it as completed, Then the system updates completed status to true
- Given I try to update another user's todo, Then the system returns 404 (not 403 - security)
- Given I try to update a non-existent todo, Then the system returns 404

### Implementation for User Story 3

- [x] T014 [US3] Implement get_todo_by_id method in TodoService (filter by id AND user_id) in backend/app/services/todo.py
- [x] T015 [US3] Implement update_todo method in TodoService (updates updated_at timestamp) in backend/app/services/todo.py
- [x] T016 [US3] Implement PATCH /todos/{id} endpoint in backend/app/routers/todos.py

**Checkpoint**: User Story 3 complete - can update todos via PATCH /todos/{id}

---

## Phase 6: User Story 4 - Delete a Todo (Priority: P2)

**Goal**: Authenticated users can delete their own todos

**Independent Test**: DELETE /todos/{id} returns 204 for owned todo; returns 404 for non-owned/non-existent todos

**Acceptance Criteria** (from spec.md):
- Given I own a todo, When I delete it, Then the system removes the todo and returns 204
- Given I try to delete another user's todo, Then the system returns 404
- Given I try to delete a non-existent todo, Then the system returns 404

### Implementation for User Story 4

- [x] T017 [US4] Implement delete_todo method in TodoService in backend/app/services/todo.py
- [x] T018 [US4] Implement DELETE /todos/{id} endpoint in backend/app/routers/todos.py

**Checkpoint**: User Story 4 complete - can delete todos via DELETE /todos/{id}

---

## Phase 7: User Story 5 - View a Single Todo (Priority: P2)

**Goal**: Authenticated users can view a specific todo by its ID

**Independent Test**: GET /todos/{id} returns full todo details for owned todo; returns 404 for non-owned/non-existent

**Acceptance Criteria** (from spec.md):
- Given I own a todo, When I request it by ID, Then the system returns the full todo details
- Given I request another user's todo, Then the system returns 404
- Given I request a non-existent todo, Then the system returns 404

### Implementation for User Story 5

- [x] T019 [US5] Implement GET /todos/{id} endpoint in backend/app/routers/todos.py (reuses get_todo_by_id from US3)

**Checkpoint**: User Story 5 complete - can view single todo via GET /todos/{id}

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Integration testing, validation, and documentation

- [x] T020 [P] Create API tests for all endpoints in backend/tests/test_todos.py
- [x] T021 [P] Verify OpenAPI spec matches implementation at /docs
- [x] T022 Run security audit on owner validation logic
- [x] T023 Validate quickstart.md cURL examples work correctly
- [x] T024 Update backend/app/routers/__init__.py exports if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1-US3 are P1 priority - complete these first
  - US4-US5 are P2 priority - complete after P1 stories
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Priority | Depends On | Can Parallelize With |
|-------|----------|------------|---------------------|
| US1 (Create) | P1 | Phase 2 only | US2 |
| US2 (List) | P1 | Phase 2 only | US1 |
| US3 (Update) | P1 | Phase 2 only | US1, US2 |
| US4 (Delete) | P2 | Phase 2 only | US5 |
| US5 (Get Single) | P2 | Phase 2, US3 (reuses get_todo_by_id) | US4 (after US3) |

**Note**: US5 reuses the `get_todo_by_id` service method implemented in US3, so US3 should complete before US5.

### Within Each User Story

1. Service method(s) first
2. Router endpoint second
3. Validation/error handling integrated

### Parallel Opportunities

**Phase 2 Parallel Tasks**:
```bash
# These can run in parallel (different files):
T003: Create schemas in backend/app/schemas/todo.py
T004: Export model in backend/app/models/__init__.py
```

**User Stories Parallel** (after Phase 2):
```bash
# P1 stories can run in parallel:
US1 (T009-T011): Create endpoint
US2 (T012-T013): List endpoint
US3 (T014-T016): Update endpoint

# P2 stories can run in parallel (after US3):
US4 (T017-T018): Delete endpoint
US5 (T019): Get single endpoint
```

---

## Implementation Strategy

### MVP First (User Stories 1-2)

1. Complete Phase 1: Setup (install nanoid)
2. Complete Phase 2: Foundational (model, schemas, service skeleton, router registration)
3. Complete Phase 3: User Story 1 (Create todo)
4. Complete Phase 4: User Story 2 (List todos)
5. **STOP and VALIDATE**: Can create and list todos
6. Deploy/demo if ready

### Full P1 Delivery

1. Complete MVP (US1-US2)
2. Complete Phase 5: User Story 3 (Update todo)
3. **STOP and VALIDATE**: Full create-read-update cycle works
4. Deploy/demo if ready

### Complete Feature

1. Complete P1 Delivery (US1-US3)
2. Complete Phase 6: User Story 4 (Delete todo)
3. Complete Phase 7: User Story 5 (Get single todo)
4. Complete Phase 8: Polish (tests, validation)
5. **FINAL VALIDATION**: All CRUD operations work, security validated

---

## Task Summary

| Phase | Task Count | Parallel Tasks |
|-------|------------|----------------|
| Setup | 1 | 0 |
| Foundational | 7 | 2 |
| US1 (Create) | 3 | 0 |
| US2 (List) | 2 | 0 |
| US3 (Update) | 3 | 0 |
| US4 (Delete) | 2 | 0 |
| US5 (Get Single) | 1 | 0 |
| Polish | 5 | 2 |
| **Total** | **24** | **4** |

---

## Notes

- All endpoints require JWT authentication (implemented in SPEC-002)
- Return 404 (not 403) for unauthorized access to prevent information disclosure
- Use nanoid for ID generation (21 chars, URL-safe)
- Timestamps are UTC with timezone awareness
- Service layer handles owner validation (filter by user_id from JWT)
- Follow existing error taxonomy from SPEC-001
