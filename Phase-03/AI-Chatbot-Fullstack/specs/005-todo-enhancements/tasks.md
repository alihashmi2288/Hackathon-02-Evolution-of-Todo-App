# Tasks: Todo Enhancements - Due Dates, Priorities, Tags & Search

**Input**: Design documents from `/specs/005-todo-enhancements/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shared model infrastructure

- [ ] T001 [P] Create Priority enum in backend/app/models/priority.py
- [ ] T002 [P] Create Tag model in backend/app/models/tag.py
- [ ] T003 [P] Create TodoTag junction model in backend/app/models/todo_tag.py
- [ ] T004 Extend Todo model with due_date and priority fields in backend/app/models/todo.py
- [ ] T005 Update models __init__.py to export new models in backend/app/models/__init__.py
- [ ] T006 Generate Alembic migration for schema changes in backend/alembic/versions/
- [ ] T007 Run migration and verify database schema

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 [P] Create TagCreate and TagUpdate schemas in backend/app/schemas/tag.py
- [ ] T009 [P] Create TagResponse schema with todo_count in backend/app/schemas/tag.py
- [ ] T010 Extend TodoCreate schema with due_date, priority, tag_ids in backend/app/schemas/todo.py
- [ ] T011 Extend TodoUpdate schema with due_date, priority, tag_ids in backend/app/schemas/todo.py
- [ ] T012 Extend TodoResponse schema to include tags array in backend/app/schemas/todo.py
- [ ] T013 [P] Create TagService with CRUD operations in backend/app/services/tag.py
- [ ] T014 [P] Extend Todo type with due_date, priority, tags in frontend/src/types/todo.ts
- [ ] T015 [P] Create Tag and TagCreate/TagUpdate types in frontend/src/types/tag.ts
- [ ] T016 [P] Create FilterState type in frontend/src/types/filters.ts
- [ ] T017 Add api.tags endpoints (list, create, update, delete, suggest) in frontend/src/services/api.ts
- [ ] T018 [P] Create date-utils.ts with formatDueDate and getDueDateStatus in frontend/src/lib/date-utils.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Set Due Dates on Todos (Priority: P1) 🎯 MVP

**Goal**: Users can set optional due dates on todos with visual indicators for overdue/due-soon items

**Independent Test**: Create a todo with a due date, verify it displays in human-friendly format, confirm overdue highlighting works

### Backend Implementation for US1

- [ ] T019 [US1] Add due_date filtering logic to TodoService.get_todos() in backend/app/services/todo.py
- [ ] T020 [US1] Add due_date handling to TodoService.create_todo() in backend/app/services/todo.py
- [ ] T021 [US1] Add due_date handling to TodoService.update_todo() in backend/app/services/todo.py
- [ ] T022 [US1] Add due_before and due_after query params to GET /todos in backend/app/routers/todos.py
- [ ] T023 [US1] Update POST /todos to accept due_date in backend/app/routers/todos.py
- [ ] T024 [US1] Update PATCH /todos/{id} to accept due_date in backend/app/routers/todos.py

### Frontend Implementation for US1

- [ ] T025 [P] [US1] Create DatePicker component in frontend/src/components/ui/DatePicker.tsx
- [ ] T026 [US1] Add due date input to TodoForm in frontend/src/components/todos/TodoForm.tsx
- [ ] T027 [US1] Display due date with human-friendly format in TodoItem in frontend/src/components/todos/TodoItem.tsx
- [ ] T028 [US1] Add overdue (red) highlighting to TodoItem in frontend/src/components/todos/TodoItem.tsx
- [ ] T029 [US1] Add due-soon (yellow) highlighting to TodoItem in frontend/src/components/todos/TodoItem.tsx
- [ ] T030 [US1] Add due date editing capability to TodoItem edit mode in frontend/src/components/todos/TodoItem.tsx
- [ ] T031 [US1] Update useTodos hook to handle due_date in create/update in frontend/src/hooks/useTodos.ts

**Checkpoint**: User Story 1 complete - users can set due dates and see visual indicators

---

## Phase 4: User Story 2 - Prioritize Todos (Priority: P1)

**Goal**: Users can assign priority levels (High/Medium/Low) with color-coded visual indicators

**Independent Test**: Create todos with different priorities, verify visual indicators display correctly

### Backend Implementation for US2

- [ ] T032 [US2] Add priority filtering logic to TodoService.get_todos() in backend/app/services/todo.py
- [ ] T033 [US2] Add priority handling to TodoService.create_todo() in backend/app/services/todo.py
- [ ] T034 [US2] Add priority handling to TodoService.update_todo() in backend/app/services/todo.py
- [ ] T035 [US2] Add priority query param (array) to GET /todos in backend/app/routers/todos.py
- [ ] T036 [US2] Update POST /todos to accept priority in backend/app/routers/todos.py
- [ ] T037 [US2] Update PATCH /todos/{id} to accept priority in backend/app/routers/todos.py

### Frontend Implementation for US2

- [ ] T038 [P] [US2] Create PrioritySelector component in frontend/src/components/ui/PrioritySelector.tsx
- [ ] T039 [US2] Add priority selector to TodoForm in frontend/src/components/todos/TodoForm.tsx
- [ ] T040 [US2] Display priority indicator (color badge) in TodoItem in frontend/src/components/todos/TodoItem.tsx
- [ ] T041 [US2] Add priority editing to TodoItem edit mode in frontend/src/components/todos/TodoItem.tsx
- [ ] T042 [US2] Update useTodos hook to handle priority in create/update in frontend/src/hooks/useTodos.ts

**Checkpoint**: User Story 2 complete - users can set priorities with visual indicators

---

## Phase 5: User Story 3 - Organize Todos with Tags (Priority: P2)

**Goal**: Users can create custom tags and assign multiple tags to todos

**Independent Test**: Create tags, assign to todos, verify color-coded badges display, test tag management

### Backend Implementation for US3

- [ ] T043 [US3] Implement tag suggestion endpoint (prefix search) in backend/app/services/tag.py
- [ ] T044 [US3] Add tag_ids handling to TodoService.create_todo() (link tags) in backend/app/services/todo.py
- [ ] T045 [US3] Add tag_ids handling to TodoService.update_todo() (replace tags) in backend/app/services/todo.py
- [ ] T046 [US3] Add tags eager loading to TodoService.get_todos() in backend/app/services/todo.py
- [ ] T047 [US3] Add tags eager loading to TodoService.get_todo_by_id() in backend/app/services/todo.py
- [ ] T048 [US3] Create tags router with CRUD endpoints in backend/app/routers/tags.py
- [ ] T049 [US3] Add /tags/suggest endpoint for autocomplete in backend/app/routers/tags.py
- [ ] T050 [US3] Register tags router in main app in backend/app/main.py
- [ ] T051 [US3] Update POST /todos to accept tag_ids in backend/app/routers/todos.py
- [ ] T052 [US3] Update PATCH /todos/{id} to accept tag_ids in backend/app/routers/todos.py

### Frontend Implementation for US3

- [ ] T053 [P] [US3] Create TagBadge component for display in frontend/src/components/tags/TagBadge.tsx
- [ ] T054 [P] [US3] Create TagInput component with autocomplete in frontend/src/components/tags/TagInput.tsx
- [ ] T055 [US3] Create TagManager component for CRUD in frontend/src/components/tags/TagManager.tsx
- [ ] T056 [US3] Create useTags hook for tag state management in frontend/src/hooks/useTags.ts
- [ ] T057 [US3] Add tag input to TodoForm in frontend/src/components/todos/TodoForm.tsx
- [ ] T058 [US3] Display tag badges in TodoItem in frontend/src/components/todos/TodoItem.tsx
- [ ] T059 [US3] Add tag editing to TodoItem edit mode in frontend/src/components/todos/TodoItem.tsx
- [ ] T060 [US3] Update useTodos hook to handle tag_ids in create/update in frontend/src/hooks/useTodos.ts
- [ ] T061 [US3] Add tag management access (button/modal) to TodoList in frontend/src/components/todos/TodoList.tsx

**Checkpoint**: User Story 3 complete - users can create, assign, and manage tags

---

## Phase 6: User Story 4 - Search and Filter Todos (Priority: P2)

**Goal**: Users can search by text and filter by status, priority, tags, and due date range

**Independent Test**: Create multiple todos, use search and filters to locate specific items

### Backend Implementation for US4

- [ ] T062 [US4] Add search logic (ILIKE on title/description) to TodoService in backend/app/services/todo.py
- [ ] T063 [US4] Add status filter (all/active/completed) to TodoService in backend/app/services/todo.py
- [ ] T064 [US4] Add tag_ids filter to TodoService.get_todos() in backend/app/services/todo.py
- [ ] T065 [US4] Add combined filter logic (AND) to TodoService in backend/app/services/todo.py
- [ ] T066 [US4] Add search query param to GET /todos in backend/app/routers/todos.py
- [ ] T067 [US4] Add status query param to GET /todos in backend/app/routers/todos.py
- [ ] T068 [US4] Add tag query param (array) to GET /todos in backend/app/routers/todos.py

### Frontend Implementation for US4

- [ ] T069 [P] [US4] Create SearchInput component with debounce in frontend/src/components/filters/SearchInput.tsx
- [ ] T070 [P] [US4] Create StatusFilter component in frontend/src/components/filters/StatusFilter.tsx
- [ ] T071 [P] [US4] Create PriorityFilter component (multi-select) in frontend/src/components/filters/PriorityFilter.tsx
- [ ] T072 [P] [US4] Create TagFilter component (multi-select) in frontend/src/components/filters/TagFilter.tsx
- [ ] T073 [P] [US4] Create DateRangeFilter component in frontend/src/components/filters/DateRangeFilter.tsx
- [ ] T074 [US4] Create FilterPanel container component in frontend/src/components/filters/FilterPanel.tsx
- [ ] T075 [US4] Create useFilters hook with URL sync in frontend/src/hooks/useFilters.ts
- [ ] T076 [US4] Add active filter count display to FilterPanel in frontend/src/components/filters/FilterPanel.tsx
- [ ] T077 [US4] Add "Clear all filters" button to FilterPanel in frontend/src/components/filters/FilterPanel.tsx
- [ ] T078 [US4] Extend api.todos.list() to accept filter params in frontend/src/services/api.ts
- [ ] T079 [US4] Integrate FilterPanel into TodoList in frontend/src/components/todos/TodoList.tsx
- [ ] T080 [US4] Update useTodos to use filter params from useFilters in frontend/src/hooks/useTodos.ts
- [ ] T081 [US4] Add "No results" empty state when filters return zero in frontend/src/components/todos/TodoList.tsx

**Checkpoint**: User Story 4 complete - users can search and filter todos

---

## Phase 7: User Story 5 - Sort Todos (Priority: P3)

**Goal**: Users can sort todos by due date or priority

**Independent Test**: Create todos with varied due dates and priorities, sort by each criterion

### Backend Implementation for US5

- [ ] T082 [US5] Add sort_by logic (due_date, priority, created_at) to TodoService in backend/app/services/todo.py
- [ ] T083 [US5] Handle nulls-last for due_date sorting in backend/app/services/todo.py
- [ ] T084 [US5] Handle priority ordering (high>medium>low>null) in backend/app/services/todo.py
- [ ] T085 [US5] Add sort query param to GET /todos in backend/app/routers/todos.py

### Frontend Implementation for US5

- [ ] T086 [P] [US5] Create SortSelector component in frontend/src/components/filters/SortSelector.tsx
- [ ] T087 [US5] Add SortSelector to FilterPanel in frontend/src/components/filters/FilterPanel.tsx
- [ ] T088 [US5] Add sort_by to useFilters hook in frontend/src/hooks/useFilters.ts
- [ ] T089 [US5] Update api.todos.list() to accept sort param in frontend/src/services/api.ts

**Checkpoint**: User Story 5 complete - users can sort todos by due date or priority

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T090 [P] Add mobile-responsive styling to FilterPanel in frontend/src/components/filters/FilterPanel.tsx
- [ ] T091 [P] Add mobile-responsive styling to TodoItem (compact view) in frontend/src/components/todos/TodoItem.tsx
- [ ] T092 Add keyboard navigation to TagInput autocomplete in frontend/src/components/tags/TagInput.tsx
- [ ] T093 Add ARIA labels to filter components in frontend/src/components/filters/
- [ ] T094 Add loading states during filter changes in frontend/src/components/todos/TodoList.tsx
- [ ] T095 Add error handling for tag operations in frontend/src/hooks/useTags.ts
- [ ] T096 Validate quickstart.md scenarios work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - Due Dates
- **User Story 2 (Phase 4)**: Depends on Foundational - Priority Levels
- **User Story 3 (Phase 5)**: Depends on Foundational - Tags
- **User Story 4 (Phase 6)**: Depends on US1, US2, US3 (uses all filter criteria)
- **User Story 5 (Phase 7)**: Depends on US1, US2 (sorts by due_date, priority)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

```
                    ┌─────────────────┐
                    │  Phase 1: Setup │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │Phase 2: Foundation│
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
┌─────────▼─────────┐ ┌──────▼──────┐ ┌────────▼────────┐
│ US1: Due Dates P1 │ │US2: Priority│ │  US3: Tags P2   │
└─────────┬─────────┘ │    P1       │ └────────┬────────┘
          │           └──────┬──────┘          │
          │                  │                 │
          └──────────────────┼─────────────────┘
                             │
                    ┌────────▼────────┐
                    │US4: Search/Filter│
                    │       P2        │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  US5: Sort P3   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Phase 8: Polish │
                    └─────────────────┘
```

### Within Each User Story

- Backend models/schemas before services
- Backend services before routers
- Frontend types before components
- Frontend components before hooks integration
- Core implementation before polish

### Parallel Opportunities

**Phase 1 (Setup)**:
- T001, T002, T003 can run in parallel (different model files)

**Phase 2 (Foundational)**:
- T008, T009 (tag schemas) parallel with T010, T011, T012 (todo schemas)
- T013 (TagService) parallel with T014-T018 (frontend types)

**User Stories 1-3 can run in parallel after Foundation**:
- US1 (Due Dates), US2 (Priority), US3 (Tags) have no dependencies on each other
- Different team members can work on different stories

**Within US4 (Search/Filter)**:
- T069-T073 can all run in parallel (different filter components)

---

## Parallel Example: User Story 1

```bash
# Launch backend tasks in sequence:
T019 → T020 → T021 → T022 → T023 → T024

# Launch frontend component in parallel with backend:
T025 (DatePicker - no dependencies)

# After backend and T025 complete:
T026 → T027 → T028 → T029 → T030 → T031
```

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all schema tasks in parallel:
T008, T009, T010, T011, T012

# Launch service and types in parallel:
T013, T014, T015, T016, T017, T018
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Due Dates)
4. Complete Phase 4: User Story 2 (Priority)
5. **STOP and VALIDATE**: Test due dates and priorities work
6. Deploy/demo if ready - this is a usable MVP!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Due Dates) → Deploy/Demo
3. Add US2 (Priority) → Deploy/Demo
4. Add US3 (Tags) → Deploy/Demo
5. Add US4 (Search/Filter) → Deploy/Demo
6. Add US5 (Sort) → Deploy/Demo
7. Polish → Final release

### Parallel Team Strategy

With 3 developers after Foundational phase:
- Developer A: User Story 1 (Due Dates)
- Developer B: User Story 2 (Priority)
- Developer C: User Story 3 (Tags)

Then converge for User Story 4 (Search/Filter) which uses all three.

---

## Summary

| Phase | User Story | Tasks | Parallelizable |
|-------|------------|-------|----------------|
| 1 | Setup | 7 | 3 |
| 2 | Foundational | 11 | 8 |
| 3 | US1: Due Dates (P1) | 13 | 1 |
| 4 | US2: Priority (P1) | 11 | 1 |
| 5 | US3: Tags (P2) | 19 | 2 |
| 6 | US4: Search/Filter (P2) | 20 | 5 |
| 7 | US5: Sort (P3) | 8 | 1 |
| 8 | Polish | 7 | 2 |
| **Total** | | **96** | **23** |

**MVP Scope**: Phases 1-4 (US1 + US2) = 42 tasks
**Suggested Start**: Phase 1 → Phase 2 → Parallel US1/US2/US3 → Sequential US4 → US5 → Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Tests were NOT requested in spec, so test tasks are not included
