# Quickstart: Frontend Todo UI

**Feature**: 004-frontend-todo-ui
**Date**: 2026-01-17

## Prerequisites

1. **Backend running** (SPEC-003 complete):
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

2. **Frontend dependencies installed**:
   ```bash
   cd frontend
   npm install
   ```

3. **Environment variables set** in `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters
   BETTER_AUTH_URL=http://localhost:3000
   ```

## Development Server

```bash
cd frontend
npm run dev
```

Access at: http://localhost:3000

## Test Scenarios

### 1. View Todos (US1)

**Setup**: Login as existing user with todos

**Steps**:
1. Navigate to http://localhost:3000/todos
2. Verify todos list appears
3. Verify each todo shows title, completion status, creation date

**Expected**: All user's todos displayed in a list

---

### 2. Create Todo (US2)

**Setup**: Login as authenticated user

**Steps**:
1. Navigate to /todos
2. Fill in title field: "Test todo"
3. Optionally fill description: "Test description"
4. Click submit button

**Expected**:
- New todo appears at top of list
- Success toast notification shown
- Form is cleared

**Validation Test**:
1. Try submitting with empty title
2. Verify validation error appears

---

### 3. Toggle Completion (US3)

**Setup**: Have at least one todo

**Steps**:
1. Click the checkbox/toggle on a todo
2. Observe immediate visual change
3. Refresh page

**Expected**:
- Checkbox toggles immediately (optimistic)
- Todo gets strikethrough when completed
- State persists after refresh

---

### 4. Edit Todo (US4)

**Setup**: Have at least one todo

**Steps**:
1. Click edit button on a todo
2. Modify title or description
3. Save changes

**Expected**:
- Edit form appears (inline or modal)
- Changes saved and displayed
- Success notification shown

---

### 5. Delete Todo (US5)

**Setup**: Have at least one todo

**Steps**:
1. Click delete button on a todo
2. Confirm in dialog

**Expected**:
- Confirmation dialog appears
- Todo removed from list after confirm
- Success notification shown

---

### 6. Session Expiry (US6)

**Setup**: Login, then manually clear session cookie

**Steps**:
1. Clear auth cookies from browser
2. Try to create/update/delete a todo
3. Observe behavior

**Expected**:
- Redirected to /login
- Friendly message about session expiry

---

### 7. Empty State (Edge Case)

**Setup**: Login as user with no todos

**Steps**:
1. Navigate to /todos
2. Observe empty state

**Expected**:
- Friendly message: "No todos yet"
- Call-to-action to create first todo

---

### 8. Mobile Responsiveness (US7)

**Setup**: Use browser dev tools mobile view (320px width)

**Steps**:
1. Navigate to /todos
2. Try all CRUD operations
3. Verify touch targets are adequate (44x44px)

**Expected**:
- Layout adapts to narrow screen
- All interactions work with touch
- No horizontal scrolling

## API Integration Testing

### Manual cURL Tests

```bash
# Get JWT token (use Better Auth session cookie)
# For testing, you can extract from browser Network tab

# List todos
curl -X GET "http://localhost:8000/todos" \
  -H "Authorization: Bearer <your-jwt-token>"

# Create todo
curl -X POST "http://localhost:8000/todos" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test todo", "description": "Optional description"}'

# Update todo
curl -X PATCH "http://localhost:8000/todos/<todo-id>" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete todo
curl -X DELETE "http://localhost:8000/todos/<todo-id>" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Component Test Checklist

| Component | Test Coverage |
|-----------|---------------|
| TodoList | Renders todos, handles empty state |
| TodoItem | Displays todo data, action buttons |
| TodoForm | Validation, submission, loading state |
| TodoToggle | Toggle state, accessibility |
| DeleteDialog | Confirm/cancel, focus trap |
| Toast | Shows/hides, auto-dismiss |

## Accessibility Checklist

- [ ] All interactive elements focusable via Tab
- [ ] Enter/Space activates buttons
- [ ] Escape closes dialogs
- [ ] ARIA labels on all controls
- [ ] Focus indicator visible (ring)
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader announces state changes

## Common Issues

### 1. CORS Error

**Symptom**: API requests fail with CORS error

**Solution**: Ensure backend allows frontend origin:
```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Auth Token Not Attached

**Symptom**: 401 Unauthorized on all requests

**Solution**: Verify `getSessionToken()` returns token:
```typescript
const token = await getSessionToken();
console.log('Token:', token); // Should not be null
```

### 3. Optimistic Update Fails Silently

**Symptom**: UI updates but reverts without error

**Solution**: Check browser console for API errors, verify backend is running

## File Structure After Implementation

```
frontend/src/
├── app/
│   └── todos/
│       ├── page.tsx         # Route, auth check
│       └── loading.tsx      # Suspense fallback
├── components/
│   ├── todos/
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoForm.tsx
│   │   ├── TodoToggle.tsx
│   │   ├── EmptyState.tsx
│   │   └── DeleteDialog.tsx
│   └── ui/
│       ├── Toast.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Dialog.tsx
│       └── Spinner.tsx
├── hooks/
│   ├── useTodos.ts
│   └── useToast.ts
├── types/
│   └── todo.ts
└── services/
    └── api.ts               # Updated with Todo types
```
