# Research: Frontend Todo UI & Secure API Integration

**Feature**: 004-frontend-todo-ui
**Date**: 2026-01-17
**Status**: Complete

## Research Questions

### 1. State Management Approach

**Question**: What state management solution should be used for todo list operations?

**Decision**: React hooks with custom `useTodos` hook

**Rationale**:
- Application is simple (single resource type, <100 items)
- No complex state sharing needed between distant components
- React 19.x hooks are performant and well-supported
- Custom hook provides clean abstraction for CRUD operations
- Avoids additional dependencies (Redux, Zustand, Jotai)

**Alternatives Considered**:
| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Redux Toolkit | Industry standard, time-travel debugging | Boilerplate, overkill for simple app | Too complex for <100 todos |
| Zustand | Simple API, small bundle | Another dependency | Custom hook sufficient |
| TanStack Query | Caching, optimistic updates built-in | Learning curve, dependency | Simple fetch + state sufficient |

### 2. UI Component Library

**Question**: Should we use a component library (shadcn/ui, Radix, Chakra) or custom components?

**Decision**: Custom components with Tailwind CSS

**Rationale**:
- Full control over styling and behavior
- No additional bundle size
- Consistent with existing codebase (no libraries installed)
- Simple UI needs (buttons, inputs, dialogs)
- Tailwind already configured

**Alternatives Considered**:
| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| shadcn/ui | Beautiful, accessible | Setup overhead, copy-paste model | Overkill for simple components |
| Radix UI | Unstyled, accessible primitives | Additional dependency | Can build accessible ourselves |
| Headless UI | Tailwind integration | Limited components | Not needed for basic UI |

### 3. Form Handling

**Question**: Should we use a form library (React Hook Form, Formik)?

**Decision**: Native controlled components with manual validation

**Rationale**:
- Only two fields per form (title, description)
- Simple validation rules (required, max length)
- No complex form state or dynamic fields
- Keeps bundle small

**Alternatives Considered**:
| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| React Hook Form | Performant, uncontrolled | Dependency, learning curve | 2 fields don't need it |
| Formik | Popular, full-featured | Heavy, legacy API | Overkill for simple forms |
| Zod + RHF | Type-safe validation | Two dependencies | Simple validation is enough |

### 4. Toast/Notification System

**Question**: How should success/error notifications be implemented?

**Decision**: Custom Toast component with React Context

**Rationale**:
- Full control over styling and animation
- No additional dependencies
- Can be reused across the app
- Simple requirements (show/hide message)

**Implementation Pattern**:
```typescript
// ToastContext provides: showToast(message, type)
// Toast displays at top-right, auto-dismisses after 3s
// Types: success (green), error (red), info (blue)
```

### 5. Optimistic Updates Strategy

**Question**: How should optimistic updates be implemented for toggling completion?

**Decision**: Immediate UI update with rollback on failure

**Pattern**:
```typescript
const toggleComplete = async (id: string) => {
  const todo = todos.find(t => t.id === id);
  const previousState = todo.completed;

  // Optimistic update
  setTodos(prev => prev.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  ));

  try {
    await api.todos.update(id, { completed: !previousState });
  } catch (error) {
    // Rollback on failure
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, completed: previousState } : t
    ));
    showToast('Failed to update todo', 'error');
  }
};
```

**Rationale**:
- Immediate feedback (200ms requirement from spec)
- Simple rollback pattern
- User sees instant response
- Error case handled gracefully

### 6. Authentication State Handling

**Question**: How should 401 responses be handled?

**Decision**: Centralized error handler in API client with redirect

**Implementation**:
```typescript
// In api.ts error handling
if (response.status === 401) {
  // Clear session and redirect
  window.location.href = '/login?error=session_expired';
}
```

**Rationale**:
- Single point of handling for all API calls
- Consistent behavior across the app
- Query param can show user-friendly message on login page

### 7. Route Protection

**Question**: How should the /todos route be protected from unauthenticated users?

**Decision**: Server Component check with redirect

**Implementation**:
```typescript
// app/todos/page.tsx (Server Component)
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-server';

export default async function TodosPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return <TodoList />;
}
```

**Rationale**:
- Server-side check before any client code runs
- SEO-friendly (no flash of content)
- Uses existing auth-server utilities
- Consistent with Next.js 16.0.10 patterns

### 8. Accessibility Implementation

**Question**: What accessibility features are required?

**Decision**: WCAG 2.1 AA compliance with keyboard navigation

**Requirements**:
- All interactive elements focusable via Tab
- Enter/Space to activate buttons and toggles
- Escape to close dialogs
- ARIA labels for screen readers
- Focus trap in modal dialogs
- Visible focus indicators (Tailwind `focus:ring`)

**Key ARIA attributes**:
```tsx
// Todo toggle
<input
  type="checkbox"
  role="checkbox"
  aria-checked={todo.completed}
  aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
/>

// Delete dialog
<dialog role="alertdialog" aria-labelledby="dialog-title" aria-modal="true">
```

## Technology Summary

| Concern | Technology | Rationale |
|---------|------------|-----------|
| Framework | Next.js 16.0.10 | Project requirement |
| Styling | Tailwind CSS 3.4+ | Already configured |
| State | React hooks + custom useTodos | Simple, no dependencies |
| Forms | Controlled components | 2 fields, simple validation |
| Toasts | Custom context + component | Full control |
| Auth | Better Auth (existing) | JWT token injection |
| API Client | Existing api.ts | Enhanced with types |

## Next Steps

1. Generate data-model.md with TypeScript interfaces
2. Generate contracts/todo-api.ts with API types
3. Generate quickstart.md with developer guide
4. Proceed to /sp.tasks for implementation
