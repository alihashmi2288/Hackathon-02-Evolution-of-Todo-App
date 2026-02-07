<!--
Sync Impact Report:
- Version change: 1.1.0 → 2.0.0
- Bump Rationale: MAJOR — Complete redefinition of core principles (12 principles
  replacing 9), new numbering, new governance mandates (MCP-First, Tool Determinism,
  AI Provider Independence, Stateless by Design). Backward-incompatible governance change.
- Modified principles:
  - I. Spec-Driven Development → I. Spec-First Development (strengthened: NON-NEGOTIABLE tag)
  - II. Agentic Separation of Concerns → II. Agentic Dev Stack Enforcement (redefined scope)
  - III. Security-First & Zero-Trust → III. Correction Over Preservation (replaced entirely)
  - IV. API Contract Stability → IV. Stateless by Design (replaced entirely)
  - V. Stateless Authentication via JWT → V. MCP-First AI Integration (replaced entirely)
  - VI. Persistent Data Ownership → VI. Tool Determinism (replaced entirely)
  - VII. Simplicity & Reviewability → VII. Authentication & Identity (replaced entirely)
  - VIII. Observable Resilience → VIII. Security by Default (replaced entirely)
  - IX. Deployment & CI/CD Integrity → IX. API Contract Stability (replaced entirely)
- Added principles:
  - X. Observability & Debuggability
  - XI. Simplicity & YAGNI
  - XII. AI Provider Independence
- Added sections:
  - AI Layer (under Architectural Constraints)
  - Reviews (under Development Workflow)
- Removed sections:
  - Complexity Tracking reference (was not in constitution, only in plan template)
- Templates status:
  - ✅ .specify/templates/plan-template.md — Constitution Check section is dynamic; no update needed
  - ✅ .specify/templates/spec-template.md — No constitution-specific references; no update needed
  - ✅ .specify/templates/tasks-template.md — No constitution-specific references; no update needed
- Follow-up TODOs: None
-->

# Todo Full-Stack + AI Chatbot Project – Project Constitution

**Version**: 2.0.0
**Ratification Date**: 2026-01-05
**Last Amended Date**: 2026-02-01

> This Constitution defines the non-negotiable rules, principles, and
> governance for the Todo Full-Stack + AI Chatbot Project. This document
> supersedes all other instructions, specs, READMEs, comments, and
> human assumptions.

## Core Principles

### I. Spec-First Development (NON-NEGOTIABLE)

**Principle**: No feature, refactor, or fix may be implemented without
a written specification. Specs MUST be written before planning or
coding. Specs are the single source of truth. Manual coding without a
spec is considered a violation.

**Rationale**: Prevents "vibe coding" and ensures systemic alignment
across multiple AI agents and human reviewers.

---

### II. Agentic Dev Stack Enforcement

**Principle**: Development MUST follow this exact workflow:
1. Write spec
2. Generate plan
3. Break into tasks
4. Implement via Claude Code

Humans may review and guide, but MUST NOT manually implement logic.
Claude Code is the primary executor.

**Rationale**: Enforces traceability from requirement to code and
ensures every change is auditable through the spec-plan-task chain.

---

### III. Correction Over Preservation

**Principle**: Existing code may be incorrect, incomplete, or
misaligned. Claude is explicitly authorized to:
- Rewrite code
- Delete code
- Refactor architecture
- Change APIs

Correctness takes precedence over backward compatibility.
Human-written code has no special protection.

**Rationale**: Prevents accumulation of technical debt and ensures the
codebase converges toward the specification, not away from it.

---

### IV. Stateless by Design

**Principle**: No backend service may store runtime state in memory.
No AI agent may store memory between requests. All state MUST live in
the database. Server restarts MUST NOT affect functionality.

**Rationale**: Enables horizontal scaling, simplifies deployment, and
eliminates an entire class of state-synchronization bugs.

---

### V. MCP-First AI Integration

**Principle**: AI agents MUST interact with the system exclusively via
MCP tools. Agents MUST NOT:
- Access databases directly
- Call internal services directly

MCP tools are the only interface between AI and business logic.

**Rationale**: Creates a uniform, auditable, and permission-controlled
boundary between AI capabilities and application internals.

---

### VI. Tool Determinism

**Principle**: MCP tools MUST be:
- Stateless
- Deterministic
- Idempotent where possible

Tools MUST validate ownership and permissions. Tool responses MUST
follow documented schemas.

**Rationale**: Deterministic tools produce predictable agent behavior,
simplify testing, and prevent side-effect-driven bugs.

---

### VII. Authentication & Identity

**Principle**: Authentication is mandatory for all user data access.
User identity MUST be derived from auth/session context. The system
MUST NEVER:
- Ask users to provide user_id
- Trust client-supplied user identifiers

Authorization is enforced server-side only.

**Rationale**: Eliminates identity spoofing and ensures every data
access is cryptographically tied to a verified session.

---

### VIII. Security by Default

**Principle**: All API endpoints require authentication unless
explicitly exempted in the spec. Unauthorized access returns 401.
Cross-user data access is forbidden. Secrets MUST be managed via
environment variables only.

**Rationale**: Defense-in-depth ensures that security is the default
posture, not an opt-in afterthought.

---

### IX. API Contract Stability

**Principle**: APIs MUST be RESTful and predictable. Breaking changes
require spec updates. All endpoints MUST enforce user ownership.

**Rationale**: Ensures compatibility between the Next.js frontend and
FastAPI backend during parallel development.

---

### X. Observability & Debuggability

**Principle**: Structured logging is required for:
- API requests
- Tool calls
- Agent execution

Errors MUST be explicit, not silent. Fail fast over hidden failures.

**Rationale**: Improves mean-time-to-recovery (MTTR) and provides
audit trails for security events and agent behavior analysis.

---

### XI. Simplicity & YAGNI

**Principle**: No speculative features. No unused abstractions. Start
simple, evolve via specs. Complexity MUST be justified in the spec.

**Rationale**: Reduces cognitive load for both AI agents and human
reviewers, and prevents premature optimization.

---

### XII. AI Provider Independence

**Principle**: The system MUST support non-paid AI providers. Gemini
Free API is the default execution target. OpenAI SDKs may be used only
as abstractions. No hard dependency on paid OpenAI APIs.

**Rationale**: Avoids vendor lock-in and ensures the project remains
accessible without requiring paid API subscriptions.

---

## Technical & Architectural Constraints

### Backend
- **Language**: Python 3.12
- **Framework**: FastAPI 0.100+
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Auth Validation**: python-jose (JWT verification)
- **Secrets**: `.env` and environment variables only; never hardcoded
- **Sessions**: Strictly stateless (JWT-based)
- **Testing**: Pytest

### Frontend
- **Framework**: Next.js 16.0.10 (App Router)
- **Language**: TypeScript 5.6+
- **UI**: React 19.x, Tailwind CSS 3.4+
- **AI UI**: ChatKit
- **Auth**: Better Auth (JWT plugin enabled)
- **Testing**: Vitest / Playwright

### AI Layer
- **SDK**: OpenAI Agents SDK (as abstraction only)
- **MCP**: Official MCP SDK
- **Execution**: Stateless agent execution
- **Default Provider**: Gemini Free API

---

## Development Workflow

1. **Specify**: Update/Create `specs/<ID>-<feature>/spec.md`
2. **Plan**: Generate `specs/<ID>-<feature>/plan.md` (Suggest ADRs)
3. **Taskify**: Break into atomic tasks in `specs/<ID>-<feature>/tasks.md`
4. **Implement**: Use Claude Code sub-agents to write code via Task IDs
5. **Audit**: Run `security-auditor` after implementation
6. **Record**: Finalize PHR for the feature

### Specs
- Stored under `/specs`
- Named by phase and purpose
- MUST include: Objective, Constraints, Acceptance criteria

### Reviews
- Every PR or implementation cycle MUST be reviewed against this
  Constitution before merge
- Security-critical changes require `security-auditor` agent pass

---

## Governance

- This Constitution is the supreme governing document.
- **Amendment**: Requires a MAJOR version bump (X.0.0) for redefined
  core mandates or principle removals. MINOR bump (1.X.0) for new
  principles or materially expanded guidance. PATCH bump (1.1.X) for
  clarifications and wording fixes.
- **Compliance**: Any implementation violating a principle is
  considered FAILED and MUST be rolled back.
- **Review Cadence**: Constitution alignment MUST be verified at the
  start of each new feature spec.
