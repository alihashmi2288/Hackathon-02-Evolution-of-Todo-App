# Feature Specification: Core Todo Functionality

**Feature Branch**: `001-core-todo-functionality`
**Created**: 2025-12-30
**Status**: Draft
**Input**: User description: "core todo functionality Specification: Phase-1 In-Memory Todo Console App

Objective:
Build a simple Python command-line todo application that stores tasks in memory.

Functional Requirements:
1. User can add a new task with a title.
2. User can view all tasks.
3. User can update an existing task.
4. User can delete a task.
5. User can mark a task as completed.

Non-Functional Requirements:
- Console-based interface only
- Clear and user-friendly CLI messages
- Graceful handling of invalid input
- Clean separation between CLI and business logic

Constraints:
- No file system usage
- No database usage
- No external APIs
- Python 3.13+

Acceptance Criteria:
- App runs from terminal
- All 5 features work correctly
- Data resets on program restart"

## Clarifications

### Session 2025-12-30

- Q: How does system handle duplicate task titles? → A: Task titles are NOT unique; users reference tasks by unique ID.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add a New Task (Priority: P1)

As a user, I want to add new tasks with a title so that I can capture things I need to do.

**Why this priority**: Task creation is the fundamental entry point; without it, no other features are usable.

**Independent Test**: Can be fully tested by running the add command with a task title and verifying the task appears in the list with a "pending" status.

**Acceptance Scenarios**:

1. **Given** no tasks exist, **When** user adds a task "Buy groceries", **Then** task "Buy groceries" is created with pending status.
2. **Given** tasks exist, **When** user adds a task "Pay bills", **Then** task "Pay bills" is created and appears in the task list.
3. **Given** user provides empty title, **When** user attempts to add task, **Then** app shows error message and no task is created.

---

### User Story 2 - View All Tasks (Priority: P1)

As a user, I want to see all my tasks so that I can review what needs to be done.

**Why this priority**: Visibility into task state is required for any task management workflow.

**Independent Test**: Can be fully tested by adding multiple tasks and verifying they all appear in the view output with their correct status.

**Acceptance Scenarios**:

1. **Given** tasks exist with various statuses, **When** user requests to view tasks, **Then** all tasks are displayed with title and completion status.
2. **Given** no tasks exist, **When** user requests to view tasks, **Then** a message indicating no tasks are available is displayed.
3. **Given** tasks exist, **When** user views tasks, **Then** pending tasks are distinguished from completed tasks.

---

### User Story 3 - Mark Task as Completed (Priority: P1)

As a user, I want to mark tasks as completed so that I can track my progress.

**Why this priority**: Completing tasks is the core value proposition of a todo app.

**Independent Test**: Can be fully tested by creating a task, marking it complete, and verifying status changes to completed.

**Acceptance Scenarios**:

1. **Given** task "Buy groceries" is pending, **When** user marks it as completed, **Then** task status changes to completed.
2. **Given** task is already completed, **When** user marks it as completed again, **Then** app confirms it is already complete or handles gracefully.

---

### User Story 4 - Update an Existing Task (Priority: P2)

As a user, I want to update task titles so that I can correct mistakes or refine my plans.

**Why this priority**: Important for maintenance but not required for basic productivity; users can delete and re-add if needed.

**Independent Test**: Can be fully tested by creating a task, updating its title, and verifying the new title appears.

**Acceptance Scenarios**:

1. **Given** task "Buy grocieres" exists, **When** user updates title to "Buy groceries", **Then** task displays new title.
2. **Given** task does not exist, **When** user attempts to update it, **Then** error message is displayed.

---

### User Story 5 - Delete a Task (Priority: P2)

As a user, I want to remove unwanted tasks so that my list stays relevant.

**Why this priority**: Cleanup capability improves usability but delete-and-recreate is a workaround.

**Independent Test**: Can be fully tested by creating a task, deleting it, and verifying it no longer appears in view.

**Acceptance Scenarios**:

1. **Given** task exists, **When** user deletes the task, **Then** task is removed from the system.
2. **Given** task does not exist, **When** user attempts to delete it, **Then** error message is displayed.

---

### Edge Cases

- What happens when user attempts to update or delete a non-existent task?
- Duplicate task titles are allowed; tasks are identified by unique ID.
- What happens when user provides very long task titles?
- How does the system handle special characters in task titles?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to add a new task with a title.
- **FR-002**: System MUST allow users to view all tasks with their completion status.
- **FR-003**: System MUST allow users to update an existing task's title.
- **FR-004**: System MUST allow users to delete a task.
- **FR-005**: System MUST allow users to mark a task as completed.
- **FR-006**: System MUST display clear, user-friendly messages for all operations.
- **FR-007**: System MUST handle invalid input gracefully with appropriate error messages.
- **FR-008**: System MUST maintain separation between CLI interface and business logic.

### Key Entities

- **Task**: Represents a single todo item.
  - `title`: The task description (string, required)
  - `completed`: Boolean flag indicating if task is done (default: false)
  - `id`: Unique identifier for reference (implicit, required for Update/Delete/Mark operations)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can perform all 5 core operations (Add, View, Update, Delete, Mark Complete) within a single terminal session.
- **SC-002**: 100% of user actions result in clear, appropriate feedback (success confirmation or error message).
- **SC-003**: All invalid inputs are handled gracefully without app crashes.
- **SC-004**: Data persists only within the current program session and resets on restart (in-memory constraint).

## Assumptions

- Tasks are stored in a Python list or dictionary in memory.
- Task identification for Update/Delete/Mark operations uses a unique ID assigned at creation.
- Viewing tasks displays them in creation order or a stable, predictable order.
- CLI interface uses standard input/output for interaction.
