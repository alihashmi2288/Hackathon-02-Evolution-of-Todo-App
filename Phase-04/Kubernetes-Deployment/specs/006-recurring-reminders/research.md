# Research: Recurring Tasks & Smart Reminders

**Feature**: 006-recurring-reminders
**Date**: 2026-01-23
**Status**: Complete

## 1. Recurrence Rule Storage & Calculation

### Decision: Use python-dateutil `rrule` for RRULE (RFC 5545) support

**Rationale**:
- Industry-standard iCalendar RRULE format for interoperability
- Python `dateutil.rrule` provides mature, well-tested implementation
- Supports all required patterns: DAILY, WEEKLY, MONTHLY, YEARLY, custom intervals
- Native parsing/serialization of RRULE strings

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Custom recurrence logic | Reinventing the wheel; edge cases in date math are complex |
| Storing materialized dates | Storage-intensive; inflexible for "infinite" series |
| Cron expressions | Less intuitive for end-users; doesn't match calendar patterns |

**Implementation Pattern**:
```python
from dateutil.rrule import rrule, DAILY, WEEKLY, MONTHLY, YEARLY
from dateutil.rrule import rrulestr

# Store as RRULE string in database
rrule_string = "FREQ=WEEKLY;BYDAY=MO,WE,FR;INTERVAL=1"

# Parse and calculate occurrences
rule = rrulestr(rrule_string, dtstart=start_date)
next_occurrences = list(rule[:10])  # Next 10 occurrences
```

**RRULE Field Mapping**:
| UI Option | RRULE |
|-----------|-------|
| Daily | `FREQ=DAILY` |
| Weekly | `FREQ=WEEKLY` |
| Monthly | `FREQ=MONTHLY` |
| Yearly | `FREQ=YEARLY` |
| Every N days | `FREQ=DAILY;INTERVAL=N` |
| Mon/Wed/Fri | `FREQ=WEEKLY;BYDAY=MO,WE,FR` |
| 1st of month | `FREQ=MONTHLY;BYMONTHDAY=1` |
| End after 10 | `COUNT=10` |
| End by date | `UNTIL=20260331` |

---

## 2. Occurrence Generation Strategy

### Decision: Hybrid approach - materialize N future occurrences + generate on-demand

**Rationale**:
- Pure on-demand: Expensive queries to check "what's due today?"
- Pure materialized: Storage explosion for infinite series
- Hybrid: Best of both worlds - fast lookups with bounded storage

**Strategy**:
1. When recurring todo created: generate next 30 days of occurrences (or until end)
2. Background job daily: generate occurrences for next 7 days for all series
3. When occurrence completed: generate next occurrence if within window
4. Store occurrences in separate `todo_occurrences` table linked to parent `todos`

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Pure materialization | Unbounded storage for "forever" series |
| Pure virtual | Expensive queries; complex joins for due date filtering |
| Calendar service integration | Out of scope; adds external dependency |

---

## 3. Push Notification Architecture

### Decision: Web Push API with VAPID, pywebpush for backend

**Rationale**:
- Web Push API is the W3C standard for browser push notifications
- VAPID (Voluntary Application Server Identification) is required for modern browsers
- `pywebpush` is the maintained Python library for sending push notifications
- Service Worker required on frontend for background notification handling

**Architecture**:
```
[Backend: pywebpush] → [Push Service (FCM/Mozilla)] → [Service Worker] → [Browser Notification]
```

**Components**:
1. **Frontend Service Worker**: Receives push events, displays notifications
2. **Frontend Subscription**: Registers with push service, sends subscription to backend
3. **Backend Storage**: Stores push subscriptions per user
4. **Backend Sender**: Uses pywebpush to send messages

**VAPID Keys**:
- Generate once, store in environment variables
- Public key shared with frontend for subscription
- Private key kept secure on backend

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| OneSignal/Pusher | External service dependency; cost at scale |
| WebSocket-only | Requires app to be open; no true push |
| Email notifications | Out of scope for this spec |

---

## 4. Reminder Scheduling

### Decision: Background scheduler (APScheduler) with database-backed job store

**Rationale**:
- Reminders need to fire at specific times regardless of request lifecycle
- APScheduler integrates well with FastAPI
- Database job store survives server restarts
- Supports dynamic job management (add/remove/reschedule)

**Flow**:
1. User sets reminder → Create `reminders` record → Schedule APScheduler job
2. APScheduler fires → Load reminder → Check if still valid → Send notification
3. User modifies todo → Update/cancel scheduled jobs

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Celery Beat | Heavy infrastructure (Redis/RabbitMQ); overkill for this use case |
| Cron jobs | Can't dynamically schedule per-reminder |
| PostgreSQL pg_cron | Limited; not portable |

**Snooze Implementation**:
- Snooze creates a new reminder at (now + snooze_duration)
- Original reminder marked as "snoozed" (not delivered)
- Preserves audit trail of all reminder actions

---

## 5. Notification Center Design

### Decision: Server-side notification storage with polling/SSE for real-time updates

**Rationale**:
- Notifications must persist for review even if push was missed
- In-app notification center needs historical data
- Polling is simpler; SSE can be added later for real-time

**Data Model**:
- `notifications` table with: id, user_id, type, title, body, todo_id, read, created_at
- Types: `reminder`, `daily_digest`, `recurring_due`
- Auto-delete after 30 days (configurable)

**Read/Unread Flow**:
1. Fetch unread count: `GET /notifications/unread-count`
2. Fetch list: `GET /notifications?limit=50`
3. Mark read: `PATCH /notifications/{id}` or `PATCH /notifications/mark-all-read`

---

## 6. Timezone Handling

### Decision: Store user timezone in preferences; calculate all times server-side in user's TZ

**Rationale**:
- Reminders must fire at correct local time ("remind at 9 AM" means 9 AM in user's zone)
- Server stores user's IANA timezone (e.g., "America/New_York")
- All time calculations use `pytz` or `zoneinfo` (Python 3.9+)

**Flow**:
1. User sets timezone in preferences (detected from browser or manual selection)
2. Due dates stored as date (no time component)
3. Reminder times calculated relative to start of day in user's timezone
4. Push notifications include ISO timestamp for frontend display

---

## 7. Frontend Service Worker Strategy

### Decision: Separate service worker for push notifications, registered conditionally

**Rationale**:
- Next.js doesn't have native service worker support (need next-pwa or manual)
- Service worker only needed if user enables push notifications
- Keep service worker minimal: just handle push events

**Implementation**:
1. Create `public/sw.js` for push event handling
2. Register conditionally when user enables push in settings
3. Handle notification click to open app at specific todo

**Service Worker Code Pattern**:
```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      data: { todoId: data.todoId }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const todoId = event.notification.data?.todoId;
  event.waitUntil(
    clients.openWindow(todoId ? `/todos/${todoId}` : '/')
  );
});
```

---

## 8. Database Indexes & Performance

### Decision: Composite indexes for common query patterns

**Key Indexes**:
```sql
-- Occurrences due for a user on a date range
CREATE INDEX idx_occurrences_user_due ON todo_occurrences(user_id, due_date);

-- Pending reminders to fire
CREATE INDEX idx_reminders_fire_time ON reminders(fire_at, status) WHERE status = 'pending';

-- User's notifications (most recent first)
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- Unread notifications count
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE read = false;
```

---

## 9. Dependencies to Add

### Backend (Python):
```
python-dateutil>=2.8.2    # RRULE support
pywebpush>=1.14.0         # Web Push notifications
APScheduler>=3.10.0       # Background job scheduling
pytz>=2023.3              # Timezone handling (or use stdlib zoneinfo)
```

### Frontend (Node):
```
No new dependencies needed - using Web Push API (browser native)
```

---

## 10. Security Considerations

1. **Push Subscriptions**: Store endpoint URLs securely; don't expose in API responses
2. **VAPID Keys**: Private key in environment only; never commit to repo
3. **Reminder Access**: Only allow users to manage reminders for their own todos
4. **Rate Limiting**: Limit reminder creation (max 5 per todo) and push frequency
5. **Notification Content**: Don't include sensitive data in push payload (title only)

---

## Summary of Technical Decisions

| Area | Decision |
|------|----------|
| Recurrence storage | RRULE strings (RFC 5545) |
| Recurrence library | python-dateutil rrule |
| Occurrence strategy | Hybrid: materialize 30 days + generate on-demand |
| Push notifications | Web Push API + VAPID + pywebpush |
| Reminder scheduler | APScheduler with PostgreSQL job store |
| Notification storage | Server-side with polling |
| Timezone handling | User preference + pytz |
| Service worker | Minimal, push-only, conditional registration |
