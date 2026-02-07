---
id: 002
title: Plan Recurring Tasks Smart Reminders
stage: plan
date: 2026-01-23
surface: agent
model: claude-opus-4-5-20251101
feature: 006-recurring-reminders
branch: 006-recurring-reminders
user: alihashmi
command: /sp.plan
labels: ["recurring-tasks", "reminders", "notifications", "architecture", "plan"]
links:
  spec: specs/006-recurring-reminders/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-recurring-reminders/plan.md
  - specs/006-recurring-reminders/research.md
  - specs/006-recurring-reminders/data-model.md
  - specs/006-recurring-reminders/quickstart.md
  - specs/006-recurring-reminders/contracts/recurring-todos-api.yaml
  - specs/006-recurring-reminders/contracts/reminders-api.yaml
  - specs/006-recurring-reminders/contracts/notifications-api.yaml
  - specs/006-recurring-reminders/contracts/preferences-api.yaml
tests:
  - none (planning phase)
---

## Prompt

/sp.plan create the architectural plan

## Response snapshot

Created comprehensive implementation plan for SPEC-006: Recurring Tasks & Smart Reminders:

**Phase 0 - Research (research.md)**:
- Decided on python-dateutil rrule for RFC 5545 RRULE support
- Hybrid occurrence generation strategy (materialize 30 days + on-demand)
- Web Push API with VAPID and pywebpush for push notifications
- APScheduler with PostgreSQL job store for reminder scheduling
- Minimal service worker for push-only functionality

**Phase 1 - Design Artifacts**:
- **data-model.md**: 6 entities defined (extended Todo, TodoOccurrence, Reminder, Notification, PushSubscription, UserPreferences)
- **contracts/**: 4 OpenAPI contracts (recurring-todos-api, reminders-api, notifications-api, preferences-api)
- **quickstart.md**: Implementation guide with verification steps

**Key Decisions**:
1. RRULE strings for recurrence storage (RFC 5545 standard)
2. Hybrid occurrence generation (30-day materialization + on-demand)
3. Web Push API + VAPID (no external service dependency)
4. APScheduler for background reminder scheduling
5. Minimal push-only service worker

**Constitution Check**: 8/9 PASS, 1 PENDING (E2E tests to be added)

## Outcome

- Impact: Complete architectural plan ready for task generation
- Tests: none (planning phase)
- Files: plan.md, research.md, data-model.md, quickstart.md, 4 API contracts
- Next prompts: /sp.tasks to generate implementation tasks
- Reflection: Comprehensive plan covering all 12 user stories and 23 functional requirements

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): Constitution check PASS (8/9, 1 pending)
- Prompt variant (if applicable): standard-plan
- Next experiment (smallest change to try): none needed
