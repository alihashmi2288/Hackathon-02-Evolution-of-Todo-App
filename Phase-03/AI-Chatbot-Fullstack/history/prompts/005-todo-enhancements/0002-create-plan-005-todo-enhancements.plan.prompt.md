---
id: 0002
title: Create Plan for SPEC-005 Todo Enhancements
stage: plan
date: 2026-01-18
surface: agent
model: claude-opus-4-5-20251101
feature: 005-todo-enhancements
branch: 005-todo-enhancements
user: alihashmi
command: /sp.plan
labels: ["plan", "todo-enhancements", "due-dates", "priorities", "tags", "search", "filter"]
links:
  spec: specs/005-todo-enhancements/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-todo-enhancements/plan.md
  - specs/005-todo-enhancements/research.md
  - specs/005-todo-enhancements/data-model.md
  - specs/005-todo-enhancements/quickstart.md
  - specs/005-todo-enhancements/contracts/todos-enhanced.yaml
  - specs/005-todo-enhancements/contracts/tags.yaml
  - CLAUDE.md (updated)
tests:
  - N/A (planning phase)
---

## Prompt

/sp.plan

Execute the implementation planning workflow for SPEC-005: Todo Enhancements - Due Dates, Priorities, Tags & Search.

## Response snapshot

Created complete implementation plan for SPEC-005 with all Phase 0 and Phase 1 artifacts:

**Plan.md**: Technical context filled, all 9 Constitution Check gates passed, implementation phases A-F defined, risk analysis completed.

**Research.md (Phase 0)**: 8 research decisions documented:
1. Priority Enum - PostgreSQL native ENUM type
2. Tag Colors - Predefined 8-color palette as hex codes
3. Search - PostgreSQL ILIKE (no full-text search for MVP)
4. Date Picker - Native HTML5 input with progressive enhancement
5. Filter State - URL query params + React state
6. Many-to-Many Tags - Explicit TodoTag junction table
7. Due Date Display - Relative dates (Today, Tomorrow) + absolute
8. API Query Params - Flat params with array support

**Data-model.md (Phase 1)**: Complete entity definitions:
- Todo extended with due_date (DATE), priority (ENUM)
- Tag model with name, color, user_id
- TodoTag junction with cascade delete
- SQLModel code and Alembic migration script

**Contracts (Phase 1)**:
- todos-enhanced.yaml: Extended GET /todos with filter params, enhanced POST/PATCH with new fields
- tags.yaml: Full CRUD endpoints + /tags/suggest for autocomplete

**Quickstart.md (Phase 1)**: Developer setup guide with implementation order, test commands, API examples.

**Agent Context**: CLAUDE.md updated with new technologies.

## Outcome

- Impact: Complete architectural plan ready for task generation
- Tests: N/A (planning phase - tests defined in plan for implementation)
- Files: 6 new files created, 1 file updated (CLAUDE.md)
- Next prompts: /sp.tasks to generate implementation tasks
- Reflection: Comprehensive plan with all research resolved, no NEEDS CLARIFICATION markers

## Evaluation notes (flywheel)

- Failure modes observed: None - all gates passed
- Graders run and results (PASS/FAIL): Constitution Check - ALL PASS (9/9)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
