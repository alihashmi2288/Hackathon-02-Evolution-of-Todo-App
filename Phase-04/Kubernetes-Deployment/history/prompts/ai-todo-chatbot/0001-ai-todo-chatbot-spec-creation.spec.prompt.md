---
id: 0001
title: AI Todo Chatbot Spec Creation
stage: spec
date: 2026-02-01
surface: agent
model: claude-opus-4-5-20251101
feature: ai-todo-chatbot
branch: 007-ai-todo-chatbot
user: alihashmi
command: /sp.specify
labels: ["chatbot", "ai", "mcp", "todo", "spec"]
links:
  spec: specs/007-ai-todo-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/007-ai-todo-chatbot/spec.md
  - specs/007-ai-todo-chatbot/checklists/requirements.md
  - .specify/memory/constitution.md
  - history/prompts/constitution/0002-amend-constitution-to-v2-0-0.constitution.prompt.md
tests:
  - N/A
---

## Prompt

# Phase 3 – AI Todo Chatbot (Analyze, Fix, and Complete)

## Status
PARTIALLY IMPLEMENTED WITH BUGS
Manual work exists. Chatbot is NOT fully functional.
Claude MUST analyze, debug, refactor, and complete the implementation.

## Primary Objective (PASS)
Deliver a fully functional AI-powered Todo Chatbot that:
- Works end-to-end via natural language
- Can ADD, LIST, UPDATE, COMPLETE, and DELETE tasks
- Uses MCP tools correctly for ALL task operations
- Runs entirely on Gemini Free API key via OpenAI Agents SDK compatibility
- Does NOT require the user to manually provide user_id
- Fixes all existing errors in delete/list operations
- Strictly follows the provided architecture & stateless rules

## Known Issues (From Human)
1. Chatbot can create tasks but cannot list all tasks and cannot delete tasks
2. Errors occur during tool invocation
3. Some Phase 3 work was done manually and may violate MCP principles, bypass tools, store state incorrectly, use incorrect Agent SDK patterns

(Full user input was comprehensive; key sections captured above. Full text available in conversation history.)

## Response snapshot

Created feature branch `007-ai-todo-chatbot` and wrote specification at `specs/007-ai-todo-chatbot/spec.md`. The spec includes 6 user stories (4 P1, 2 P2), 13 functional requirements, 10 measurable success criteria, 5 edge cases, and 6 assumptions. Also updated constitution from v1.1.0 to v2.0.0 with 12 principles. All quality checklist items passed — no clarifications needed. Spec is ready for `/sp.plan`.

## Outcome

- ✅ Impact: Feature spec created with full coverage of chatbot CRUD operations, identity, statelessness, and free-tier AI constraints
- 🧪 Tests: N/A (specification phase)
- 📁 Files: specs/007-ai-todo-chatbot/spec.md, specs/007-ai-todo-chatbot/checklists/requirements.md
- 🔁 Next prompts: /sp.plan to generate implementation plan, then /sp.tasks for task breakdown
- 🧠 Reflection: User provided exceptionally detailed requirements including known bugs, architecture constraints, and acceptance criteria — minimal inference needed

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Quality checklist PASS — all 16 items validated
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
