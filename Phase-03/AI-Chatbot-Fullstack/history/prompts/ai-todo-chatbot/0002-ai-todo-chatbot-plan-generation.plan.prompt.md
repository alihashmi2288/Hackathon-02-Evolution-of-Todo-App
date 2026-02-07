---
id: 0002
title: AI Todo Chatbot Plan Generation
stage: plan
date: 2026-02-01
surface: agent
model: claude-opus-4-5-20251101
feature: ai-todo-chatbot
branch: 007-ai-todo-chatbot
user: alihashmi
command: /sp.plan
labels: ["chatbot", "plan", "architecture", "bug-fix", "mcp", "gemini"]
links:
  spec: specs/007-ai-todo-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/007-ai-todo-chatbot/plan.md
  - specs/007-ai-todo-chatbot/research.md
  - specs/007-ai-todo-chatbot/data-model.md
  - specs/007-ai-todo-chatbot/quickstart.md
  - specs/007-ai-todo-chatbot/contracts/chat-api.yaml
  - specs/007-ai-todo-chatbot/contracts/mcp-tools.yaml
  - CLAUDE.md
tests:
  - N/A
---

## Prompt

/sp.plan (executed against spec 007-ai-todo-chatbot)

## Response snapshot

Generated implementation plan for the AI Todo Chatbot feature. Key findings:

1. **Root cause of broken list/delete**: Triple-wrapping of tools — @mcp.tool() in mcp_server.py, function_tool() in agent.py, then function_tool() again in chat.py scoped closures. This corrupts function signatures for the Agents SDK.

2. **Security vulnerability**: POST /api/{user_id}/chat takes user_id from URL path, allowing any authenticated user to impersonate another. Fix: use CurrentUserDep (JWT extraction).

3. **Missing conversation persistence on frontend**: Messages only in React state, lost on refresh. Fix: add GET /api/chat/history endpoint and load on mount.

4. **Architecture validated**: Gemini 2.5 Flash via OpenAI-compat endpoint is correct. Tool scoping via closures is correct in principle but needs clean single-decoration.

All 12 constitution principles satisfied after planned fixes.

Artifacts produced: plan.md, research.md, data-model.md, quickstart.md, contracts/chat-api.yaml, contracts/mcp-tools.yaml.

## Outcome

- ✅ Impact: Complete implementation plan with 3 root causes identified, architecture validated, contracts defined
- 🧪 Tests: N/A (planning phase)
- 📁 Files: 6 artifacts generated + CLAUDE.md updated
- 🔁 Next prompts: /sp.tasks to generate task breakdown, then implementation
- 🧠 Reflection: Context7 SDK docs confirmed tool decoration patterns; codebase analysis revealed triple-wrapping as root cause

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution check PASS (12/12 after fixes)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
