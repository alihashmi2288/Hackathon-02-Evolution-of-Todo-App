# Tasks: Core Todo Functionality

**Feature**: Core Todo Functionality
**Branch**: `001-core-todo-functionality`
**Created**: 2025-12-30
**Input**: Feature specification from `specs/001-core-todo-functionality/spec.md`
**Plan**: Implementation plan from `specs/001-core-todo-functionality/plan.md`

## Dependency Graph

```
Phase 1: Setup (Prerequisites)
    |
    v
Phase 2: Foundational (Blocking - all stories depend on this)
    |
    +---> Phase 3: US1 Add Task (P1) --+
    |                                   |
    +---> Phase 4: US2 View Tasks (P1) -+
    |                                   |
    +---> Phase 5: US3 Mark Complete (P1)
    |
    +---> Phase 6: US4 Update Task (P2) [depends on US1]
    |
    +---> Phase 7: US5 Delete Task (P2) [depends on US1]
    |
    v
Phase 8: Polish & Cross-Cutting
```

## Implementation Strategy

**MVP Scope**: Phase 3 (US1 - Add Task) + Phase 2 (Foundational)
- Basic add task functionality with in-memory storage
- Simple CLI interaction

**Incremental Delivery**:
1. MVP (US1): Add tasks, view list
2. US3: Mark complete
3. US4 + US5: Update and delete
4. Polish: Validation, UX improvements

## Phase 1: Setup

**Goal**: Initialize project structure and dependencies

**Independent Test Criteria**: Project can be initialized with UV, pytest runs successfully

### Tasks

- [X] T001 Create project directory structure per plan.md: `src/models/`, `src/services/`, `src/cli/`, `tests/`
- [X] T002 Initialize Python package files: `src/__init__.py`, `src/models/__init__.py`, `src/services/__init__.py`, `src/cli/__init__.py`, `tests/__init__.py`
- [X] T003 Initialize pytest configuration in `pyproject.toml` or `pytest.ini`

## Phase 2: Foundational

**Goal**: Create core data model and storage layer (blocking for all user stories)

**Independent Test Criteria**: Task dataclass works correctly, TodoService can store and retrieve tasks

### Tasks

- [X] T010 [P] Create Task dataclass in `src/models/task.py` with id (UUID), title (str), completed (bool)
- [X] T011 [P] Create TodoService class in `src/services/__init__.py` with in-memory storage (list of Task objects)
- [X] T012 [P] Implement task addition method in TodoService: `add_task(title: str) -> Task`
- [X] T013 [P] Implement task listing method in TodoService: `list_tasks() -> List[Task]`
- [X] T014 [P] Implement task lookup by ID method in TodoService: `get_task(task_id: UUID) -> Task | None`

## Phase 3: User Story 1 - Add a New Task (P1)

**Goal**: Users can add new tasks with a title

**Independent Test Criteria**: Running add command creates a task that appears in the list

**Story Dependencies**: None (depends only on Phase 2)

### Tasks

- [X] T020 [US1] Create CLI input handler in `src/cli/__init__.py` for add command
- [X] T021 [US1] Implement add_task CLI function that prompts for title and calls TodoService.add_task()
- [X] T022 [US1] Add input validation: reject empty titles with error message

## Phase 4: User Story 2 - View All Tasks (P1)

**Goal**: Users can see all tasks with their status

**Independent Test Criteria**: All added tasks are visible with correct status (pending/completed)

**Story Dependencies**: None (depends only on Phase 2)

### Tasks

- [X] T030 [US2] Implement view_tasks CLI function that displays all tasks from TodoService.list_tasks()
- [X] T031 [US2] Format task display: show ID, title, and status (pending/completed)
- [X] T032 [US2] Handle empty list case: display "No tasks available" message

## Phase 5: User Story 3 - Mark Task as Completed (P1)

**Goal**: Users can mark tasks as completed

**Independent Test Criteria**: Task status changes from pending to completed when marked

**Story Dependencies**: None (depends only on Phase 2)

### Tasks

- [X] T040 [US3] Implement mark_complete method in TodoService: `mark_complete(task_id: UUID) -> bool`
- [X] T041 [US3] Create CLI input handler for mark complete command
- [X] T042 [US3] Implement mark_complete CLI function that prompts for task ID and calls TodoService.mark_complete()
- [X] T043 [US3] Handle not-found error: "Task not found" message for invalid IDs

## Phase 6: User Story 4 - Update an Existing Task (P2)

**Goal**: Users can update task titles

**Independent Test Criteria**: Task title changes when updated

**Story Dependencies**: Requires US1 (tasks must exist to update)

### Tasks

- [X] T050 [US4] Implement update_task method in TodoService: `update_task(task_id: UUID, new_title: str) -> bool`
- [X] T051 [US4] Create CLI input handler for update command
- [X] T052 [US4] Implement update_task CLI function that prompts for task ID and new title
- [X] T053 [US4] Handle not-found error and empty title validation

## Phase 7: User Story 5 - Delete a Task (P2)

**Goal**: Users can remove unwanted tasks

**Independent Test Criteria**: Deleted task no longer appears in view

**Story Dependencies**: Requires US1 (tasks must exist to delete)

### Tasks

- [X] T060 [US5] Implement delete_task method in TodoService: `delete_task(task_id: UUID) -> bool`
- [X] T061 [US5] Create CLI input handler for delete command
- [X] T062 [US5] Implement delete_task CLI function that prompts for task ID
- [X] T063 [US5] Handle not-found error: "Task not found" message for invalid IDs

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Complete CLI UX and validation improvements

**Independent Test Criteria**: All features work end-to-end, invalid inputs handled gracefully

### Tasks

- [X] T070 Create main.py entry point with CLI menu loop
- [X] T071 Implement menu options: 1-Add, 2-View, 3-Update, 4-Delete, 5-Complete, 6-Exit
- [X] T072 Add input validation for menu selection (reject non-numeric, out-of-range)
- [X] T073 Add validation for task title length limits
- [X] T074 Add handling for special characters in task titles (trim whitespace)
- [X] T075 Review code for PEP 8 compliance and clean code principles
- [X] T076 [UX] Review CLI messages for user-friendliness
- [X] T077 [UX] Display tasks with numbers (1, 2, 3...) alongside IDs for easy selection

## Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 24 |
| **Phase 1 (Setup)** | 3 tasks |
| **Phase 2 (Foundational)** | 5 tasks |
| **Phase 3 (US1 - Add)** | 3 tasks |
| **Phase 4 (US2 - View)** | 3 tasks |
| **Phase 5 (US3 - Complete)** | 4 tasks |
| **Phase 6 (US4 - Update)** | 4 tasks |
| **Phase 7 (US5 - Delete)** | 4 tasks |
| **Phase 8 (Polish)** | 7 tasks |

## Parallel Execution Opportunities

Within each phase, the following tasks can run in parallel:

- **Phase 2**: T010, T011, T012, T013, T014 (all independent services/components)
- **Phase 3**: All tasks depend on Phase 2, no internal parallelism needed
- **Phase 4**: All tasks depend on Phase 2, no internal parallelism needed
- **Phase 5**: All tasks depend on Phase 2, no internal parallelism needed

## File Paths Reference

```
src/
├── __init__.py
├── models/
│   ├── __init__.py
│   └── task.py              # T010
├── services/
│   ├── __init__.py          # T011, T012, T013, T014, T040, T050, T060
├── cli/
│   ├── __init__.py          # T020, T021, T022, T030, T031, T032, T041, T042, T043, T051, T052, T053, T061, T062, T063
└── main.py                  # T070, T071, T072
tests/
├── __init__.py
└── test_task.py             # (not generated - TDD not requested)
```
