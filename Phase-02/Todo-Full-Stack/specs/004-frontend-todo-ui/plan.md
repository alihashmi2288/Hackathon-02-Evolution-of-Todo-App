# Implementation Plan: Frontend Todo UI & Secure API Integration

**Branch**: `004-frontend-todo-ui` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-frontend-todo-ui/spec.md`

## Summary

Implement a responsive, accessible Todo UI in Next.js 16.0.10 with secure API integration to the FastAPI backend. The frontend will display todos, support CRUD operations with optimistic updates, handle authentication state, and provide excellent user feedback through loading states, toast notifications, and error handling.

## Technical Context

**Language/Version**: TypeScript 5.6+, Next.js 16.0.10 (App Router)
**Primary Dependencies**: React 19.x, Tailwind CSS 3.4+, Better Auth (JWT)
**Storage**: N/A (backend handles persistence via SPEC-003)
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (frontend focus for this spec)
**Performance Goals**: <200ms optimistic UI updates, <2s initial page load
**Constraints**: Mobile-first (320px minimum), accessible (WCAG 2.1 AA), stateless auth
**Scale/Scope**: <100 todos per user (no pagination needed per SPEC-003)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | ✅ PASS | spec.md complete with 34 FRs, 7 user stories |
| II. Agentic Separation | ✅ PASS | Frontend-only implementation, clear boundaries |
| III. Security-First | ✅ PASS | JWT tokens attached to all API requests, 401 redirects |
| IV. API Contract Stability | ✅ PASS | Using existing backend API from SPEC-003 |
| V. Stateless Auth | ✅ PASS | JWT tokens from Better Auth, no server sessions |
| VI. Data Ownership | ✅ PASS | Backend enforces user_id filtering, frontend passes JWT |
| VII. Simplicity | ✅ PASS | Standard React patterns, no unnecessary abstractions |
| VIII. Observable Resilience | ✅ PASS | Error boundaries, structured error handling |
| IX. CI/CD Integrity | ✅ PASS | Vitest unit tests, Playwright E2E tests planned |

## Project Structure

### Documentation (this feature)

```text
specs/004-frontend-todo-ui/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output - technology decisions
├── data-model.md        # Phase 1 output - TypeScript interfaces
├── quickstart.md        # Phase 1 output - developer guide
├── contracts/           # Phase 1 output - API client types
│   └── todo-api.ts      # TypeScript API types
├── checklists/          # Validation checklists
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /sp.tasks)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Auth routes (exists)
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── todos/               # NEW: Todo routes
│   │   │   ├── page.tsx         # Todo list page
│   │   │   └── loading.tsx      # Loading state
│   │   ├── api/auth/            # Better Auth handler (exists)
│   │   ├── layout.tsx           # Root layout (exists)
│   │   └── page.tsx             # Home page (exists)
│   ├── components/
│   │   ├── auth/                # Auth components (exists)
│   │   ├── todos/               # NEW: Todo components
│   │   │   ├── TodoList.tsx     # Main list component
│   │   │   ├── TodoItem.tsx     # Single todo display
│   │   │   ├── TodoForm.tsx     # Create/edit form
│   │   │   ├── TodoToggle.tsx   # Completion toggle
│   │   │   ├── EmptyState.tsx   # No todos message
│   │   │   └── DeleteDialog.tsx # Delete confirmation
│   │   └── ui/                  # NEW: Shared UI components
│   │       ├── Toast.tsx        # Toast notifications
│   │       ├── Button.tsx       # Button component
│   │       ├── Input.tsx        # Input component
│   │       ├── Dialog.tsx       # Modal dialog
│   │       └── Spinner.tsx      # Loading spinner
│   ├── hooks/                   # NEW: Custom hooks
│   │   ├── useTodos.ts          # Todo state management
│   │   └── useToast.ts          # Toast notifications
│   ├── lib/
│   │   ├── auth.ts              # Better Auth client (exists)
│   │   ├── auth-server.ts       # Server-side auth (exists)
│   │   └── env.ts               # Environment vars (exists)
│   ├── services/
│   │   └── api.ts               # API client (exists, needs update)
│   └── types/                   # NEW: Type definitions
│       └── todo.ts              # Todo interfaces
└── tests/                       # NEW: Test files
    ├── unit/
    │   └── components/
    └── e2e/
        └── todos.spec.ts
```

**Structure Decision**: Extends existing Next.js 16.0.10 frontend with new Todo module. Component-based architecture with custom hooks for state management. API client already exists and will be enhanced with proper types.

## Complexity Tracking

> No constitution violations - standard frontend CRUD implementation

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| State Management | React hooks (useState + custom hooks) | Simple enough for <100 todos, no Redux needed |
| Form Library | Native controlled components | Simple forms, no complex validation needed |
| UI Components | Custom + Tailwind | Lightweight, full control, no component library needed |

## Implementation Architecture

### Component Hierarchy

```
TodosPage (Server Component - route protection)
└── TodoList (Client Component)
    ├── TodoForm (Client Component - create)
    ├── EmptyState (Client Component - when no todos)
    └── TodoItem[] (Client Component)
        ├── TodoToggle (completion checkbox)
        ├── TodoContent (title, description)
        └── TodoActions (edit, delete buttons)
            └── DeleteDialog (modal confirmation)
```

### State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    useTodos Hook                             │
│  - todos: Todo[]                                             │
│  - isLoading: boolean                                        │
│  - error: string | null                                      │
│  - createTodo(data)                                          │
│  - updateTodo(id, data)                                      │
│  - deleteTodo(id)                                            │
│  - toggleComplete(id)                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Client (services/api.ts)              │
│  - Automatic JWT token attachment                            │
│  - Error handling with ApiClientError                        │
│  - 401 detection for auth redirects                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (SPEC-003)                │
│  - GET /todos, POST /todos                                   │
│  - GET /todos/{id}, PATCH /todos/{id}, DELETE /todos/{id}    │
└─────────────────────────────────────────────────────────────┘
```

### Optimistic Update Pattern

```
User Action → Optimistic UI Update → API Call
                    │                    │
                    │                    ├── Success: Keep state
                    │                    └── Failure: Revert state + Show error
                    │
                    └── Immediate visual feedback
```

## Subagent Strategy

| Phase | Agent | Responsibility |
|-------|-------|----------------|
| UI Components | `frontend-phase2-lead,must use frontend-designskill` | React components, Tailwind styling |
| API Integration | `nextjs-frontend` | API client types, hooks |
| Accessibility | Manual review | ARIA labels, keyboard navigation |
| Testing | `test-automator` | Vitest unit tests, Playwright E2E |
| Security Review | `security-auditor` | JWT handling, XSS prevention |

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JWT token not refreshed | Low | Medium | Better Auth handles refresh automatically |
| Race condition on rapid toggles | Medium | Low | Debounce toggle clicks, disable during request |
| XSS via todo content | Low | High | React auto-escapes, avoid dangerouslySetInnerHTML |

## Definition of Done

- [ ] Todo list page displays all user's todos
- [ ] Create todo form with validation
- [ ] Edit todo inline or modal
- [ ] Delete with confirmation dialog
- [ ] Toggle completion with optimistic update
- [ ] Empty state for new users
- [ ] Loading states during API calls
- [ ] Error handling with toast notifications
- [ ] 401 redirects to login
- [ ] Responsive design (320px+)
- [ ] Keyboard navigation
- [ ] ARIA labels for accessibility
- [ ] Unit tests for components
- [ ] E2E tests for happy path
