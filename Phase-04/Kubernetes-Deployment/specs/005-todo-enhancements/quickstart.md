# Quickstart: Todo Enhancements

**Feature**: 005-todo-enhancements
**Date**: 2026-01-18

This guide helps developers get started with implementing the todo enhancements feature.

## Prerequisites

- Existing SPEC-003 (Todo CRUD) and SPEC-004 (Frontend Todo UI) completed
- Backend running with existing todo endpoints
- Frontend running with existing todo components
- Neon PostgreSQL database with existing `todos` table

## Setup Steps

### 1. Backend Setup

#### 1.1 Create New Model Files

```bash
cd backend/app/models
touch priority.py tag.py todo_tag.py
```

#### 1.2 Run Database Migration

```bash
cd backend
# Generate migration
alembic revision --autogenerate -m "add_todo_enhancements"

# Review the generated migration in alembic/versions/
# Edit if needed to match data-model.md specifications

# Run migration
alembic upgrade head
```

#### 1.3 Verify Migration

```sql
-- Connect to Neon PostgreSQL and verify:
\d+ todos          -- Should show due_date and priority columns
\d+ tags           -- New table
\d+ todo_tags      -- New junction table
\dt                -- List all tables
```

#### 1.4 Install Dependencies (if any new)

```bash
cd backend
pip install -r requirements.txt
```

### 2. Frontend Setup

#### 2.1 Create Type Files

```bash
cd frontend/src/types
touch tag.ts filters.ts
```

#### 2.2 Create Component Directories

```bash
cd frontend/src/components
mkdir -p filters tags
```

#### 2.3 Create Utility Files

```bash
cd frontend/src/lib
touch date-utils.ts
```

## Implementation Order

Follow this order for minimal merge conflicts:

### Phase A: Backend Data Layer (Days 1-2)
1. `backend/app/models/priority.py` - Priority enum
2. `backend/app/models/tag.py` - Tag model
3. `backend/app/models/todo_tag.py` - Junction table
4. `backend/app/models/todo.py` - Add new fields
5. `backend/app/models/__init__.py` - Export new models
6. Generate and run Alembic migration

### Phase B: Backend API Layer (Days 2-3)
1. `backend/app/schemas/tag.py` - Tag schemas
2. `backend/app/schemas/todo.py` - Extend with new fields
3. `backend/app/services/tag.py` - Tag CRUD service
4. `backend/app/services/todo.py` - Add filtering/sorting
5. `backend/app/routers/tags.py` - Tag endpoints
6. `backend/app/routers/todos.py` - Add query params
7. `backend/tests/test_tags.py` - Tag tests
8. `backend/tests/test_todos_enhanced.py` - Enhanced todo tests

### Phase C: Frontend Types & Services (Day 3)
1. `frontend/src/types/todo.ts` - Extend types
2. `frontend/src/types/tag.ts` - New types
3. `frontend/src/types/filters.ts` - Filter state types
4. `frontend/src/services/api.ts` - Add tag endpoints, filter params

### Phase D: Frontend UI Components (Days 4-5)
1. `frontend/src/lib/date-utils.ts` - Date formatting
2. `frontend/src/components/ui/DatePicker.tsx`
3. `frontend/src/components/ui/PrioritySelector.tsx`
4. `frontend/src/components/tags/TagBadge.tsx`
5. `frontend/src/components/tags/TagInput.tsx`
6. `frontend/src/components/tags/TagManager.tsx`
7. `frontend/src/components/filters/SearchInput.tsx`
8. `frontend/src/components/filters/PriorityFilter.tsx`
9. `frontend/src/components/filters/TagFilter.tsx`
10. `frontend/src/components/filters/DateRangeFilter.tsx`
11. `frontend/src/components/filters/SortSelector.tsx`
12. `frontend/src/components/filters/FilterPanel.tsx`

### Phase E: Frontend Integration (Days 5-6)
1. `frontend/src/hooks/useTags.ts` - Tag management hook
2. `frontend/src/hooks/useFilters.ts` - Filter state hook
3. `frontend/src/hooks/useTodos.ts` - Extend with filtering
4. `frontend/src/components/todos/TodoForm.tsx` - Add new fields
5. `frontend/src/components/todos/TodoItem.tsx` - Display new fields
6. `frontend/src/components/todos/TodoList.tsx` - Integrate filter panel

### Phase F: Testing & Polish (Days 6-7)
1. Backend integration tests
2. Frontend component tests
3. E2E tests with Playwright
4. Mobile responsiveness testing
5. Accessibility audit

## Quick Test Commands

### Backend

```bash
cd backend

# Run all tests
pytest

# Run specific test file
pytest tests/test_tags.py -v

# Run with coverage
pytest --cov=app tests/

# Test single endpoint manually
curl -X GET "http://localhost:8000/tags" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Frontend

```bash
cd frontend

# Run dev server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Type check
npm run typecheck
```

## API Testing Examples

### Create a Tag

```bash
curl -X POST "http://localhost:8000/tags" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "work", "color": "#3B82F6"}'
```

### Create Todo with Enhancements

```bash
curl -X POST "http://localhost:8000/todos" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review PR",
    "due_date": "2026-01-20",
    "priority": "high",
    "tag_ids": ["tag_id_here"]
  }'
```

### Filter Todos

```bash
# Search + priority filter
curl -X GET "http://localhost:8000/todos?search=meeting&priority=high&priority=medium" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Date range filter
curl -X GET "http://localhost:8000/todos?due_after=2026-01-01&due_before=2026-01-31" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Multiple filters combined
curl -X GET "http://localhost:8000/todos?status=active&priority=high&tag=abc123&sort=due_date" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Common Issues & Solutions

### Migration Fails

If migration fails with enum errors:
```sql
-- Check if enum exists
SELECT * FROM pg_type WHERE typname = 'priority_enum';

-- Manually create if needed
CREATE TYPE priority_enum AS ENUM ('high', 'medium', 'low');
```

### Tag Name Conflict

409 error on tag creation means the name already exists (case-insensitive). Query existing tags first or catch the error and suggest the existing tag.

### Date Timezone Issues

- Backend stores dates as `DATE` (no timezone)
- Frontend should send `YYYY-MM-DD` format
- Display formatting should use `toLocaleDateString()` for user's locale

### Filter State Lost on Refresh

Ensure `useFilters` hook reads from URL search params on initial load:
```tsx
const searchParams = useSearchParams();
// Initialize state from URL params
```

## Key Files Reference

| Purpose | Backend | Frontend |
|---------|---------|----------|
| Priority enum | `app/models/priority.py` | `types/todo.ts` |
| Tag model | `app/models/tag.py` | `types/tag.ts` |
| Tag service | `app/services/tag.py` | `services/api.ts` |
| Tag routes | `app/routers/tags.py` | - |
| Filter logic | `app/services/todo.py` | `hooks/useFilters.ts` |
| Date formatting | - | `lib/date-utils.ts` |
| UI components | - | `components/filters/`, `components/tags/` |

## Related Documents

- [Specification](./spec.md) - Feature requirements
- [Data Model](./data-model.md) - Database schema
- [API Contracts](./contracts/) - OpenAPI specifications
- [Research](./research.md) - Design decisions
