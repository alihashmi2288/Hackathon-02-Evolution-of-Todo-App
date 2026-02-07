# Research: AI Todo Chatbot

**Feature**: 007-ai-todo-chatbot
**Date**: 2026-02-01

## R1: OpenAI Agents SDK — Correct Tool Usage Pattern

**Decision**: Use `@function_tool` decorator on plain Python functions. Tools
can be sync or async. The SDK introspects function signatures and docstrings
to generate JSON schemas for the LLM.

**Rationale**: Context7 documentation confirms `@function_tool` is the
canonical way to register tools. The current codebase wraps MCP-decorated
functions through `function_tool()` which double-decorates — this causes
schema generation issues. Tools should be defined once with `@function_tool`.

**Alternatives considered**:
- MCP server as network service (stdio/SSE): Adds complexity, requires
  running a separate process. Not needed when tools are in the same process.
- `agent.as_tool()`: For sub-agent delegation only, not for function tools.

## R2: Gemini Compatibility via OpenAI Agents SDK

**Decision**: Use `OpenAIChatCompletionsModel` with Gemini's OpenAI-compatible
endpoint (`generativelanguage.googleapis.com/v1beta/openai/`). Model name:
`gemini-2.5-flash`.

**Rationale**: The current implementation correctly uses `AsyncOpenAI` client
pointed at Gemini's endpoint. This is a valid pattern per the SDK docs for
using non-OpenAI providers. Tracing must be disabled (`set_tracing_disabled(True)`)
since it depends on OpenAI infrastructure.

**Alternatives considered**:
- LiteLLM adapter (`litellm/gemini/gemini-2.5-flash`): Valid but adds
  another dependency. Direct OpenAI-compat endpoint is simpler.
- Google AI SDK directly: Breaks the OpenAI Agents SDK abstraction.

## R3: User Identity Resolution — Security Bug

**Decision**: The chat endpoint MUST use `get_current_user` dependency
(JWT extraction) instead of a URL path parameter `{user_id}`. The current
`POST /api/{user_id}/chat` allows any authenticated user to impersonate
another by changing the URL.

**Rationale**: Constitution Principle VII (Authentication & Identity) states
the system MUST NEVER trust client-supplied user identifiers. The correct
pattern is `POST /api/chat` with user_id extracted from the JWT token via
`CurrentUserDep`.

**Alternatives considered**:
- Keep path param but validate against JWT: Still violates the principle
  of not trusting client-supplied identifiers.

## R4: MCP Tool Architecture — Direct Import vs Network Server

**Decision**: Keep tools as direct Python function calls within the same
process. Do NOT run FastMCP as a separate server. Define tools with
`@function_tool` for the Agents SDK, keeping the `@mcp.tool()` decorator
only for standalone MCP server mode.

**Rationale**: The agent and tools run in the same FastAPI process. Adding
network overhead for MCP protocol is unnecessary complexity (Constitution
Principle XI — Simplicity). The current approach of importing tool functions
directly is correct, but the double-decoration must be fixed.

**Alternatives considered**:
- Run MCP server on stdio and connect via `MCPServerStdio`: Adds process
  management complexity with no benefit for single-process deployment.

## R5: Conversation History — Frontend Persistence

**Decision**: Frontend must track `conversation_id` across messages and
load history on page mount. Currently, the frontend stores messages only
in React state (lost on refresh). Must call backend to load previous
conversation on mount.

**Rationale**: FR-006 requires conversation persistence. The backend
already stores all messages. The frontend just needs to fetch them.

**Alternatives considered**:
- localStorage: Redundant — backend is the source of truth.
- New SSE/WebSocket channel: Over-engineering for current scope.

## R6: Root Cause — Why List and Delete Fail

**Decision**: The likely root causes are:

1. **Double decoration**: MCP tools are decorated with `@mcp.tool()` then
   wrapped again with `function_tool()` in `agent.py`. This corrupts the
   function signature that the SDK uses to generate tool schemas.

2. **Synchronous tools in async context**: `Runner.run()` is async, but
   the scoped wrapper functions in `chat.py` are synchronous and call
   synchronous MCP tool functions that use `get_session_context()` (a
   synchronous context manager). This can cause issues when the Agents
   SDK tries to call them in an async event loop.

3. **Return type serialization**: `list_tasks` returns `List[dict]` but
   the Agents SDK may not correctly serialize this for the LLM response,
   causing the tool call to appear to fail.

**Fix**: Rewrite tools as clean `@function_tool`-decorated functions
(either sync or properly async) that are defined once and scoped at
request time via closures.

**Rationale**: Eliminates all decoration conflicts and ensures the SDK
has clean function signatures for schema generation.
