<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Bump Rationale: Formalization of Principle tags and expanded Observability and Deployment constraints.
- Modified sections: Technical & Architectural Constraints, Governance.
- Added sections: VIII. Observable Resilience, IX. Deployment & CI/CD Integrity.
- Templates updated: ✅ .specify/templates/plan-template.md, ✅ .specify/templates/spec-template.md.
-->

# Todo Full-Stack Web Application – Project Constitution

**Version**: 1.1.0
**Ratification Date**: 2026-01-05
**Last Amended Date**: 2026-01-05

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)
**Principle**: All development must originate from a written specification. No implementation without a validated task; no task without a reviewed plan.
**Rationale**: Prevents "vibe coding" and ensures systemic alignment across multiple AI agents.

---

### II. Agentic Separation of Concerns
**Principle**: Each agent has a clear, exclusive responsibility. Backend, Frontend, Auth, and Security agents operate in isolation.
**Rationale**: Specialization ensures higher code quality and prevents "scope creep" within implementation tasks.

---

### III. Security-First & Zero-Trust Architecture
**Principle**: Security is enforced at every layer. Backend never trusts frontend input. All API requests require valid JWT authentication verified server-side.
**Rationale**: Protects user data and prevents unauthorized cross-tenant access.

---

### IV. API Contract Stability
**Principle**: The REST API contract is immutable once a feature is "Live" unless formally amended via a Spec/Plan update.
**Rationale**: ensures compatibility between the Next.js frontend and FastAPI backend during parallel development.

---

### V. Stateless Authentication via JWT
**Principle**: Authentication must be stateless, using Better Auth for issuance and FastAPI for local verification.
**Rationale**: simplifies scaling and maintains clean decoupling between the auth provider and the application logic.

---

### VI. Persistent Data Ownership
**Principle**: Every data row must be explicitly linked to a `user_id`. Queries must filter by the authenticated subject.
**Rationale**: Fundamental database-level protection against data leakage.

---

### VII. Simplicity & Reviewability
**Principle**: Prefer clarity over cleverness. No unnecessary abstractions (YAGNI). Explicit documentation for auth and security logic.
**Rationale**: ensures that both AI and Humans can audit the codebase with 100% confidence.

---

### VIII. Observable Resilience
**Principle**: All backend services must implement structured JSON logging and standardized error taxonomy with appropriate HTTP status codes.
**Rationale**: improves mean-time-to-recovery (MTTR) and provides audit trails for security events.

---

### IX. Deployment & CI/CD Integrity
**Principle**: No code reaches production without passing automated security scans and Playwright E2E tests for the "Auth-to-CRUD" happy path.
**Rationale**: ensures that the "Definition of Done" is measurable and enforceable.

---

## Technical & Architectural Constraints

- **Frontend**: Next.js 
- **Backend**: Python FastAPI 0.100+
- **ORM**: SQLModel 
- **Database**: Neon Serverless PostgreSQL
- **Auth**: Better Auth (JWT plugin enabled)
- **Secrets**: `.env` and environment variables only; never hardcoded
- **Sessions**: Strictly Stateless (JWT-based)
- **Testing**: Pytest (Backend), Vitest/Playwright (Frontend)

---

## Development Workflow

1. **Specify**: Update/Create `specs/<ID>-<feature>/spec.md`
2. **Plan**: Generate `specs/<ID>-<feature>/plan.md` (Suggest ADRs)
3. **Taskify**: Break into atomic tasks in `specs/<ID>-<feature>/tasks.md`
4. **Implement**: Use Claude Code sub-agents to write code via Task IDs
5. **Audit**: Run `security-auditor` after implementation
6. **Record**: Finalize PHR for the feature

---

## Governance

- This Constitution is the supreme governing document.
- **Amendment**: Requires a MINOR version bump (1.x.0) for new principles and a MAJOR bump (X.0.0) for redefined core mandates.
- **Compliance**: Any implementation violating a principle is considered FAILED and must be rolled back.
