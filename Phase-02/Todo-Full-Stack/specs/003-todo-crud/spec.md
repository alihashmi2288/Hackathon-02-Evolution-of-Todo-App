# Feature Specification: Todo CRUD Operations

**Feature Branch**: `003-todo-crud`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description: "Define RESTful API endpoints for a multi-user Todo application with JWT authentication and owner-only access"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a New Todo (Priority: P1)

As an authenticated user, I want to create a new todo item so that I can track tasks I need to complete.

**Why this priority**: Creating todos is the core action - without it, the app has no value. This is the foundation of all todo management.

**Independent Test**: Can be fully tested by sending a POST request with valid todo data and verifying the todo is created and returned with an ID.

**Acceptance Scenarios**:

1. **Given** I am authenticated, **When** I submit a new todo with a title, **Then** the system creates the todo and returns it with a unique ID and timestamps
2. **Given** I am authenticated, **When** I submit a todo without a title, **Then** the system rejects the request with a validation error
3. **Given** I am not authenticated, **When** I try to create a todo, **Then** the system returns an authentication error

---

### User Story 2 - View My Todos (Priority: P1)

As an authenticated user, I want to view all my todos so that I can see what tasks I have.

**Why this priority**: Viewing todos is essential for task management - users need to see their tasks to act on them.

**Independent Test**: Can be fully tested by requesting the todo list and verifying only the authenticated user's todos are returned.

**Acceptance Scenarios**:

1. **Given** I am authenticated and have todos, **When** I request my todo list, **Then** the system returns only my todos (not other users' todos)
2. **Given** I am authenticated and have no todos, **When** I request my todo list, **Then** the system returns an empty list
3. **Given** I am not authenticated, **When** I try to view todos, **Then** the system returns an authentication error

---

### User Story 3 - Update a Todo (Priority: P1)

As an authenticated user, I want to update my todo (title, description, completed status) so that I can modify task details or mark tasks as done.

**Why this priority**: Updating todos (especially marking complete) is core functionality for task management.

**Independent Test**: Can be fully tested by sending a PATCH request with updated fields and verifying the todo is modified.

**Acceptance Scenarios**:

1. **Given** I am authenticated and own a todo, **When** I update its title, **Then** the system saves the change and returns the updated todo
2. **Given** I am authenticated and own a todo, **When** I mark it as completed, **Then** the system updates the completed status to true
3. **Given** I am authenticated, **When** I try to update another user's todo, **Then** the system returns a not found error (does not reveal existence)
4. **Given** I am authenticated, **When** I try to update a non-existent todo, **Then** the system returns a not found error

---

### User Story 4 - Delete a Todo (Priority: P2)

As an authenticated user, I want to delete a todo so that I can remove tasks I no longer need.

**Why this priority**: Deletion is important but secondary to create/read/update operations.

**Independent Test**: Can be fully tested by sending a DELETE request and verifying the todo no longer exists.

**Acceptance Scenarios**:

1. **Given** I am authenticated and own a todo, **When** I delete it, **Then** the system removes the todo and confirms deletion
2. **Given** I am authenticated, **When** I try to delete another user's todo, **Then** the system returns a not found error
3. **Given** I am authenticated, **When** I try to delete a non-existent todo, **Then** the system returns a not found error

---

### User Story 5 - View a Single Todo (Priority: P2)

As an authenticated user, I want to view a specific todo by its ID so that I can see its full details.

**Why this priority**: Useful for detailed views but listing todos covers most use cases.

**Independent Test**: Can be fully tested by requesting a specific todo ID and verifying the correct todo is returned.

**Acceptance Scenarios**:

1. **Given** I am authenticated and own a todo, **When** I request it by ID, **Then** the system returns the full todo details
2. **Given** I am authenticated, **When** I request another user's todo, **Then** the system returns a not found error
3. **Given** I am authenticated, **When** I request a non-existent todo, **Then** the system returns a not found error

---

### Edge Cases

- What happens when a user submits a todo with an extremely long title? System enforces a maximum length of 255 characters and returns validation error
- What happens when a user submits a todo with empty/whitespace-only title? System rejects with validation error
- What happens when the database is unavailable? System returns a 503 service unavailable error
- What happens when a user provides an invalid todo ID format? System returns a 400 bad request error

## Requirements *(mandatory)*

### Functional Requirements

**API Endpoints**:
- **FR-001**: System MUST provide `GET /todos` endpoint to list all todos for the authenticated user
- **FR-002**: System MUST provide `POST /todos` endpoint to create a new todo for the authenticated user
- **FR-003**: System MUST provide `GET /todos/{id}` endpoint to retrieve a specific todo by ID
- **FR-004**: System MUST provide `PATCH /todos/{id}` endpoint to partially update a todo
- **FR-005**: System MUST provide `DELETE /todos/{id}` endpoint to remove a todo

**Authentication & Authorization**:
- **FR-006**: All endpoints MUST require a valid JWT token in the Authorization header
- **FR-007**: System MUST extract user identity from the JWT token (not from URL parameters)
- **FR-008**: System MUST only return/modify todos owned by the authenticated user
- **FR-009**: System MUST return 404 (not 403) when accessing another user's todo to prevent information disclosure

**Data Validation**:
- **FR-010**: System MUST require a non-empty title when creating a todo
- **FR-011**: System MUST enforce a maximum title length of 255 characters
- **FR-012**: System MUST allow description to be optional (nullable)
- **FR-013**: System MUST default completed status to false when creating a todo

**Response Behavior**:
- **FR-014**: System MUST return 201 Created with the todo data when successfully creating a todo
- **FR-015**: System MUST return 200 OK with todo data for successful GET/PATCH operations
- **FR-016**: System MUST return 204 No Content for successful DELETE operations
- **FR-017**: System MUST return 400 Bad Request for validation errors with descriptive messages
- **FR-018**: System MUST return 401 Unauthorized for missing or invalid JWT tokens
- **FR-019**: System MUST return 404 Not Found when todo does not exist or user doesn't own it

**Timestamps**:
- **FR-020**: System MUST automatically set created_at when a todo is created
- **FR-021**: System MUST automatically update updated_at when a todo is modified

### Key Entities

- **Todo**: Represents a task item owned by a user
  - id (text, primary key): Unique identifier for the todo
  - title (string, required): Brief description of the task (max 255 chars)
  - description (string, optional): Detailed information about the task
  - completed (boolean, default false): Whether the task is done
  - user_id (text, required): Owner of the todo (from JWT)
  - created_at (timestamp): When the todo was created
  - updated_at (timestamp): When the todo was last modified

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authenticated users can create a todo and receive a response in under 500ms
- **SC-002**: Authenticated users can retrieve their todo list in under 500ms for up to 100 todos
- **SC-003**: 100% of requests without valid JWT tokens are rejected with 401 status
- **SC-004**: 100% of attempts to access another user's todos result in 404 status (not 403)
- **SC-005**: All CRUD operations correctly persist data and are immediately consistent
- **SC-006**: Users can successfully complete the full todo lifecycle (create → read → update → delete)

## Assumptions

- JWT authentication is already implemented (SPEC-002: Auth & Identity)
- User identity (user_id, email) is available from the validated JWT token
- Database and connection pooling are already configured
- Error response format follows existing error taxonomy from SPEC-001

## Out of Scope

- Filtering todos by status (all/active/completed) - future enhancement
- Sorting todos - future enhancement
- Pagination for large todo lists - future enhancement
- Due dates and priorities - future enhancement
- Todo sharing between users - future enhancement
- Frontend UI implementation - separate spec
