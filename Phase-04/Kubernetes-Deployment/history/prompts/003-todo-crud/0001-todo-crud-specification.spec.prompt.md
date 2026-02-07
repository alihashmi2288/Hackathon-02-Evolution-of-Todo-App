---
id: "0001"
title: "Todo CRUD Specification"
stage: spec
date: 2026-01-17
surface: agent
model: claude-opus-4-5-20251101
feature: 003-todo-crud
branch: 003-todo-crud
user: alihashmi
command: /sp.specify
labels: ["todo", "crud", "api", "rest", "specification"]
links:
  spec: specs/003-todo-crud/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-todo-crud/spec.md
  - specs/003-todo-crud/checklists/requirements.md
tests:
  - null
---

## Prompt

Write SPEC-003: Todo CRUD Operations.

Define RESTful API endpoints for a multi-user Todo application.

This spec must:
- Define all endpoints (user inferred from JWT, NOT in URL):
  GET    /todos           - List user's todos
  POST   /todos           - Create new todo
  GET    /todos/{id}      - Get single todo
  PATCH  /todos/{id}      - Update todo (partial)
  DELETE /todos/{id}      - Delete todo

- Define Todo model fields:
  - id (text, primary key)
  - title (required, string)
  - description (optional, string)
  - completed (boolean, default false)
  - created_at, updated_at (timestamps)
  - user_id (text, owner from JWT)

- Define request/response schemas
- Define HTTP status codes (200, 201, 400, 401, 403, 404)
- Define error responses per existing error taxonomy
- Require JWT authentication on all endpoints
- Enforce owner-only access (user can only see/edit their own todos)

Do NOT include UI implementation details.

## Response snapshot

Created SPEC-003: Todo CRUD Operations specification with:

**5 User Stories** (prioritized):
- US1: Create Todo (P1) - Core functionality
- US2: View Todos (P1) - Essential for task management
- US3: Update Todo (P1) - Including mark complete
- US4: Delete Todo (P2) - Secondary operation
- US5: View Single Todo (P2) - Detail view

**21 Functional Requirements** covering:
- API endpoints (FR-001 to FR-005)
- Authentication & authorization (FR-006 to FR-009)
- Data validation (FR-010 to FR-013)
- Response behavior (FR-014 to FR-019)
- Timestamps (FR-020 to FR-021)

**Key Security Decisions**:
- User ID from JWT only (not URL) - prevents IDOR
- Return 404 (not 403) for unauthorized access - prevents info disclosure
- All endpoints require valid JWT

**6 Measurable Success Criteria** - technology-agnostic

## Outcome

- ✅ Impact: Complete specification for Todo CRUD API ready for planning phase
- 🧪 Tests: N/A - spec phase (no code)
- 📁 Files: 2 files created (spec.md, checklists/requirements.md)
- 🔁 Next prompts: `/sp.plan` to create implementation architecture
- 🧠 Reflection: User correctly identified security issue with user_id in URL pattern; spec now follows security best practices

## Evaluation notes (flywheel)

- Failure modes observed: None - all checklist items passed
- Graders run and results (PASS/FAIL): Checklist validation PASS (all items)
- Prompt variant (if applicable): Corrected URL pattern from /api/{user_id}/tasks to /todos
- Next experiment (smallest change to try): Proceed to /sp.plan phase
