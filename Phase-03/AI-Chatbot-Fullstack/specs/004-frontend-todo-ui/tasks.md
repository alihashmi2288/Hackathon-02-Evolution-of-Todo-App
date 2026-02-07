
# Tasks: Frontend Todo UI & Secure API Integration

**Input**: Design documents from `/specs/004-frontend-todo-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/todo-api.ts, quickstart.md

**Tests**: Not explicitly requested - tests included for UI validation per CI/CD Integrity principle.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5, US6, US7)
- All paths relative to repository root

## Path Conventions

- **Frontend**: `frontend/src/` for source
- **Components**: `frontend/src/components/`
- **Hooks**: `frontend/src/hooks/`
- **Types**: `frontend/src/types/`
- **Services**: `frontend/src/services/`
- **Pages**: `frontend/src/app/`

---

## Phase 1: Setup

**Purpose**: Install dependencies and create project structure

- [x] T001 Create types directory at frontend/src/types/
- [x] T002 Create hooks directory at frontend/src/hooks/
- [x] T003 [P] Create Todo types in frontend/src/types/todo.ts per data-model.md
- [x] T004 [P] Create UI components directory at frontend/src/components/ui/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Update API client types in frontend/src/services/api.ts to match contracts/todo-api.ts
- [x] T006 Create Toast context and provider in frontend/src/hooks/useToast.ts
- [x] T007 [P] Create Toast component in frontend/src/components/ui/Toast.tsx
- [x] T008 [P] Create Button component in frontend/src/components/ui/Button.tsx
- [x] T009 [P] Create Input component in frontend/src/components/ui/Input.tsx
- [x] T010 [P] Create Spinner component in frontend/src/components/ui/Spinner.tsx
- [x] T011 [P] Create Dialog component in frontend/src/components/ui/Dialog.tsx
- [x] T012 Add ToastProvider to frontend/src/app/layout.tsx
- [x] T013 Create useTodos hook skeleton in frontend/src/hooks/useTodos.ts
- [x] T014 Create todos components directory at frontend/src/components/todos/

**Checkpoint**: Foundation ready - all UI building blocks available, user story implementation can begin

---

## Phase 3: User Story 1 - View My Todos (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can see all their todos displayed on a dedicated page

**Independent Test**: Login and navigate to /todos, verify list displays with title, completion status, and creation date

**Acceptance Criteria** (from spec.md):
- Given I am logged in and have todos, When I navigate to /todos, Then I see all my todos
- Given I am logged in with no todos, When I navigate to /todos, Then I see empty state message
- Given I am loading todos, When the page loads, Then I see a loading indicator
- Given I am not logged in, When I try to access /todos, Then I am redirected to login

### Implementation for User Story 1

- [x] T015 [US1] Create todos page route at frontend/src/app/todos/page.tsx with auth check
- [x] T016 [US1] Create loading.tsx at frontend/src/app/todos/loading.tsx for suspense fallback
- [x] T017 [US1] Implement fetchTodos in useTodos hook in frontend/src/hooks/useTodos.ts
- [x] T018 [US1] Create EmptyState component in frontend/src/components/todos/EmptyState.tsx
- [x] T019 [US1] Create TodoItem component in frontend/src/components/todos/TodoItem.tsx
- [x] T020 [US1] Create TodoList component in frontend/src/components/todos/TodoList.tsx
- [x] T021 [US1] Add loading state display in TodoList component
- [x] T022 [US1] Add error state display in TodoList component

**Checkpoint**: User Story 1 complete - can view todos at /todos with loading/empty states

---

## Phase 4: User Story 2 - Create a New Todo (Priority: P1)

**Goal**: Authenticated users can create new todos with title and optional description

**Independent Test**: Fill in title, submit form, verify new todo appears at top of list

**Acceptance Criteria** (from spec.md):
- Given I am on /todos, When I enter title and submit, Then new todo appears in list
- Given I leave title empty, When I submit, Then I see validation error
- Given I am creating a todo, When submission is in progress, Then I see loading indicator
- Given server returns error, When I submit, Then I see error message

### Implementation for User Story 2

- [x] T023 [US2] Create TodoForm component in frontend/src/components/todos/TodoForm.tsx
- [x] T024 [US2] Add title validation (required, non-empty, max 255 chars) to TodoForm
- [x] T025 [US2] Implement createTodo in useTodos hook in frontend/src/hooks/useTodos.ts
- [x] T026 [US2] Add TodoForm to TodoList component in frontend/src/components/todos/TodoList.tsx
- [x] T027 [US2] Add success toast notification on todo creation
- [x] T028 [US2] Add error toast notification on creation failure

**Checkpoint**: User Story 2 complete - can create todos with validation and feedback

---

## Phase 5: User Story 3 - Mark Todo as Complete/Incomplete (Priority: P1)

**Goal**: Users can toggle completion status with optimistic updates

**Independent Test**: Click toggle, see immediate visual change, verify persists after refresh

**Acceptance Criteria** (from spec.md):
- Given incomplete todo, When I click toggle, Then it shows as complete with strikethrough
- Given completed todo, When I click toggle, Then it shows as incomplete
- Given toggle fails, When API errors, Then toggle reverts and error message shown

### Implementation for User Story 3

- [x] T029 [US3] Create TodoToggle component in frontend/src/components/todos/TodoToggle.tsx
- [x] T030 [US3] Add checkbox with ARIA attributes for accessibility in TodoToggle
- [x] T031 [US3] Implement toggleComplete with optimistic update in useTodos hook
- [x] T032 [US3] Add rollback logic on API failure in toggleComplete
- [x] T033 [US3] Add visual styling for completed todos (strikethrough, muted colors) in TodoItem
- [x] T034 [US3] Integrate TodoToggle into TodoItem component

**Checkpoint**: User Story 3 complete - can toggle completion with instant feedback

---

## Phase 6: User Story 4 - Edit a Todo (Priority: P2)

**Goal**: Users can edit todo title and description

**Independent Test**: Click edit, modify title, save, verify updated content displays

**Acceptance Criteria** (from spec.md):
- Given I have a todo, When I click edit, Then I can modify title and description
- Given I am editing, When I save, Then updated content displays immediately
- Given I am editing, When I cancel, Then changes are discarded
- Given I clear title, When I try to save, Then I see validation error

### Implementation for User Story 4

- [x] T035 [US4] Add editing state to useTodos hook (editingTodoId, editFormValues)
- [x] T036 [US4] Implement updateTodo method in useTodos hook
- [x] T037 [US4] Create inline edit mode in TodoItem component
- [x] T038 [US4] Add edit/cancel buttons to TodoItem in edit mode
- [x] T039 [US4] Add validation for edit form (title required)
- [x] T040 [US4] Add success/error toast notifications for edit operations

**Checkpoint**: User Story 4 complete - can edit todos inline with validation

---

## Phase 7: User Story 5 - Delete a Todo (Priority: P2)

**Goal**: Users can delete todos with confirmation

**Independent Test**: Click delete, confirm in dialog, verify todo removed from list

**Acceptance Criteria** (from spec.md):
- Given I have a todo, When I click delete, Then I see confirmation dialog
- Given I see confirmation, When I confirm, Then todo is removed from list
- Given I see confirmation, When I cancel, Then todo remains
- Given deletion fails, When API errors, Then error message shown and todo remains

### Implementation for User Story 5

- [x] T041 [US5] Create DeleteDialog component in frontend/src/components/todos/DeleteDialog.tsx
- [x] T042 [US5] Add focus trap and keyboard handling (Escape to close) to DeleteDialog
- [x] T043 [US5] Implement deleteTodo method in useTodos hook
- [x] T044 [US5] Add delete button to TodoItem actions
- [x] T045 [US5] Add confirmation state to TodoItem (deletingTodoId)
- [x] T046 [US5] Add success/error toast notifications for delete operations

**Checkpoint**: User Story 5 complete - can delete todos with confirmation

---

## Phase 8: User Story 6 - Handle Session Expiry (Priority: P2)

**Goal**: Gracefully redirect to login when session expires

**Independent Test**: Expire session, perform action, verify redirect to login

**Acceptance Criteria** (from spec.md):
- Given session expired, When I perform action, Then I am redirected to /login
- Given I am redirected, When I log back in, Then I return to /todos
- Given session valid, When I perform actions, Then requests include auth automatically

### Implementation for User Story 6

- [x] T047 [US6] Add 401 detection in API client request method in frontend/src/services/api.ts
- [x] T048 [US6] Implement redirect to /login?error=session_expired on 401
- [x] T049 [US6] Display session expired message on login page when error param present
- [x] T050 [US6] Add return URL handling to redirect back to /todos after re-login

**Checkpoint**: User Story 6 complete - session expiry handled gracefully

---

## Phase 9: User Story 7 - Responsive Mobile Experience (Priority: P3)

**Goal**: Full functionality on mobile devices (320px minimum)

**Independent Test**: Use mobile viewport (320px), verify all CRUD operations work with touch

**Acceptance Criteria** (from spec.md):
- Given mobile device, When I view todos, Then layout adapts to screen
- Given mobile device, When I CRUD todos, Then all interactions work with touch
- Given mobile device, When I use forms, Then keyboard does not obscure input

### Implementation for User Story 7

- [x] T051 [US7] Add responsive Tailwind classes to TodoList (stack on mobile, grid on desktop)
- [x] T052 [US7] Ensure touch targets are minimum 44x44px for all interactive elements
- [x] T053 [US7] Add responsive padding/margins to TodoForm
- [x] T054 [US7] Ensure DeleteDialog is centered and fits mobile screen
- [x] T055 [US7] Test and adjust TodoItem layout for narrow screens
- [x] T056 [US7] Add meta viewport tag if not present in frontend/src/app/layout.tsx

**Checkpoint**: User Story 7 complete - fully functional on mobile

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, testing, and final validation

- [x] T057 Add ARIA labels to all interactive elements in todo components
- [x] T058 Implement keyboard navigation (Tab through elements, Enter/Space to activate)
- [x] T059 Add visible focus indicators (Tailwind focus:ring) to all focusable elements
- [ ] T060 [P] Create Playwright E2E test for auth-to-CRUD happy path in frontend/tests/e2e/todos.spec.ts
- [ ] T061 Validate quickstart.md test scenarios work correctly
- [ ] T062 Run security review on JWT handling and user input

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1-US3 are P1 priority - complete these first for MVP
  - US4-US6 are P2 priority - complete after P1 stories
  - US7 is P3 priority - complete after P2 stories
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Priority | Depends On | Can Parallelize With |
|-------|----------|------------|---------------------|
| US1 (View) | P1 | Phase 2 only | - |
| US2 (Create) | P1 | US1 (needs TodoList) | US3 (after US1) |
| US3 (Toggle) | P1 | US1 (needs TodoItem) | US2 (after US1) |
| US4 (Edit) | P2 | US1 (needs TodoItem) | US5, US6 |
| US5 (Delete) | P2 | US1 (needs TodoItem) | US4, US6 |
| US6 (Session) | P2 | Phase 2 only | US4, US5 |
| US7 (Mobile) | P3 | US1-US5 (needs all components) | - |

### Within Each User Story

1. Component creation first
2. Hook/state logic second
3. Integration with existing components third
4. Toast notifications last

### Parallel Opportunities

**Phase 2 Parallel Tasks**:
```
# These can run in parallel (different files):
T007: Toast component
T008: Button component
T009: Input component
T010: Spinner component
T011: Dialog component
```

**After Phase 2, User Stories can run sequentially**:
- Complete US1 (View) first - needed by all other stories
- Then US2 (Create) and US3 (Toggle) can run in parallel
- Then US4 (Edit), US5 (Delete), US6 (Session) can run in parallel
- Finally US7 (Mobile) once all components exist

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Setup (create directories, types)
2. Complete Phase 2: Foundational (UI components, hooks skeleton)
3. Complete Phase 3: User Story 1 (View todos - core display)
4. Complete Phase 4: User Story 2 (Create todos)
5. Complete Phase 5: User Story 3 (Toggle completion)
6. **STOP and VALIDATE**: Can view, create, and toggle todos
7. Deploy/demo if ready - this is the MVP!

### Full P1+P2 Delivery

1. Complete MVP (US1-US3)
2. Complete Phase 6: User Story 4 (Edit)
3. Complete Phase 7: User Story 5 (Delete)
4. Complete Phase 8: User Story 6 (Session expiry)
5. **STOP and VALIDATE**: Full CRUD with security handling
6. Deploy/demo if ready

### Complete Feature

1. Complete P1+P2 Delivery (US1-US6)
2. Complete Phase 9: User Story 7 (Mobile responsive)
3. Complete Phase 10: Polish (accessibility, testing)
4. **FINAL VALIDATION**: All stories work, accessible, tested

---

## Task Summary

| Phase | Task Count | Parallel Tasks |
|-------|------------|----------------|
| Setup | 4 | 2 |
| Foundational | 10 | 5 |
| US1 (View) | 8 | 0 |
| US2 (Create) | 6 | 0 |
| US3 (Toggle) | 6 | 0 |
| US4 (Edit) | 6 | 0 |
| US5 (Delete) | 6 | 0 |
| US6 (Session) | 4 | 0 |
| US7 (Mobile) | 6 | 0 |
| Polish | 6 | 1 |
| **Total** | **62** | **8** |

---

## Notes

- All components use Tailwind CSS for styling
- useTodos hook manages all state (todos, loading, error, editing)
- Optimistic updates for toggle (immediate feedback, rollback on error)
- JWT token automatically attached via existing API client
- 404 from API handled in hook error state
- 401 from API triggers redirect to login
- Toast notifications for all user feedback
- Focus on accessibility (ARIA, keyboard nav, focus indicators)
