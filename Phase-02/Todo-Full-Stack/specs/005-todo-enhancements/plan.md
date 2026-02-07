# Implementation Plan: Todo Enhancements - Due Dates, Priorities, Tags & Search

**Branch**: `005-todo-enhancements` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-todo-enhancements/spec.md`

## Summary

This feature extends the existing Todo application with advanced task management capabilities: due dates with overdue/due-soon visual indicators, priority levels (High/Medium/Low), user-created tags with many-to-many relationships, and comprehensive search/filter functionality. The implementation extends the existing FastAPI backend and Next.js frontend while maintaining the established architectural patterns from SPEC-003 and SPEC-004.

## Technical Context

**Language/Version**: Python 3.12 (Backend), TypeScript 5.6+ (Frontend)
**Primary Dependencies**: FastAPI 0.100+, SQLModel, Next.js 16.0.10, React 19.x, Tailwind CSS 3.4+, Better Auth
**Storage**: Neon Serverless PostgreSQL via SQLModel ORM
**Testing**: pytest (Backend), Vitest/Playwright (Frontend)
**Target Platform**: Linux server (Backend), Modern browsers (Frontend)
**Project Type**: Web application (frontend + backend monorepo)
**Performance Goals**: Search results <500ms, filter updates <300ms, 1000 concurrent users
**Constraints**: JWT authentication required, user-scoped data isolation, mobile-responsive UI (320px min)
**Scale/Scope**: Extends existing SPEC-003 Todo CRUD and SPEC-004 Frontend UI

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ PASS | Spec completed (SPEC-005), plan in progress |
| II. Agentic Separation | ✅ PASS | Backend/Frontend agents work in isolation |
| III. Security-First & Zero-Trust | ✅ PASS | JWT required for all endpoints, user_id filtering on all queries |
| IV. API Contract Stability | ✅ PASS | New endpoints extend, don't break existing contract |
| V. Stateless Auth via JWT | ✅ PASS | Existing Better Auth + FastAPI JWT validation |
| VI. Persistent Data Ownership | ✅ PASS | Tags and TodoTags include user_id, all queries filter by user |
| VII. Simplicity & Reviewability | ✅ PASS | Extends existing patterns, no new abstractions |
| VIII. Observable Resilience | ✅ PASS | Structured logging, error taxonomy maintained |
| IX. Deployment & CI/CD Integrity | ✅ PASS | Tests required before deployment |

**Gate Result**: ALL PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/005-todo-enhancements/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI)
│   ├── todos-enhanced.yaml
│   └── tags.yaml
├── checklists/          # Quality validation
│   └── requirements.md
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── models/
│   │   ├── todo.py          # Extended: due_date, priority
│   │   ├── tag.py           # NEW: Tag model
│   │   └── todo_tag.py      # NEW: Junction table
│   ├── services/
│   │   ├── todo.py          # Extended: filtering, sorting, search
│   │   └── tag.py           # NEW: Tag CRUD service
│   ├── routers/
│   │   ├── todos.py         # Extended: filter/sort query params
│   │   └── tags.py          # NEW: Tag management routes
│   └── schemas/
│       ├── todo.py          # Extended: due_date, priority, tags
│       └── tag.py           # NEW: Tag schemas
├── alembic/
│   └── versions/
│       └── xxx_add_enhancements.py  # Migration
└── tests/
    ├── test_todos_enhanced.py
    └── test_tags.py

frontend/
├── src/
│   ├── types/
│   │   ├── todo.ts          # Extended: due_date, priority, tags
│   │   ├── tag.ts           # NEW: Tag types
│   │   └── filters.ts       # NEW: Filter state types
│   ├── services/
│   │   └── api.ts           # Extended: tags endpoints, filter params
│   ├── hooks/
│   │   ├── useTodos.ts      # Extended: filtering, sorting
│   │   ├── useTags.ts       # NEW: Tag management hook
│   │   └── useFilters.ts    # NEW: Filter state hook
│   ├── components/
│   │   ├── todos/
│   │   │   ├── TodoItem.tsx     # Extended: due date, priority, tags display
│   │   │   ├── TodoForm.tsx     # Extended: date picker, priority, tags
│   │   │   └── TodoList.tsx     # Extended: filter panel integration
│   │   ├── filters/
│   │   │   ├── FilterPanel.tsx      # NEW
│   │   │   ├── SearchInput.tsx      # NEW
│   │   │   ├── PriorityFilter.tsx   # NEW
│   │   │   ├── TagFilter.tsx        # NEW
│   │   │   ├── DateRangeFilter.tsx  # NEW
│   │   │   └── SortSelector.tsx     # NEW
│   │   ├── tags/
│   │   │   ├── TagInput.tsx         # NEW: Autocomplete tag input
│   │   │   ├── TagBadge.tsx         # NEW: Display tag
│   │   │   └── TagManager.tsx       # NEW: CRUD tags
│   │   └── ui/
│   │       ├── DatePicker.tsx       # NEW
│   │       └── PrioritySelector.tsx # NEW
│   └── lib/
│       └── date-utils.ts    # NEW: Human-friendly date formatting
└── tests/
    ├── components/
    │   ├── TodoItem.test.tsx
    │   ├── FilterPanel.test.tsx
    │   └── TagInput.test.tsx
    └── e2e/
        └── todo-enhancements.spec.ts
```

**Structure Decision**: Web application structure (Option 2) - extends existing backend/ and frontend/ directories following established patterns from SPEC-003/004.

## Complexity Tracking

> No constitution violations detected. Feature extends existing architecture.

| Decision | Rationale | Simpler Alternative |
|----------|-----------|---------------------|
| Many-to-many tags | Required by spec (multiple tags per todo) | Single tag per todo insufficient |
| Session filter persistence | Spec requirement FR-024 | No persistence would lose user context |

## Phase 0: Research Summary

See [research.md](./research.md) for detailed findings.

**Key Decisions:**
1. **Priority Enum**: PostgreSQL ENUM type for type safety and indexing
2. **Tag Colors**: Predefined palette (8 colors) stored as hex codes
3. **Search**: PostgreSQL ILIKE for case-insensitive search (no full-text search needed for MVP)
4. **Date Picker**: Native HTML5 date input with progressive enhancement
5. **Filter State**: URL query params + React state (session persistence via URL)

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**Entities:**
- **Todo** (extended): +due_date (date, nullable), +priority (enum, nullable)
- **Tag**: id, name (unique per user), color, user_id, timestamps
- **TodoTag**: todo_id, tag_id (composite primary key)

### API Contracts

See [contracts/](./contracts/) for OpenAPI specifications.

**New Endpoints:**
- `GET /tags` - List user's tags
- `POST /tags` - Create tag
- `PATCH /tags/{id}` - Update tag
- `DELETE /tags/{id}` - Delete tag (cascades to todo_tags)

**Extended Endpoints:**
- `GET /todos` - Added query params: search, priority[], tag_ids[], due_before, due_after, sort_by, status
- `POST /todos` - Added body fields: due_date, priority, tag_ids[]
- `PATCH /todos/{id}` - Added body fields: due_date, priority, tag_ids[]

### Quickstart

See [quickstart.md](./quickstart.md) for developer setup guide.

## Implementation Phases

### Phase A: Backend Data Layer
1. Add Priority enum to models
2. Extend Todo model with due_date, priority
3. Create Tag model
4. Create TodoTag junction model
5. Generate Alembic migration
6. Run migration on Neon PostgreSQL

### Phase B: Backend API Layer
1. Extend TodoService with filter/sort logic
2. Create TagService for CRUD operations
3. Extend todo schemas (request/response)
4. Create tag schemas
5. Extend todos router with query params
6. Create tags router
7. Write integration tests

### Phase C: Frontend Types & Services
1. Extend Todo type with due_date, priority, tags
2. Create Tag and Filter types
3. Extend api.todos with filter params
4. Add api.tags endpoints

### Phase D: Frontend UI Components
1. Create DatePicker component
2. Create PrioritySelector component
3. Create TagInput with autocomplete
4. Create TagBadge for display
5. Create TagManager for CRUD
6. Create filter components (Search, Priority, Tags, DateRange, Sort)
7. Create FilterPanel container

### Phase E: Frontend Integration
1. Extend TodoForm with due date, priority, tags
2. Extend TodoItem with visual indicators
3. Extend useTodos hook with filtering/sorting
4. Create useTags hook
5. Create useFilters hook
6. Integrate FilterPanel into TodoList
7. Add session persistence via URL params

### Phase F: Testing & Polish
1. Backend unit tests for new services
2. Backend integration tests for new endpoints
3. Frontend component tests
4. Playwright E2E tests for happy paths
5. Mobile responsiveness testing
6. Accessibility audit

## Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration complexity with existing data | Medium | Migration adds nullable columns with defaults |
| Filter query performance | Medium | Indexes on due_date, priority; limit result sets |
| Tag autocomplete latency | Low | Debounce + cache tags in React state |
| Date timezone issues | Medium | Store as DATE (not DATETIME), display in user's locale |

## Next Steps

Run `/sp.tasks` to generate the detailed task list with test cases.
