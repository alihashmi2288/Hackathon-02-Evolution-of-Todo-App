---
id: 001
title: Spec Recurring Tasks and Smart Reminders
stage: spec
date: 2026-01-23
surface: agent
model: claude-opus-4-5-20251101
feature: 006-recurring-reminders
branch: 006-recurring-reminders
user: alihashmi
command: /sp.specify
labels: ["recurring-tasks", "reminders", "notifications", "push-notifications", "spec"]
links:
  spec: specs/006-recurring-reminders/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-recurring-reminders/spec.md
  - specs/006-recurring-reminders/checklists/requirements.md
tests:
  - none (specification phase)
---

## Prompt

/sp.specify SPEC-006: Recurring Tasks & Smart Reminders for the Todo Full-Stack application

**Problem Statement:**
Users need to manage repetitive tasks that occur on a schedule (daily, weekly, monthly, yearly) without manually recreating them each time. Additionally, users need proactive reminders for time-sensitive todos so they don't miss important deadlines.

**Target Users:**
- Existing Todo app users who want to track routine tasks (daily habits, weekly meetings, monthly bills)
- Users who need reminders for important deadlines or time-sensitive tasks
- Users who want a centralized notification center for all todo-related alerts

**Core Requirements:**

1. **Recurring Task Management**
   - Allow users to set todos as recurring with basic frequencies: daily, weekly, monthly, yearly
   - Support custom recurrence patterns (e.g., "every 2 weeks", "every Monday and Friday", "1st of every month")
   - Display visual indicator for recurring todos
   - Auto-generate next occurrence when user completes current one
   - Allow users to complete single occurrence without affecting future ones
   - Allow users to skip an occurrence without completing it
   - Allow users to edit "this occurrence only" or "all future occurrences"
   - Allow users to end/stop a recurring series (set end date or "after N occurrences")
   - Preserve all todo properties (priority, tags, description) when generating new occurrences

2. **Smart Reminders**
   - Allow users to set reminders on todos with due dates
   - Support relative reminder times: "5 minutes before", "1 hour before", "1 day before", etc.
   - Allow multiple reminders per todo (e.g., both "1 day before" and "1 hour before")
   - Support snooze functionality: snooze for 5 min, 15 min, 1 hour, or custom duration

3. **Notification System**
   - Browser push notifications for reminders (with permission request flow)
   - In-app notification center showing all notifications
   - Unread notification count badge
   - Mark notifications as read (individually or all at once)
   - Notification types: reminder alerts, recurring task due, daily digest
   - Optional daily digest: summary of today's todos sent at configurable time

4. **User Preferences**
   - Default reminder settings (e.g., "always remind me 30 minutes before")
   - Enable/disable push notifications
   - Configure daily digest time
   - Timezone setting for accurate reminder timing

**User Stories to Cover:**
- "As a user, I want to create a daily recurring todo so I don't have to recreate it every day"
- "As a user, I want to be reminded 1 hour before a todo is due so I don't miss deadlines"
- "As a user, I want to see all my notifications in one place so I can review what I missed"
- "As a user, I want to skip today's recurring task without affecting tomorrow's"
- "As a user, I want to snooze a reminder if I can't act on it right now"
- "As a user, I want to receive a morning summary of today's todos"
- "As a user, I want to edit all future occurrences of a recurring task at once"

**Success Criteria:**
- Users can create a recurring todo in under 30 seconds
- Reminders trigger within 1 minute of scheduled time (95th percentile)
- Users can access any notification within 2 clicks
- Recurring task completion requires no additional clicks vs regular task
- Daily digest delivers within 5 minutes of configured time

**Out of Scope:**
- Email notifications (separate future spec)
- SMS notifications
- Calendar integration/export (iCal, Google Calendar)
- Mobile app push notifications (web push only for this spec)
- Recurring task templates/presets

**Dependencies:**
- SPEC-005: Todo Enhancements (due dates must be implemented) - completed
- SPEC-002: Authentication (user identity required for preferences) - completed

## Response snapshot

Created comprehensive specification for SPEC-006: Recurring Tasks & Smart Reminders with:
- 12 user stories covering recurring tasks (P1-P3) and reminders/notifications (P1-P3)
- 23 functional requirements (FR-001 to FR-023)
- 5 key entities: RecurrenceRule, Occurrence, Reminder, Notification, UserPreferences
- 8 measurable success criteria
- Clear scope boundaries and edge case handling
- Requirements checklist with 47 items (all passed)

## Outcome

- Impact: Created full specification for major feature combining recurring tasks and smart reminders
- Tests: none (specification phase)
- Files: spec.md, checklists/requirements.md created
- Next prompts: /sp.plan to create architectural plan, /sp.tasks to generate implementation tasks
- Reflection: Merged two related features (recurring tasks + reminders) into single cohesive spec

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): Requirements checklist PASS (47/47)
- Prompt variant (if applicable): merged-feature-spec
- Next experiment (smallest change to try): none needed
