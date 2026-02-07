# Feature Specification: Recurring Tasks & Smart Reminders

**Feature Branch**: `006-recurring-reminders`
**Created**: 2026-01-23
**Status**: Draft
**Input**: User description: "SPEC-006: Recurring Tasks & Smart Reminders for the Todo Full-Stack application"

## Overview

This feature adds two major capabilities to the Todo application:
1. **Recurring Tasks**: Allow users to create todos that automatically regenerate on a schedule (daily, weekly, monthly, yearly, or custom patterns)
2. **Smart Reminders & Notifications**: Enable users to set reminders for todos and receive notifications via browser push and in-app notification center

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Basic Recurring Todo (Priority: P1)

As a user, I want to create a recurring todo with a simple frequency (daily, weekly, monthly, yearly) so that repetitive tasks automatically appear on my todo list.

**Why this priority**: This is the core recurring task functionality. Without it, users cannot benefit from automated task regeneration for routine activities like "Take daily medication" or "Weekly team meeting."

**Independent Test**: Can be fully tested by creating a daily recurring todo and verifying that completing today's instance generates tomorrow's instance automatically.

**Acceptance Scenarios**:

1. **Given** I am creating a new todo, **When** I select "Repeat: Daily" and save, **Then** the todo shows a recurring indicator and will regenerate each day
2. **Given** I have a weekly recurring todo due today, **When** I mark it complete, **Then** a new instance is created for next week
3. **Given** I have a monthly recurring todo set for the 15th, **When** I view my todos on the 15th, **Then** I see that month's instance ready to complete

---

### User Story 2 - Set Reminder for Todo (Priority: P1)

As a user, I want to set a reminder for a todo (e.g., "remind me 1 hour before") so that I receive a notification and don't forget important tasks.

**Why this priority**: Reminders are essential for time-sensitive todos with due dates. Users need proactive notifications to act on tasks before deadlines.

**Independent Test**: Can be fully tested by setting a reminder on a todo and verifying the notification appears at the specified time.

**Acceptance Scenarios**:

1. **Given** I have a todo due at 3:00 PM with a 1-hour reminder, **When** it becomes 2:00 PM, **Then** I receive a notification
2. **Given** I want multiple reminders, **When** I add "1 day before" and "1 hour before" reminders, **Then** I receive both notifications at their respective times
3. **Given** I receive a reminder notification, **When** I click it, **Then** I am taken to that todo in the app

---

### User Story 3 - View and Manage Notifications (Priority: P1)

As a user, I want an in-app notification center where I can view all my notifications and mark them as read so that I can track reminders even if I missed the push notification.

**Why this priority**: Not all users will see push notifications. An in-app notification center provides a fallback and history of all reminders.

**Independent Test**: Can be fully tested by triggering several reminders and verifying they appear in the notification center with read/unread status.

**Acceptance Scenarios**:

1. **Given** I have unread notifications, **When** I view the notification icon, **Then** I see a badge showing the unread count
2. **Given** I open the notification center, **When** I view the list, **Then** I see all recent notifications sorted by time (newest first)
3. **Given** I have an unread notification, **When** I click on it, **Then** it is marked as read and the badge count decreases

---

### User Story 4 - Complete Single Occurrence (Priority: P2)

As a user, I want to complete just one occurrence of a recurring todo without affecting future occurrences so that I can track daily progress independently.

**Why this priority**: Users need to track completion of individual instances. This is fundamental to recurring task usefulness.

**Independent Test**: Can be fully tested by completing one instance of a recurring todo and verifying the series continues with future instances.

**Acceptance Scenarios**:

1. **Given** I have a daily recurring todo, **When** I complete today's instance, **Then** only today's instance is marked complete; tomorrow's instance remains pending
2. **Given** I completed yesterday's recurring todo, **When** I view my todos today, **Then** I see a new pending instance for today

---

### User Story 5 - Create Custom Recurrence Pattern (Priority: P2)

As a user, I want to create custom recurrence patterns (e.g., "every 2 weeks", "every Monday and Friday", "1st of every month") so that I can match my real-world schedules.

**Why this priority**: While basic frequencies cover most cases, power users need custom patterns for complex schedules like biweekly meetings or specific days of the month.

**Independent Test**: Can be fully tested by creating a "every Monday and Friday" recurring todo and verifying instances appear only on those days.

**Acceptance Scenarios**:

1. **Given** I am setting up recurrence, **When** I select "Custom" and specify "Every 2 weeks on Monday," **Then** the todo recurs biweekly on Mondays
2. **Given** I want a todo on specific days, **When** I select "Weekly on Mon, Wed, Fri," **Then** instances appear on those three days each week
3. **Given** I need a monthly todo, **When** I select "Monthly on the 1st," **Then** the todo appears on the first day of each month

---

### User Story 6 - Skip an Occurrence (Priority: P2)

As a user, I want to skip a single occurrence of a recurring todo (without completing it) so that I can handle exceptions like holidays or vacations.

**Why this priority**: Real-world schedules have exceptions. Users need to skip instances without breaking the recurring pattern.

**Independent Test**: Can be fully tested by skipping today's occurrence and verifying the next scheduled instance still appears.

**Acceptance Scenarios**:

1. **Given** I have a daily recurring todo, **When** I choose "Skip this occurrence," **Then** today's instance is dismissed and tomorrow's instance is scheduled as normal
2. **Given** I skipped an occurrence, **When** I view my todo history, **Then** I can see that the occurrence was skipped (not completed)

---

### User Story 7 - Configure Default Reminder Preferences (Priority: P2)

As a user, I want to configure default reminder settings (e.g., "always remind me 30 minutes before due time") so that I don't have to set reminders manually for every todo.

**Why this priority**: Reduces friction for users who want consistent reminder behavior across all todos.

**Independent Test**: Can be fully tested by setting a default reminder preference, creating a new todo with a due date, and verifying the reminder is automatically applied.

**Acceptance Scenarios**:

1. **Given** I set my default reminder to "30 minutes before," **When** I create a new todo with a due time, **Then** a 30-minute reminder is automatically added
2. **Given** I have a default reminder set, **When** I create a todo, **Then** I can still modify or remove the automatically added reminder

---

### User Story 8 - Edit Recurring Series (Priority: P3)

As a user, I want to edit a recurring todo and choose whether changes apply to "this occurrence only" or "all future occurrences" so that I can handle both one-time changes and series-wide updates.

**Why this priority**: Important for managing recurring tasks long-term, but less critical than core creation and completion flows.

**Independent Test**: Can be fully tested by editing a recurring todo's title, selecting "all future occurrences," and verifying future instances reflect the change.

**Acceptance Scenarios**:

1. **Given** I edit a recurring todo's title, **When** I choose "This occurrence only," **Then** only this instance's title changes; future instances keep the original title
2. **Given** I edit a recurring todo's due time, **When** I choose "All future occurrences," **Then** this and all future instances have the new due time

---

### User Story 9 - End Recurring Series (Priority: P3)

As a user, I want to stop/end a recurring series (set an end date or "after N occurrences") so that recurring tasks don't continue indefinitely when no longer needed.

**Why this priority**: Necessary for managing recurring task lifecycle, but users can work around by manually deleting if needed.

**Independent Test**: Can be fully tested by creating a recurring todo that ends after 5 occurrences and verifying no instance appears after the 5th.

**Acceptance Scenarios**:

1. **Given** I am creating a recurring todo, **When** I set "End after 10 occurrences," **Then** the series stops after the 10th instance
2. **Given** I have an active recurring todo, **When** I set "End date: March 31," **Then** no instances are generated after that date
3. **Given** I want to stop a recurring todo immediately, **When** I choose "Stop recurring," **Then** no future instances are generated

---

### User Story 10 - Snooze Reminder (Priority: P3)

As a user, I want to snooze a reminder (5 min, 15 min, 1 hour, custom) so that I can be reminded again later if I can't act on it immediately.

**Why this priority**: Enhances usability but is not critical for basic reminder functionality.

**Independent Test**: Can be fully tested by snoozing a reminder for 5 minutes and verifying a new notification appears after 5 minutes.

**Acceptance Scenarios**:

1. **Given** I receive a reminder notification, **When** I choose "Snooze for 15 minutes," **Then** I receive the same reminder again 15 minutes later
2. **Given** I want a custom snooze, **When** I select "Snooze for 2 hours," **Then** the reminder reappears in 2 hours

---

### User Story 11 - Daily Digest Notification (Priority: P3)

As a user, I want to opt into a daily digest that summarizes today's todos each morning so that I can plan my day effectively.

**Why this priority**: Nice-to-have productivity feature that supplements individual reminders.

**Independent Test**: Can be fully tested by enabling daily digest at 8 AM and verifying a summary notification arrives at that time.

**Acceptance Scenarios**:

1. **Given** I enabled daily digest at 8:00 AM, **When** it becomes 8:00 AM, **Then** I receive a notification summarizing all todos due today
2. **Given** I have no todos due today, **When** digest time arrives, **Then** I receive a message saying "No todos due today"

---

### User Story 12 - Browser Push Notification Permission (Priority: P3)

As a user, I want to be prompted for push notification permission so that I can receive reminders even when the app is not open.

**Why this priority**: Essential for push notifications to work, but users can still use in-app notifications without this.

**Independent Test**: Can be fully tested by visiting the app for the first time and verifying a permission prompt appears.

**Acceptance Scenarios**:

1. **Given** I am a new user, **When** I first enable reminders, **Then** I am prompted to allow browser notifications
2. **Given** I denied notifications previously, **When** I go to settings, **Then** I see instructions on how to enable notifications in browser settings
3. **Given** I allowed notifications, **When** a reminder triggers, **Then** I see a browser push notification even if the app is in the background

---

### Edge Cases

- What happens when a recurring todo's due date falls on a non-existent day (e.g., Feb 30)?
  - System adjusts to the last valid day of the month (Feb 28 or 29)
- How does system handle timezone changes for reminders?
  - Reminders are calculated based on user's configured timezone in preferences
- What happens when a user completes a recurring todo before the due date?
  - The instance is marked complete; next instance is still generated on schedule
- What happens to reminders when a todo is deleted?
  - All associated reminders are automatically cancelled
- What happens when a recurring todo is converted to non-recurring?
  - Future instances are not generated; existing instances remain as individual todos
- How many reminders can a single todo have?
  - Maximum of 5 reminders per todo to prevent notification spam
- What happens when push notifications are blocked by browser?
  - In-app notifications still work; user sees a warning in settings

## Requirements *(mandatory)*

### Functional Requirements

#### Recurring Tasks

- **FR-001**: System MUST allow users to set a todo as recurring with frequencies: daily, weekly, monthly, yearly
- **FR-002**: System MUST support custom recurrence patterns including: interval (every N days/weeks/months), specific days of week, specific day of month
- **FR-003**: System MUST display a visual indicator (icon/badge) on todos that are part of a recurring series
- **FR-004**: System MUST generate the next occurrence automatically when an occurrence is completed
- **FR-005**: System MUST allow users to complete individual occurrences independently
- **FR-006**: System MUST allow users to skip an occurrence without completing it
- **FR-007**: System MUST allow users to edit recurring todos with options: "This occurrence only" or "All future occurrences"
- **FR-008**: System MUST allow users to end a recurring series via: end date, occurrence count, or manual stop
- **FR-009**: System MUST preserve priority, tags, and description when generating new occurrences

#### Reminders & Notifications

- **FR-010**: System MUST allow users to add reminders to todos with due dates/times
- **FR-011**: System MUST support reminder offsets: 5 min, 15 min, 30 min, 1 hour, 2 hours, 1 day, 2 days, 1 week before due
- **FR-012**: System MUST allow multiple reminders per todo (maximum 5)
- **FR-013**: System MUST send browser push notifications for reminders (if permission granted)
- **FR-014**: System MUST provide an in-app notification center showing all notifications
- **FR-015**: System MUST display unread notification count as a badge on the notification icon
- **FR-016**: System MUST allow users to mark notifications as read individually or all at once
- **FR-017**: System MUST allow users to snooze reminders with preset options (5 min, 15 min, 1 hour) and custom duration
- **FR-018**: System MUST allow users to configure default reminder preferences that auto-apply to new todos

#### User Preferences

- **FR-019**: System MUST allow users to enable/disable push notifications
- **FR-020**: System MUST allow users to set their timezone for reminder calculations
- **FR-021**: System MUST allow users to configure default reminder offset (e.g., "30 minutes before")
- **FR-022**: System MUST allow users to enable daily digest and set digest time
- **FR-023**: System MUST auto-delete notifications older than 30 days

### Key Entities

- **RecurrenceRule**: Defines the repeat pattern for a recurring todo (frequency, interval, end conditions, exceptions)
- **Occurrence**: An individual instance of a recurring todo with its own completion status
- **Reminder**: A scheduled notification linked to a todo, with trigger time and delivery status
- **Notification**: A user-facing message that appears in the notification center and/or as a push notification
- **UserPreferences**: User-specific settings for reminders, digest, timezone, and notification preferences

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a recurring todo in under 30 seconds, including selecting frequency
- **SC-002**: 95% of reminders trigger within 1 minute of the scheduled time
- **SC-003**: Users can access any notification within 2 clicks from anywhere in the app
- **SC-004**: Recurring task completion flow requires no additional clicks compared to regular tasks
- **SC-005**: Daily digest (when enabled) is delivered within 5 minutes of configured time
- **SC-006**: System supports at least 100 active recurring todos per user without performance degradation
- **SC-007**: Notification center loads within 1 second even with 100+ notifications
- **SC-008**: Users report 80%+ satisfaction with reminder timeliness in user feedback

## Scope

### In Scope

- Recurring task creation, editing, completion, skip, and end
- Browser push notifications for reminders
- In-app notification center with read/unread status
- User preferences for default reminders, timezone, and daily digest
- Snooze functionality for reminders

### Out of Scope

- Email notifications (future spec)
- SMS notifications (future spec)
- Calendar sync/export (future spec)
- Mobile app push notifications (web push only for now)
- Recurring task templates/presets

## Dependencies

- **SPEC-005**: Todo Enhancements - due dates must be implemented (completed)
- **SPEC-002**: Authentication - user identity required for preferences and notifications

## Assumptions

- Users have modern browsers that support the Notifications API and Service Workers
- The application runs on HTTPS (required for push notifications)
- User timezone is stored and used for all time-based calculations
- Recurring instances are generated on-demand (hybrid approach: materialize next N instances, generate more as needed)
- Default reminder preferences apply only to newly created todos, not existing ones
- Snooze creates a new reminder rather than modifying the original
