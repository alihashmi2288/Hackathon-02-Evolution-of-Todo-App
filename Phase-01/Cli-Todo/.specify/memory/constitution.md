<!--
# Sync Impact Report
- Version change: null → 1.0.0
- List of modified principles:
  - PRINCIPLE_1: Spec-Driven Development (SDD) Mandatory
  - PRINCIPLE_2: No Manual Coding
  - PRINCIPLE_3: Test-First (Red-Green-Refactor)
  - PRINCIPLE_4: Clean Code & Pythonic Structure
  - PRINCIPLE_5: Reusable Intelligence (Agents/Skills)
- Added sections: Technology Stack, Deliverables & Phase I Scope, Development Workflow
- Templates requiring updates:
  - ✅ updated: .specify/memory/constitution.md
  - ⚠ pending: .specify/templates/plan-template.md
  - ⚠ pending: .specify/templates/spec-template.md
  - ⚠ pending: .specify/templates/tasks-template.md
-->

# Phase I: Todo In-Memory Python Console App Constitution

## Core Principles

### I. Spec-Driven Development (SDD) Mandatory
Every change MUST follow the "Agentic Dev Stack" workflow: Write spec → Generate plan → Break into tasks → Implement. No implementation should occur without an approved specification and plan in the `specs/` directory.

### II. No Manual Coding
Direct manual code editing is strictly prohibited. All code generation, modification, and fixing must be performed by Claude Code or specialized sub-agents based on the derived tasks. This ensures every line of code is traceable to a requirement.

### III. Test-First (Red-Green-Refactor)
TDD is non-negotiable. Tests must be defined in `tasks.md`, implemented by the `python-test-engineer`, and verified to FAIL (Red) before the `python-clean-code-agent` implements the functional logic (Green).

### IV. Clean Code & Pythonic Structure
Code must adhere to "Clean Code" principles: meaningful names, single responsibility, and minimal complexity. It must follow PEP 8 and use modern Python 3.13+ features. The project structure must be standard (`src/`, `tests/`, etc.).

### V. Reusable Intelligence
Leverage Claude Code Sub-agents and Agent Skills to maintain "reusable intelligence." Specialized agents (Spec Architect, Test Engineer, Clean Code Agent) must be used for their respective phases to ensure quality and consistency.

### VI. In-Memory Simplicity (Phase I)
Phase I focus is on in-memory storage. Avoid premature complexity like databases or external caching. Keep the data layer abstract enough for future Phase II migrations, but focus strictly on the 5 core features: Add, Delete, Update, View, and Mark Complete.

## Technology Stack

The project is strictly bound to the following stack:
- **Build Tool**: UV
- **Runtime**: Python 3.13+
- **Agentic Dev**: Claude Code & SpecKit Plus
- **Testing**: pytest

## Development Workflow & Quality Gates

### 1. Specification Gate
The `python-spec-architect` must finalize `specs/<feature>/spec.md` before planning. It must include all edge cases for the core features.

### 2. Planning Gate
Architectural plans in `plan.md` must be reviewed for alignment with Clean Code principles and the in-memory constraint.

### 3. Red Phase Gate
The `python-test-engineer` must demonstrate failing tests for all new requirements before the implementation phase begins.

## Governance

- This Constitution is the authoritative source for development standards.
- Amendments require a version bump and an updated Sync Impact Report.
- All Pull Requests must be verified against these principles using the `sp.analyze` or equivalent verification tools.
- Verification history is maintained in `history/prompts/`.

**Version**: 1.0.0 | **Ratified**: 2025-12-30 | **Last Amended**: 2025-12-30
