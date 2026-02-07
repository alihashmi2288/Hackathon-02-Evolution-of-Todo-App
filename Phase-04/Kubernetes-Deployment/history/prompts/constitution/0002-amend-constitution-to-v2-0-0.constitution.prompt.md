---
id: 0002
title: Amend Constitution to v2.0.0
stage: constitution
date: 2026-02-01
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: 006-recurring-reminders
user: alihashmi
command: /sp.constitution
labels: ["constitution", "governance", "principles", "major-version"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

# Project Constitution

This Constitution defines the non-negotiable rules, principles, and governance
for the Todo Full-Stack + AI Chatbot Project.

This document supersedes all other instructions, specs, READMEs, comments,
and human assumptions.

---

## I. Core Principles

### I. Spec-First Development (NON-NEGOTIABLE)
- No feature, refactor, or fix may be implemented without a written spec.
- Specs must be written before planning or coding.
- Specs are the single source of truth.
- Manual coding without a spec is considered a violation.

### II. Agentic Dev Stack Enforcement
- Development must follow this exact workflow:
  1. Write spec
  2. Generate plan
  3. Break into tasks
  4. Implement via Claude Code
- Humans may review and guide, but not manually implement logic.
- Claude Code is the primary executor.

### III. Correction Over Preservation
- Existing code may be incorrect, incomplete, or misaligned.
- Claude is explicitly authorized to:
  - Rewrite code
  - Delete code
  - Refactor architecture
  - Change APIs
- Correctness > backward compatibility.
- Human-written code has no special protection.

### IV. Stateless by Design
- No backend service may store runtime state in memory.
- No AI agent may store memory between requests.
- All state must live in the database.
- Server restarts must not affect functionality.

### V. MCP-First AI Integration
- AI agents must interact with the system exclusively via MCP tools.
- Agents must NOT:
  - Access databases directly
  - Call internal services directly
- MCP tools are the only interface between AI and business logic.

### VI. Tool Determinism
- MCP tools must be:
  - Stateless
  - Deterministic
  - Idempotent where possible
- Tools must validate ownership and permissions.
- Tool responses must follow documented schemas.

### VII. Authentication & Identity
- Authentication is mandatory for all user data access.
- User identity must be derived from auth/session context.
- The system must NEVER:
  - Ask users to provide user_id
  - Trust client-supplied user identifiers
- Authorization is enforced server-side only.

### VIII. Security by Default
- All API endpoints require authentication unless explicitly stated.
- Unauthorized access returns 401.
- Cross-user data access is forbidden.
- Secrets must be managed via environment variables only.

### IX. API Contract Stability
- APIs must be RESTful and predictable.
- Breaking changes require spec updates.
- All endpoints must enforce user ownership.

### X. Observability & Debuggability
- Structured logging is required for:
  - API requests
  - Tool calls
  - Agent execution
- Errors must be explicit, not silent.
- Fail fast > hidden failures.

### XI. Simplicity & YAGNI
- No speculative features.
- No unused abstractions.
- Start simple, evolve via specs.
- Complexity must be justified in the spec.

### XII. AI Provider Independence
- The system must support non-paid AI providers.
- Gemini Free API is the default execution target.
- OpenAI SDKs may be used only as abstractions.
- No hard dependency on paid OpenAI APIs.

## II. Architectural Constraints

### Backend
- FastAPI (Python)
- SQLModel ORM
- Neon Serverless PostgreSQL
- JWT-based authentication validation

### Frontend
- Next.js (App Router)
- ChatKit for AI UI
- Responsive, accessible UI

### AI Layer
- OpenAI Agents SDK
- MCP Server using Official MCP SDK
- Stateless agent execution

## III. Development Workflow

### Specs
- Stored under `/specs`
- Named by phase and purpose
- Must include:
  - Objective
  - Constraints
  - Acceptance criteria

### Reviews
- Every PR or i

## Response snapshot

Updated `.specify/memory/constitution.md` from v1.1.0 to v2.0.0 (MAJOR bump).
12 core principles (up from 9) now govern the project, adding: Correction Over
Preservation, Stateless by Design, MCP-First AI Integration, Tool Determinism,
Authentication & Identity, Security by Default, Observability & Debuggability,
Simplicity & YAGNI, and AI Provider Independence. Technical constraints expanded
to include AI Layer (OpenAI Agents SDK, MCP SDK, Gemini Free API). All templates
validated — no updates required. Sync Impact Report embedded as HTML comment.

## Outcome

- ✅ Impact: Constitution rewritten with 12 principles; MAJOR version bump to 2.0.0
- 🧪 Tests: N/A (governance document)
- 📁 Files: .specify/memory/constitution.md
- 🔁 Next prompts: Update existing specs to reference new principle numbers if needed
- 🧠 Reflection: User provided a comprehensive principle set; mapped cleanly to existing template structure

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual validation PASS — no unresolved placeholders, dates ISO, version matches report
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
