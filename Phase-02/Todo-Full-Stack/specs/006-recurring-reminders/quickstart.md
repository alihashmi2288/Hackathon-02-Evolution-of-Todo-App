# Quickstart: Recurring Tasks & Smart Reminders

**Feature**: 006-recurring-reminders
**Date**: 2026-01-23

## Prerequisites

Before implementing this feature, ensure:

1. **SPEC-002 (Authentication)** is complete - user identity required
2. **SPEC-005 (Todo Enhancements)** is complete - due dates, priority, tags working
3. Backend and frontend are running locally
4. Database migrations are up to date

## Environment Setup

### Backend Dependencies

Add to `backend/requirements.txt`:
```
python-dateutil>=2.8.2
pywebpush>=1.14.0
APScheduler>=3.10.4
```

Install:
```bash
cd backend
pip install -r requirements.txt
```

### Backend Environment Variables

Add to `backend/.env`:
```env
# VAPID keys for Web Push (generate once with: python -c "from pywebpush import webpush; print(webpush.generate_vapid_keypair())")
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_CLAIMS_EMAIL=mailto:admin@yourapp.com
```

### Frontend Setup

No new dependencies needed - uses native Web Push API.

Add to `frontend/.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
```

## Database Migrations

After implementing models, generate and run migrations:

```bash
cd backend
alembic revision --autogenerate -m "006 recurring tasks and reminders"
alembic upgrade head
```

## Quick Verification Steps

### 1. Test Recurring Todo Creation

```bash
# Create a daily recurring todo
curl -X POST http://localhost:8000/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Daily standup",
    "due_date": "2026-01-24",
    "is_recurring": true,
    "recurrence": {
      "frequency": "daily"
    }
  }'
```

Expected: Returns todo with `is_recurring: true` and `rrule: "FREQ=DAILY"`

### 2. Test Occurrence Listing

```bash
# List occurrences for next 7 days
curl http://localhost:8000/todos/{todo_id}/occurrences?from_date=2026-01-24&to_date=2026-01-31 \
  -H "Authorization: Bearer $TOKEN"
```

Expected: Returns array of 7 pending occurrences

### 3. Test Reminder Creation

```bash
# Add 1-hour reminder
curl -X POST http://localhost:8000/todos/{todo_id}/reminders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"offset_minutes": -60}'
```

Expected: Returns reminder with `fire_at` = due_date - 1 hour

### 4. Test Push Subscription

```bash
# Get VAPID public key
curl http://localhost:8000/push/vapid-public-key \
  -H "Authorization: Bearer $TOKEN"

# Register subscription (use browser DevTools to get real subscription)
curl -X POST http://localhost:8000/push/subscribe \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }'
```

### 5. Test Notification Center

```bash
# Get unread count
curl http://localhost:8000/notifications/unread-count \
  -H "Authorization: Bearer $TOKEN"

# List notifications
curl http://localhost:8000/notifications?limit=10 \
  -H "Authorization: Bearer $TOKEN"
```

## Implementation Order

### Phase 1: Backend Core (P1)
1. Add recurrence fields to Todo model
2. Create TodoOccurrence model
3. Create Reminder model
4. Create Notification model
5. Implement recurrence generation service (using python-dateutil)

### Phase 2: Backend APIs (P1)
6. Extend POST /todos for recurring support
7. Add GET /todos/{id}/occurrences
8. Add POST/DELETE /todos/{id}/reminders
9. Add GET/PATCH /notifications endpoints

### Phase 3: Frontend Core (P1)
10. Create recurrence selector component
11. Add reminder selector to todo form
12. Create notification center component
13. Display recurring indicator on todos

### Phase 4: Push Notifications (P1)
14. Create service worker for push handling
15. Implement permission request flow
16. Add push subscription endpoints
17. Integrate pywebpush for sending

### Phase 5: Advanced Features (P2)
18. Occurrence complete/skip actions
19. Edit "this only" vs "all future"
20. Snooze reminder functionality
21. User preferences (timezone, defaults)

### Phase 6: Polish (P3)
22. Daily digest implementation
23. End recurring series
24. Mobile-responsive notifications
25. Accessibility improvements

## Key Files to Create/Modify

### Backend
```
backend/app/
├── models/
│   ├── __init__.py          # Export new models
│   ├── todo.py              # Add recurrence fields
│   ├── occurrence.py        # NEW
│   ├── reminder.py          # NEW
│   ├── notification.py      # NEW
│   ├── push_subscription.py # NEW
│   └── user_preferences.py  # NEW
├── routers/
│   ├── todos.py             # Extend for recurrence
│   ├── occurrences.py       # NEW
│   ├── reminders.py         # NEW
│   ├── notifications.py     # NEW
│   └── push.py              # NEW
├── services/
│   ├── recurrence.py        # NEW - RRULE handling
│   ├── reminder.py          # NEW - Reminder scheduling
│   └── notification.py      # NEW - Push sending
└── scheduler.py             # NEW - APScheduler setup
```

### Frontend
```
frontend/src/
├── app/
│   └── sw.js                # NEW - Service worker (in public/)
├── components/
│   ├── todos/
│   │   ├── RecurrenceSelector.tsx  # NEW
│   │   └── ReminderSelector.tsx    # NEW
│   └── notifications/
│       ├── NotificationCenter.tsx  # NEW
│       ├── NotificationBell.tsx    # NEW
│       └── NotificationItem.tsx    # NEW
├── hooks/
│   ├── useNotifications.ts         # NEW
│   └── usePushSubscription.ts      # NEW
├── services/
│   └── push.ts                     # NEW
└── types/
    ├── recurrence.ts               # NEW
    ├── reminder.ts                 # NEW
    └── notification.ts             # NEW
```

## Common Issues & Solutions

### RRULE Parsing Errors
```python
# Always validate RRULE before storing
from dateutil.rrule import rrulestr
try:
    rrulestr(rrule_string)
except ValueError as e:
    raise HTTPException(400, f"Invalid RRULE: {e}")
```

### Push Notification Failures
- Check VAPID keys match between frontend and backend
- Verify HTTPS is enabled (required for service workers)
- Check browser notification permissions

### Timezone Issues
- Always store times in UTC
- Convert to user timezone only for display
- Use `pytz` or `zoneinfo` for timezone-aware datetime operations

## Testing

### Backend Tests
```bash
cd backend
pytest tests/test_recurring.py -v
pytest tests/test_reminders.py -v
pytest tests/test_notifications.py -v
```

### Frontend Tests
```bash
cd frontend
npm run test -- --grep "Recurring"
npm run test -- --grep "Notification"
```

### E2E Tests
```bash
cd frontend
npx playwright test recurring-reminders.spec.ts
```
