# Tasks: AI Todo Chatbot

**Input**: Design documents from `/specs/007-ai-todo-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/chat-api.yaml, contracts/mcp-tools.yaml

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story. This is a bug-fix/completion project — most code exists but has critical architecture issues (triple tool decoration, security vulnerability, missing frontend history).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Verify environment, dependencies, and project readiness

- [x] T001 Verify openai-agents SDK is installed and Gemini API key is configured in backend/.env
- [x] T002 [P] Verify database has conversations and messages tables via `alembic upgrade head`

---

## Phase 2: Foundational (Blocking Prerequisites + US6 Auto Identity)

**Purpose**: Fix the three root causes — triple tool decoration, security vulnerability (user_id in URL), and missing history endpoint. US6 (Auto Identity, P1) is fully addressed here since it IS the security fix.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. All three root causes must be resolved.

- [x] T003 Refactor tool functions to plain functions (remove `@mcp.tool()` decorator) in `backend/app/mcp_server.py` — keep function signatures (`user_id`, business params) and return schemas unchanged; remove FastMCP server instance if no longer needed
- [x] T004 Simplify agent configuration in `backend/app/agent.py` — remove all `function_tool()` wrapping of imported tools; keep only `OpenAIChatCompletionsModel` config, `AsyncOpenAI` client pointed at Gemini endpoint, agent instructions, and `set_tracing_disabled(True)`
- [x] T005 Rewrite chat endpoint in `backend/app/routers/chat.py` — change `POST /api/{user_id}/chat` to `POST /api/chat`; replace `user_id: str` path param with `CurrentUserDep` (JWT extraction); create scoped closure wrappers that inject `user_id` and decorate each with `@function_tool` ONCE; create per-request `Agent` with scoped tools; fix `Runner.run()` call with conversation history
- [x] T006 Add `GET /api/chat/history` endpoint in `backend/app/routers/chat.py` — use `CurrentUserDep` for auth; accept optional `conversation_id` query param; return `ChatHistoryResponse` per contract in `contracts/chat-api.yaml`
- [x] T007 Add `ChatHistoryResponse` and `ChatMessage` schemas in `backend/app/schemas/chat.py` — fields: `conversation_id` (str), `messages` (list of `{id, role, content, created_at}`) per contract
- [x] T008 [P] Update frontend API client in `frontend/src/services/api.ts` — remove `userId` parameter from `sendMessage()`; change URL from `/api/${userId}/chat` to `/api/chat`; add `getHistory(conversationId?: string)` method calling `GET /api/chat/history`
- [x] T009 [P] Add structured logging for chat and agent operations in `backend/app/routers/chat.py` — log user_id, conversation_id, tool calls, agent errors (Constitution Principle X)

**Checkpoint**: Architecture is fixed — single tool decoration, JWT-only identity, history endpoint exists. US6 (Auto Identity) is fully satisfied.

---

## Phase 3: User Story 1 — Add Task via Chat (Priority: P1) 🎯 MVP

**Goal**: User types a natural language message like "Add a task to buy groceries" and the chatbot creates it.

**Independent Test**: Send a chat message requesting a new task; verify the task appears in the user's todo list and the chatbot confirms creation.

### Implementation for User Story 1

- [x] T010 [US1] Verify `add_task` scoped closure signature matches contract (`title: str`, `description: Optional[str]`) and returns `{task_id, status: "created", title}` in `backend/app/routers/chat.py`
- [x] T011 [US1] Verify agent instructions in `backend/app/agent.py` include guidance for task creation (extracting title from natural language, confirming creation to user)
- [x] T012 [US1] End-to-end validation: start backend + frontend, sign in, type "Add a task to buy groceries" in chat, confirm task created and visible in todo list

**Checkpoint**: User Story 1 is functional — task creation via chat works end-to-end.

---

## Phase 4: User Story 2 — List Tasks via Chat (Priority: P1)

**Goal**: User asks "Show me my tasks" and receives a formatted list of their current tasks.

**Independent Test**: Create several tasks, then ask the chatbot to list them; verify all tasks returned with correct details.

### Implementation for User Story 2

- [x] T013 [US2] Verify `list_tasks` scoped closure signature matches contract (`status: Optional[str] = "all"`) and returns array of `{id, title, completed, priority, due_date}` in `backend/app/routers/chat.py`
- [x] T014 [US2] Verify `list_tasks` plain function in `backend/app/mcp_server.py` correctly calls `TodoService.get_todos()` with status filter and maps results to contract schema
- [x] T015 [US2] Verify agent instructions handle "show my tasks", "what's on my list", and status-filtered requests ("show completed tasks") in `backend/app/agent.py`
- [x] T016 [US2] End-to-end validation: create tasks via chat, type "Show my tasks", confirm all tasks listed; type "Show completed tasks", confirm filtering works

**Checkpoint**: User Story 2 is functional — task listing via chat works end-to-end (previously broken).

---

## Phase 5: User Story 3 — Delete Task via Chat (Priority: P1)

**Goal**: User asks to delete a specific task and the chatbot removes it.

**Independent Test**: Create a task, request deletion via chat, verify the task no longer appears in the list.

### Implementation for User Story 3

- [x] T017 [US3] Verify `delete_task` scoped closure signature matches contract (`task_id: str`) and returns `{task_id, status: "deleted", title}` in `backend/app/routers/chat.py`
- [x] T018 [US3] Verify agent instructions guide the agent to first list tasks to find the matching task_id when user refers to a task by name, then call delete_task with the resolved ID in `backend/app/agent.py`
- [x] T019 [US3] End-to-end validation: create a task, type "Delete the buy groceries task", confirm deletion and task no longer in list

**Checkpoint**: User Story 3 is functional — task deletion via chat works end-to-end (previously broken).

---

## Phase 6: User Story 4 — Update and Complete Tasks via Chat (Priority: P2)

**Goal**: User can update task title/description or mark a task as complete via chat.

**Independent Test**: Create a task, update its title via chat, then mark it complete via chat; verify changes persist.

### Implementation for User Story 4

- [x] T020 [P] [US4] Verify `update_task` scoped closure signature matches contract (`task_id: str`, `title: Optional[str]`, `description: Optional[str]`) and returns `{task_id, status: "updated", title}` in `backend/app/routers/chat.py`
- [x] T021 [P] [US4] Verify `complete_task` scoped closure signature matches contract (`task_id: str`) and returns `{task_id, status: "completed", title}` in `backend/app/routers/chat.py`
- [x] T022 [US4] Verify agent instructions handle update requests ("change X to Y") and completion requests ("mark X as done") in `backend/app/agent.py`
- [x] T023 [US4] End-to-end validation: create a task, type "Change 'buy groceries' to 'buy organic groceries'", confirm update; type "Mark it as done", confirm completion

**Checkpoint**: User Story 4 is functional — update and complete operations work via chat.

---

## Phase 7: User Story 5 — Conversation Continuity (Priority: P2)

**Goal**: Users return to the chatbot and see their previous conversation history, continuing where they left off.

**Independent Test**: Send messages, close the browser, reopen; verify previous conversation is displayed.

### Implementation for User Story 5

- [x] T024 [US5] Update `ChatInterface.tsx` in `frontend/src/components/chat/ChatInterface.tsx` — on component mount, call `api.chat.getHistory()` to load previous messages; populate messages state from response
- [x] T025 [US5] Track `conversationId` in React state in `frontend/src/components/chat/ChatInterface.tsx` — set from first `ChatResponse`, pass in subsequent `sendMessage()` calls via `conversation_id` field
- [x] T026 [US5] Remove `userId` usage from chat API calls in `frontend/src/components/chat/ChatInterface.tsx` — remove `useSession()` userId extraction for chat purposes; auth token handles identity automatically
- [x] T027 [US5] End-to-end validation: send messages, refresh browser, confirm previous messages load; send a new message and confirm conversation continues

**Checkpoint**: User Story 5 is functional — conversation history persists across browser sessions.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T028 [P] Add friendly error messages for agent failures in `frontend/src/components/chat/ChatInterface.tsx` — display user-friendly text for 401, 500, and network errors
- [x] T029 [P] Add edge case handling in agent instructions in `backend/app/agent.py` — ambiguous messages (ask for clarification), non-task messages (steer back to task management), task not found (clear error message)
- [x] T030 Verify statelessness: restart backend server, confirm chatbot works identically with no data loss (Constitution Principle IV)
- [x] T031 Run quickstart.md validation — N/A (quickstart.md not generated for this feature)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - P1 stories (US1, US2, US3) can proceed in parallel after foundational
  - P2 stories (US4, US5) can proceed in parallel after foundational
  - US5 depends on T008 (frontend API client update) from foundational
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Add Task, P1)**: Can start after Foundational — no dependencies on other stories
- **US2 (List Tasks, P1)**: Can start after Foundational — no dependencies on other stories
- **US3 (Delete Task, P1)**: Can start after Foundational — no dependencies on other stories (agent uses list internally to resolve names but that's agent behavior, not code dependency)
- **US4 (Update/Complete, P2)**: Can start after Foundational — no dependencies on other stories
- **US5 (Conversation Continuity, P2)**: Can start after Foundational — depends on T008 (frontend API update)
- **US6 (Auto Identity, P1)**: Fully addressed in Foundational phase (T005, T008)

### Within Each User Story

- Verify tool signatures before end-to-end validation
- Agent instructions before end-to-end validation
- End-to-end validation is the final task in each story

### Parallel Opportunities

- T001 and T002 (Setup) can run in parallel
- T003 and T004 (backend refactors) can run in parallel but T005 depends on both
- T008 and T009 (frontend API + logging) can run in parallel with T005-T007
- All P1 user stories (Phase 3, 4, 5) can run in parallel after foundational
- T020 and T021 (US4 tool verifications) can run in parallel
- T028 and T029 (Polish) can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Batch 1 — independent backend refactors:
Task T003: "Refactor tool functions in backend/app/mcp_server.py"
Task T004: "Simplify agent config in backend/app/agent.py"
Task T008: "Update frontend API client in frontend/src/services/api.ts"
Task T009: "Add structured logging in backend/app/routers/chat.py"

# Batch 2 — depends on T003 + T004:
Task T005: "Rewrite chat endpoint in backend/app/routers/chat.py"
Task T007: "Add history schemas in backend/app/schemas/chat.py"

# Batch 3 — depends on T005 + T007:
Task T006: "Add GET /api/chat/history endpoint in backend/app/routers/chat.py"
```

## Parallel Example: P1 User Stories (after Foundational)

```bash
# All P1 stories in parallel:
Task T010-T012: "User Story 1 — Add Task"
Task T013-T016: "User Story 2 — List Tasks"
Task T017-T019: "User Story 3 — Delete Task"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — fixes all 3 root causes)
3. Complete Phase 3: User Story 1 (Add Task)
4. **STOP and VALIDATE**: Test task creation via chat end-to-end
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Architecture fixed, US6 satisfied
2. Add US1 (Add Task) → Test independently → MVP!
3. Add US2 (List Tasks) + US3 (Delete Task) → Full CRUD via chat
4. Add US4 (Update/Complete) → Enhanced task management
5. Add US5 (Conversation Continuity) → Persistent chat experience
6. Polish → Error handling, edge cases, validation

### Single Developer Strategy (Recommended)

1. Phase 1 + Phase 2 sequentially (foundational fixes)
2. Phase 3 → Phase 4 → Phase 5 sequentially (P1 stories in priority order)
3. Phase 6 → Phase 7 sequentially (P2 stories)
4. Phase 8 (polish)

---

## Notes

- This is a **bug-fix/completion** project — most code exists but has critical issues
- The foundational phase (Phase 2) is the heaviest work — it rewrites the tool architecture
- User story phases are lighter — mostly verification and fine-tuning after the architectural fix
- US6 (Auto Identity) has no separate phase because it IS the foundational security fix
- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
