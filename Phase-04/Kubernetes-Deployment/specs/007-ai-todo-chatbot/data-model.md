# Data Model: AI Todo Chatbot

**Feature**: 007-ai-todo-chatbot
**Date**: 2026-02-01

## Existing Entities (No Changes)

### Todo
Already defined in `backend/app/models/todo.py`. Used by MCP tools.
Fields: id, title, description, completed, user_id, priority, due_date,
is_recurring, rrule, created_at, updated_at.

### User / Session / Account
Already defined via Better Auth. Used for JWT authentication.

## Existing Entities (Already Implemented — Review for Correctness)

### Conversation
**Table**: `conversations`
**File**: `backend/app/models/chat.py`

| Field       | Type     | Constraints                | Notes                     |
|-------------|----------|----------------------------|---------------------------|
| id          | str(21)  | PK, nanoid                 | URL-safe unique ID        |
| user_id     | str      | NOT NULL, indexed          | Owner (from JWT)          |
| created_at  | datetime | NOT NULL, default=utcnow   | Creation timestamp        |
| updated_at  | datetime | NOT NULL, default=utcnow   | Last activity timestamp   |

**Status**: Implemented and correct. No changes needed.

### Message
**Table**: `messages`
**File**: `backend/app/models/chat.py`

| Field           | Type     | Constraints                   | Notes                  |
|-----------------|----------|-------------------------------|------------------------|
| id              | str(21)  | PK, nanoid                    | URL-safe unique ID     |
| conversation_id | str      | FK→conversations.id, indexed  | Parent conversation    |
| role            | str      | NOT NULL                      | "user" or "assistant"  |
| content         | str      | NOT NULL                      | Message text           |
| created_at      | datetime | NOT NULL, default=utcnow      | Creation timestamp     |

**Status**: Implemented and correct. No changes needed.

## Relationships

```
User (1) ──── (*) Conversation
Conversation (1) ──── (*) Message
User (1) ──── (*) Todo (existing, used by tools)
```

## Migration Impact

No new tables or columns needed. The `conversations` and `messages` tables
already exist from Phase 3 manual implementation. The schema is correct.

## Data Flow

1. User sends message → stored as Message(role="user")
2. Agent processes → calls MCP tools → tools access Todo table
3. Agent responds → stored as Message(role="assistant")
4. Conversation.updated_at refreshed on each interaction
