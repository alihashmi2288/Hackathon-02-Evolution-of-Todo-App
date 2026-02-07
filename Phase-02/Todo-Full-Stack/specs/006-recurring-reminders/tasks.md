# Tasks: Recurring Tasks & Smart Reminders

**Input**: Design documents from `/specs/006-recurring-reminders/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested in spec - tests are optional but recommended.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/` for source, `backend/tests/` for tests
- **Frontend**: `frontend/src/` for source, `frontend/public/` for static assets

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and environment configuration

- [x] T001 Add python-dateutil, pywebpush, APScheduler to backend/requirements.txt
- [x] T002 [P] Add VAPID environment variables to backend/.env.example (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_CLAIMS_EMAIL)
- [x] T003 [P] Add NEXT_PUBLIC_VAPID_PUBLIC_KEY to frontend/.env.example
- [x] T004 [P] Create frontend types for recurrence in frontend/src/types/recurrence.ts
- [x] T005 [P] Create frontend types for reminders in frontend/src/types/reminder.ts
- [x] T006 [P] Create frontend types for notifications in frontend/src/types/notification.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models, services, and infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Models

- [x] T007 Add recurrence fields to Todo model (is_recurring, rrule, recurrence_end_date, recurrence_count, occurrences_generated) in backend/app/models/todo.py
- [x] T008 [P] Create OccurrenceStatus enum in backend/app/models/enums.py
- [x] T009 [P] Create ReminderStatus enum in backend/app/models/enums.py
- [x] T010 [P] Create NotificationType enum in backend/app/models/enums.py
- [x] T011 Create TodoOccurrence model in backend/app/models/occurrence.py
- [x] T012 [P] Create Reminder model in backend/app/models/reminder.py
- [x] T013 [P] Create Notification model in backend/app/models/notification.py
- [x] T014 [P] Create PushSubscription model in backend/app/models/push_subscription.py
- [x] T015 [P] Create UserPreferences model in backend/app/models/user_preferences.py
- [x] T016 Export new models from backend/app/models/__init__.py

### Database Migrations

- [x] T017 Generate Alembic migration for recurrence fields on todos table
- [x] T018 Generate Alembic migration for todo_occurrences table
- [x] T019 [P] Generate Alembic migration for reminders table
- [x] T020 [P] Generate Alembic migration for notifications table
- [x] T021 [P] Generate Alembic migration for push_subscriptions table
- [x] T022 [P] Generate Alembic migration for user_preferences table
- [ ] T023 Run all migrations and verify database schema

### Core Services

- [x] T024 Create RecurrenceService with RRULE parsing/generation in backend/app/services/recurrence.py
- [x] T025 Create NotificationService for creating in-app notifications in backend/app/services/notification.py
- [x] T026 [P] Create PushService for sending web push notifications in backend/app/services/push.py
- [x] T027 Create ReminderService for scheduling/firing reminders in backend/app/services/reminder.py
- [x] T028 Setup APScheduler integration in backend/app/scheduler.py

### Backend Schemas

- [x] T029 Create RecurrenceConfig Pydantic schema in backend/app/schemas/recurrence.py
- [x] T030 [P] Extend TodoCreate/TodoUpdate schemas for recurrence in backend/app/schemas/todo.py
- [x] T031 [P] Create OccurrenceResponse schema in backend/app/schemas/occurrence.py
- [x] T032 [P] Create ReminderCreate/ReminderResponse schemas in backend/app/schemas/reminder.py
- [x] T033 [P] Create NotificationResponse/NotificationListResponse schemas in backend/app/schemas/notification.py
- [x] T034 [P] Create PushSubscriptionCreate/Response schemas in backend/app/schemas/push_subscription.py
- [x] T035 [P] Create UserPreferencesUpdate/Response schemas in backend/app/schemas/user_preferences.py

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Create Basic Recurring Todo (Priority: P1) 🎯 MVP

**Goal**: Users can create todos with simple recurrence (daily, weekly, monthly, yearly) that auto-regenerate

**Independent Test**: Create a daily recurring todo, complete today's instance, verify tomorrow's instance is generated

### Backend Implementation for US1

- [x] T036 [US1] Extend POST /todos to accept is_recurring and recurrence config in backend/app/routers/todos.py
- [x] T037 [US1] Implement RRULE generation from RecurrenceConfig in RecurrenceService
- [x] T038 [US1] Implement initial occurrence generation (30 days) on recurring todo creation in RecurrenceService
- [x] T039 [US1] Add GET /todos/{todo_id}/occurrences endpoint in backend/app/routers/occurrences.py
- [x] T040 [US1] Register occurrences router in backend/app/main.py
- [x] T041 [US1] Extend TodoResponse to include recurrence fields in backend/app/schemas/todo.py

### Frontend Implementation for US1

- [x] T042 [US1] Create RecurrenceSelector component with frequency dropdown in frontend/src/components/todos/RecurrenceSelector.tsx
- [x] T043 [US1] Integrate RecurrenceSelector into TodoForm in frontend/src/components/todos/TodoForm.tsx
- [x] T044 [US1] Create RecurringIndicator component (icon/badge) in frontend/src/components/todos/RecurringIndicator.tsx
- [x] T045 [US1] Display RecurringIndicator on TodoItem for recurring todos in frontend/src/components/todos/TodoItem.tsx
- [x] T046 [US1] Update useTodos hook to handle recurrence in create mutation in frontend/src/hooks/useTodos.ts
- [x] T047 [US1] Add API service function for fetching occurrences in frontend/src/services/api.ts

**Checkpoint**: US1 complete - users can create basic recurring todos

---

## Phase 4: User Story 2 - Set Reminder for Todo (Priority: P1)

**Goal**: Users can add time-based reminders to todos and receive notifications

**Independent Test**: Set 1-hour reminder on a todo, wait for fire time, verify notification appears

### Backend Implementation for US2

- [x] T048 [US2] Create reminders router skeleton in backend/app/routers/reminders.py
- [x] T049 [US2] Implement POST /todos/{todo_id}/reminders endpoint (create reminder)
- [x] T050 [US2] Implement GET /todos/{todo_id}/reminders endpoint (list reminders)
- [x] T051 [US2] Implement DELETE /reminders/{reminder_id} endpoint
- [x] T052 [US2] Implement reminder fire_at calculation from due_date + offset in ReminderService
- [x] T053 [US2] Implement APScheduler job for firing pending reminders in backend/app/scheduler.py
- [x] T054 [US2] Create in-app notification when reminder fires in NotificationService
- [x] T055 [US2] Register reminders router in backend/app/main.py
- [x] T056 [US2] Add max 5 reminders per todo validation in ReminderService

### Frontend Implementation for US2

- [x] T057 [US2] Create ReminderSelector component with offset presets in frontend/src/components/todos/ReminderSelector.tsx
- [x] T058 [US2] Integrate ReminderSelector into TodoForm (only shown when due_date set)
- [x] T059 [US2] Create useReminders hook for reminder CRUD in frontend/src/hooks/useReminders.ts
- [x] T060 [US2] Display active reminders on TodoItem in frontend/src/components/todos/TodoItem.tsx

**Checkpoint**: US2 complete - users can set reminders on todos

---

## Phase 5: User Story 3 - View and Manage Notifications (Priority: P1)

**Goal**: Users can view all notifications in a notification center with read/unread status

**Independent Test**: Trigger several reminders, open notification center, verify all appear with correct status

### Backend Implementation for US3

- [ ] T061 [US3] Create notifications router skeleton in backend/app/routers/notifications.py
- [ ] T062 [US3] Implement GET /notifications endpoint (list with pagination)
- [ ] T063 [US3] Implement GET /notifications/unread-count endpoint
- [ ] T064 [US3] Implement PATCH /notifications/{id} endpoint (mark read)
- [ ] T065 [US3] Implement POST /notifications/mark-all-read endpoint
- [ ] T066 [US3] Implement DELETE /notifications/{id} endpoint
- [ ] T067 [US3] Register notifications router in backend/app/main.py

### Frontend Implementation for US3

- [ ] T068 [US3] Create NotificationBell component with unread badge in frontend/src/components/notifications/NotificationBell.tsx
- [ ] T069 [US3] Create NotificationItem component in frontend/src/components/notifications/NotificationItem.tsx
- [ ] T070 [US3] Create NotificationCenter dropdown/panel in frontend/src/components/notifications/NotificationCenter.tsx
- [ ] T071 [US3] Create useNotifications hook for fetching and managing notifications in frontend/src/hooks/useNotifications.ts
- [ ] T072 [US3] Add NotificationBell to app header/navbar in frontend/src/components/layout/Header.tsx
- [ ] T073 [US3] Implement click-through navigation from notification to todo

**Checkpoint**: US3 complete - users can view and manage notifications

---

## Phase 6: User Story 4 - Complete Single Occurrence (Priority: P2)

**Goal**: Users can complete individual occurrences of recurring todos independently

**Independent Test**: Complete one occurrence, verify series continues with future instances

### Backend Implementation for US4

- [ ] T074 [US4] Implement POST /occurrences/{id}/complete endpoint in backend/app/routers/occurrences.py
- [ ] T075 [US4] Generate next occurrence on completion in RecurrenceService
- [ ] T076 [US4] Update todo list to show current occurrence status for recurring todos

### Frontend Implementation for US4

- [ ] T077 [US4] Handle occurrence completion in TodoItem (call occurrence endpoint for recurring)
- [ ] T078 [US4] Display occurrence-specific status on recurring todos in TodoList
- [ ] T079 [US4] Update useTodos to distinguish occurrence vs todo completion

**Checkpoint**: US4 complete - users can complete individual occurrences

---

## Phase 7: User Story 5 - Custom Recurrence Patterns (Priority: P2)

**Goal**: Users can create complex recurrence patterns (every N days, specific weekdays, day of month)

**Independent Test**: Create "every Monday and Friday" todo, verify instances appear only on those days

### Backend Implementation for US5

- [x] T080 [US5] Extend RecurrenceConfig schema for interval, days_of_week, day_of_month
- [x] T081 [US5] Implement custom RRULE generation for all pattern types in RecurrenceService
- [x] T082 [US5] Add validation for custom recurrence patterns

### Frontend Implementation for US5

- [x] T083 [US5] Add "Custom" frequency option to RecurrenceSelector
- [x] T084 [US5] Create interval input (every N days/weeks/months) in RecurrenceSelector
- [x] T085 [US5] Create weekday multi-select for weekly frequency in RecurrenceSelector
- [x] T086 [US5] Create day-of-month selector for monthly frequency in RecurrenceSelector

**Checkpoint**: US5 complete - users can create custom recurrence patterns

---

## Phase 8: User Story 6 - Skip an Occurrence (Priority: P2)

**Goal**: Users can skip a single occurrence without completing it

**Independent Test**: Skip today's occurrence, verify next scheduled instance still appears

### Backend Implementation for US6

- [x] T087 [US6] Implement POST /occurrences/{id}/skip endpoint in backend/app/routers/occurrences.py
- [x] T088 [US6] Update occurrence status to 'skipped' and generate next occurrence

### Frontend Implementation for US6

- [x] T089 [US6] Add "Skip" action button to TodoItem for recurring todos
- [x] T090 [US6] Show skipped status indicator on occurrence history

**Checkpoint**: US6 complete - users can skip occurrences

---

## Phase 9: User Story 7 - Default Reminder Preferences (Priority: P2)

**Goal**: Users can set default reminder preferences that auto-apply to new todos

**Independent Test**: Set default reminder, create new todo with due date, verify reminder auto-added

### Backend Implementation for US7

- [x] T091 [US7] Create preferences router in backend/app/routers/preferences.py
- [x] T092 [US7] Implement GET /me/preferences endpoint (create default if not exists)
- [x] T093 [US7] Implement PATCH /me/preferences endpoint
- [x] T094 [US7] Implement GET /me/preferences/timezones endpoint
- [x] T095 [US7] Auto-apply default reminder when creating todo with due_date in TodoService
- [x] T096 [US7] Register preferences router in backend/app/main.py

### Frontend Implementation for US7

- [x] T097 [US7] Create PreferencesPage or PreferencesModal in frontend/src/components/settings/PreferencesPage.tsx
- [x] T098 [US7] Add default reminder offset dropdown to preferences
- [x] T099 [US7] Add timezone selector to preferences
- [x] T100 [US7] Create usePreferences hook in frontend/src/hooks/usePreferences.ts
- [x] T101 [US7] Add Settings link to navigation

**Checkpoint**: US7 complete - users can configure default reminder preferences

---

## Phase 10: User Story 8 - Edit Recurring Series (Priority: P3)

**Goal**: Users can edit recurring todos with "this only" or "all future" scope options

**Independent Test**: Edit recurring todo title with "all future", verify future instances reflect change

### Backend Implementation for US8

- [x] T102 [US8] Add edit_scope query param to PATCH /todos/{id} endpoint
- [x] T103 [US8] Implement "this_only" edit logic (create one-off occurrence with changes)
- [x] T104 [US8] Implement "all_future" edit logic (update parent todo + regenerate occurrences)

### Frontend Implementation for US8

- [x] T105 [US8] Create EditScopeModal for recurring todo edits in frontend/src/components/todos/EditScopeModal.tsx
- [x] T106 [US8] Show EditScopeModal when editing recurring todo
- [x] T107 [US8] Pass edit_scope to update mutation

**Checkpoint**: US8 complete - users can edit recurring series with scope options

---

## Phase 11: User Story 9 - End Recurring Series (Priority: P3)

**Goal**: Users can stop a recurring series (end date, count, or immediate stop)

**Independent Test**: Create recurring todo with "end after 5", verify no instance after 5th

### Backend Implementation for US9

- [ ] T108 [US9] Implement POST /todos/{id}/stop-recurring endpoint in backend/app/routers/todos.py
- [ ] T109 [US9] Add end_date/end_count to RecurrenceConfig and RRULE generation
- [ ] T110 [US9] Stop generating occurrences when end condition met

### Frontend Implementation for US9

- [ ] T111 [US9] Add end conditions to RecurrenceSelector (end date, after N occurrences, never)
- [ ] T112 [US9] Add "Stop Recurring" action to TodoItem menu for recurring todos

**Checkpoint**: US9 complete - users can end recurring series

---

## Phase 12: User Story 10 - Snooze Reminder (Priority: P3)

**Goal**: Users can snooze a reminder to be reminded again later

**Independent Test**: Snooze reminder for 15 minutes, verify new notification appears after 15 minutes

### Backend Implementation for US10

- [ ] T113 [US10] Implement POST /reminders/{id}/snooze endpoint in backend/app/routers/reminders.py
- [ ] T114 [US10] Create new reminder at (now + snooze_minutes), mark original as snoozed

### Frontend Implementation for US10

- [ ] T115 [US10] Add snooze options to notification item (5 min, 15 min, 1 hour, custom)
- [ ] T116 [US10] Implement snooze action in useNotifications hook

**Checkpoint**: US10 complete - users can snooze reminders

---

## Phase 13: User Story 11 - Daily Digest (Priority: P3)

**Goal**: Users can opt into a daily summary of today's todos

**Independent Test**: Enable digest at 8 AM, verify notification arrives with todo summary

### Backend Implementation for US11

- [ ] T117 [US11] Add daily_digest_enabled and daily_digest_time to UserPreferences
- [ ] T118 [US11] Create scheduled job to send daily digests in backend/app/scheduler.py
- [ ] T119 [US11] Implement digest notification creation with todo summary

### Frontend Implementation for US11

- [ ] T120 [US11] Add daily digest toggle and time picker to PreferencesPage
- [ ] T121 [US11] Display daily digest notification type in NotificationItem

**Checkpoint**: US11 complete - users can receive daily digests

---

## Phase 14: User Story 12 - Browser Push Notifications (Priority: P3)

**Goal**: Users can enable browser push notifications and receive reminders even when app is closed

**Independent Test**: Grant permission, set reminder, close tab, verify push notification appears

### Backend Implementation for US12

- [ ] T122 [US12] Create push router in backend/app/routers/push.py
- [ ] T123 [US12] Implement GET /push/vapid-public-key endpoint
- [ ] T124 [US12] Implement POST /push/subscribe endpoint
- [ ] T125 [US12] Implement POST /push/unsubscribe endpoint
- [ ] T126 [US12] Send push notification via pywebpush when reminder fires in PushService
- [ ] T127 [US12] Register push router in backend/app/main.py

### Frontend Implementation for US12

- [ ] T128 [US12] Create service worker for push events in frontend/public/sw.js
- [ ] T129 [US12] Create usePushSubscription hook in frontend/src/hooks/usePushSubscription.ts
- [ ] T130 [US12] Implement permission request flow when user enables push in preferences
- [ ] T131 [US12] Handle notification click to open app at specific todo in sw.js
- [ ] T132 [US12] Register service worker conditionally when push enabled
- [ ] T133 [US12] Show permission status and instructions in PreferencesPage

**Checkpoint**: US12 complete - users receive push notifications

---

## Phase 15: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Performance & Reliability

- [ ] T134 [P] Add database indexes for query performance per data-model.md
- [ ] T135 [P] Implement 30-day notification auto-cleanup scheduled job
- [ ] T136 [P] Add background job for daily occurrence generation refresh
- [ ] T137 Add structured logging to reminder and notification services

### Accessibility & UX

- [ ] T138 [P] Add ARIA labels to NotificationCenter and RecurrenceSelector
- [ ] T139 [P] Add keyboard navigation to NotificationCenter
- [ ] T140 Mobile-responsive design for NotificationCenter dropdown
- [ ] T141 [P] Add loading states during reminder/notification operations

### Documentation & Validation

- [ ] T142 Run quickstart.md verification steps
- [ ] T143 Update frontend/src/types/todo.ts with recurrence fields
- [ ] T144 Add error handling for push notification failures (graceful fallback)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-14)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 15)**: Depends on at least P1 user stories being complete

### User Story Dependencies

| Story | Priority | Dependencies | Can Parallel With |
|-------|----------|--------------|-------------------|
| US1: Basic Recurring | P1 | Foundational | US2, US3 |
| US2: Reminders | P1 | Foundational | US1, US3 |
| US3: Notifications | P1 | Foundational | US1, US2 |
| US4: Complete Occurrence | P2 | US1 | US5, US6, US7 |
| US5: Custom Patterns | P2 | US1 | US4, US6, US7 |
| US6: Skip Occurrence | P2 | US1 | US4, US5, US7 |
| US7: Preferences | P2 | US2 | US4, US5, US6 |
| US8: Edit Series | P3 | US1, US4 | US9, US10, US11, US12 |
| US9: End Series | P3 | US1 | US8, US10, US11, US12 |
| US10: Snooze | P3 | US2 | US8, US9, US11, US12 |
| US11: Daily Digest | P3 | US3, US7 | US8, US9, US10, US12 |
| US12: Push Notifications | P3 | US2, US3 | US8, US9, US10, US11 |

### Within Each User Story

- Backend models/schemas before services
- Services before routers/endpoints
- Backend endpoints before frontend integration
- Core implementation before UI polish

---

## Parallel Execution Examples

### Phase 2 Parallel Tasks (Foundation)

```bash
# Launch all enum definitions together:
Task: "Create OccurrenceStatus enum in backend/app/models/enums.py"
Task: "Create ReminderStatus enum in backend/app/models/enums.py"
Task: "Create NotificationType enum in backend/app/models/enums.py"

# Launch all independent models together:
Task: "Create Reminder model in backend/app/models/reminder.py"
Task: "Create Notification model in backend/app/models/notification.py"
Task: "Create PushSubscription model in backend/app/models/push_subscription.py"
Task: "Create UserPreferences model in backend/app/models/user_preferences.py"

# Launch all schema files together:
Task: "Create OccurrenceResponse schema"
Task: "Create ReminderCreate/Response schemas"
Task: "Create NotificationResponse schemas"
Task: "Create PushSubscriptionCreate/Response schemas"
Task: "Create UserPreferencesUpdate/Response schemas"
```

### P1 User Stories Parallel (after Foundation)

```bash
# All P1 stories can run in parallel with separate developers:
Developer A: Phase 3 (US1 - Basic Recurring)
Developer B: Phase 4 (US2 - Reminders)
Developer C: Phase 5 (US3 - Notifications)
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: US1 - Basic Recurring Todo
4. Complete Phase 4: US2 - Set Reminders
5. Complete Phase 5: US3 - Notification Center
6. **STOP and VALIDATE**: Test all P1 stories independently
7. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test → Demo (basic recurring)
3. Add US2 + US3 → Test → Demo (reminders + notifications)
4. Add US4-US7 (P2) → Test → Demo (enhanced features)
5. Add US8-US12 (P3) → Test → Demo (polish features)

### Suggested MVP Scope

**Minimum Viable Product**: US1 + US2 + US3 (Phases 1-5)
- Users can create recurring todos
- Users can set reminders
- Users can see notifications in-app

This delivers core value and can be shipped before P2/P3 features.

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 144 |
| **Setup Phase** | 6 |
| **Foundational Phase** | 29 |
| **US1 (P1)** | 12 |
| **US2 (P1)** | 13 |
| **US3 (P1)** | 13 |
| **US4 (P2)** | 6 |
| **US5 (P2)** | 7 |
| **US6 (P2)** | 4 |
| **US7 (P2)** | 11 |
| **US8 (P3)** | 6 |
| **US9 (P3)** | 5 |
| **US10 (P3)** | 4 |
| **US11 (P3)** | 5 |
| **US12 (P3)** | 12 |
| **Polish Phase** | 11 |
| **Parallel Opportunities** | 45+ tasks marked [P] |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All file paths are relative to repository root
