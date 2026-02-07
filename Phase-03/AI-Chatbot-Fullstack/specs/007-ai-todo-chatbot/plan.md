# Implementation Plan: AI Todo Chatbot

**Branch**: `007-ai-todo-chatbot` | **Date**: 2026-02-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-ai-todo-chatbot/spec.md`

## Summary

Deliver a fully functional AI-powered chatbot that manages todos via natural
language. The chatbot uses Google Gemini 2.5 Flash (free tier) through the
OpenAI Agents SDK abstraction layer, with MCP-pattern tools for all CRUD
operations. The implementation fixes critical bugs in list and delete
operations, removes the security vulnerability of user_id in the URL path,
adds conversation history persistence to the frontend, and ensures full
statelessness.

**Status**: Partially implemented with bugs. This plan focuses on fixing
existing code rather than greenfield development.

## Technical Context

**Language/Version**: Python 3.12 (Backend), TypeScript 5.6+ (Frontend)
**Primary Dependencies**: FastAPI 0.100+, openai-agents SDK, SQLModel, Next.js 16.0.10, React 19.x
**Storage**: Neon Serverless PostgreSQL (conversations, messages, todos tables)
**Testing**: Pytest (Backend), Manual E2E (Frontend)
**Target Platform**: Linux server (backend), Web browser (frontend)
**Project Type**: Web application (frontend + backend monorepo)
**Performance Goals**: Chat responses within 5 seconds (includes Gemini API latency)
**Constraints**: Zero paid AI dependency (Gemini Free API only), stateless backend
**Scale/Scope**: Single-user conversations, ~100 concurrent users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Spec-First Development | PASS | spec.md written and approved |
| II | Agentic Dev Stack | PASS | Following spec→plan→tasks→implement flow |
| III | Correction Over Preservation | PASS | Plan authorizes rewriting broken code |
| IV | Stateless by Design | PASS | All state in PostgreSQL, no in-memory state |
| V | MCP-First AI Integration | PASS | Tools are the only agent↔data interface |
| VI | Tool Determinism | PASS | Tools are stateless, validate ownership, return schemas |
| VII | Auth & Identity | **FIX NEEDED** | Current endpoint uses `{user_id}` in URL path — MUST change to JWT extraction |
| VIII | Security by Default | PASS | JWT required on all chat endpoints |
| IX | API Contract Stability | PASS | Breaking change justified: security fix (user_id removal from URL) |
| X | Observability | PASS | Structured logging already in auth; add to chat/agent |
| XI | Simplicity & YAGNI | PASS | No speculative features added |
| XII | AI Provider Independence | PASS | Gemini Free API via OpenAI-compat endpoint |

**Gate Result**: PASS (one fix required — addressed in implementation)

## Project Structure

### Documentation (this feature)

```text
specs/007-ai-todo-chatbot/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── chat-api.yaml    # Chat endpoint OpenAPI contract
│   └── mcp-tools.yaml   # MCP tool interface contracts
└── tasks.md             # Phase 2 output (/sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── agent.py             # Gemini model config + base agent definition (FIX)
│   ├── mcp_server.py        # MCP tool implementations (FIX: remove double-decoration)
│   ├── routers/
│   │   └── chat.py          # Chat endpoint (FIX: JWT auth, scoped tools, history endpoint)
│   ├── models/
│   │   └── chat.py          # Conversation + Message models (OK, no changes)
│   └── schemas/
│       └── chat.py          # Request/Response schemas (FIX: add history schema)

frontend/
├── src/
│   ├── app/
│   │   └── chat/
│   │       └── page.tsx     # Chat page (OK)
│   ├── components/
│   │   └── chat/
│   │       └── ChatInterface.tsx  # Chat UI (FIX: history loading, remove userId from API call)
│   └── services/
│       └── api.ts           # API client (FIX: change chat endpoint URL)
```

**Structure Decision**: Existing web application structure (frontend/ + backend/).
All changes are modifications to existing files — no new directories needed.

## Detailed Design

### Bug Fix Analysis (from research.md)

**Root Cause 1 — Double Decoration**:
- `mcp_server.py` decorates tools with `@mcp.tool()`
- `agent.py` wraps them again with `function_tool()`
- `chat.py` wraps them a THIRD time with `function_tool()` via scoped closures
- This triple-wrapping corrupts function signatures for the Agents SDK

**Root Cause 2 — Security Violation**:
- `POST /api/{user_id}/chat` takes user_id from URL path
- Any authenticated user can impersonate another by changing the URL
- Violates Constitution Principle VII

**Root Cause 3 — Missing Frontend History**:
- Frontend stores messages only in React state (volatile)
- No API call to load previous conversation on page mount
- Conversation continuity (US5) is broken

### Architecture (After Fix)

```
Frontend (Next.js)
  ├── ChatInterface.tsx
  │     ├── On mount: GET /api/chat/history → load messages
  │     ├── On send: POST /api/chat → send message
  │     └── Auth: JWT auto-included by api client
  │
  └── api.ts
        └── chat.sendMessage(data) — NO userId param
            chat.getHistory() — NEW endpoint

Backend (FastAPI)
  ├── routers/chat.py
  │     ├── POST /api/chat — uses CurrentUserDep (JWT)
  │     ├── GET /api/chat/history — uses CurrentUserDep (JWT)
  │     └── Creates per-request scoped agent with tools
  │
  ├── agent.py
  │     ├── Gemini model config (unchanged)
  │     └── Agent instructions (unchanged)
  │
  └── mcp_server.py (REFACTORED)
        ├── Plain functions (no @mcp.tool decorator)
        ├── Each takes user_id + params
        ├── Uses get_session_context() for DB access
        └── Returns predictable dict schemas
```

### Tool Scoping Strategy

The current approach of creating scoped closures per request is correct in
principle but has implementation issues. The fix:

1. Define raw tool functions in `mcp_server.py` WITHOUT any decorator
2. In `chat.py`, create scoped wrappers that inject `user_id`
3. Decorate the scoped wrappers with `@function_tool` ONCE
4. Pass scoped tools to per-request Agent instance

This ensures:
- Clean function signatures for schema generation
- User_id injected server-side from JWT
- No double/triple decoration
- Tools remain stateless

### Chat Endpoint Flow (After Fix)

```
POST /api/chat
  1. CurrentUserDep extracts user from JWT → user_id
  2. Get or create Conversation for user_id
  3. Store user Message in DB
  4. Load full conversation history from DB
  5. Create scoped tools (inject user_id via closures)
  6. Create per-request Agent with scoped tools
  7. Runner.run(agent, input=history) → result
  8. Store assistant Message in DB
  9. Return ChatResponse(conversation_id, response, tool_calls)
```

### Frontend Changes

1. **Remove userId from API call**: `api.chat.sendMessage(data)` instead of
   `api.chat.sendMessage(userId, data)`
2. **Add history loading**: On mount, call `GET /api/chat/history` to load
   previous messages
3. **Track conversation_id**: Store in state, pass in subsequent requests
4. **Error handling**: Display friendly messages for agent failures

## Complexity Tracking

> No constitution violations requiring justification.

## Post-Design Constitution Re-Check

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| VII | Auth & Identity | PASS | Changed to JWT-only identity resolution |
| IX | API Contract Stability | PASS | Breaking change documented (security fix) |

All 12 principles now satisfied.
