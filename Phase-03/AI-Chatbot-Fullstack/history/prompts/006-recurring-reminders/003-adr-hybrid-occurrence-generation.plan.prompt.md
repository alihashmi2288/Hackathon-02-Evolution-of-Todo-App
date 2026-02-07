---
id: 003
title: ADR Hybrid Occurrence Generation Strategy
stage: plan
date: 2026-01-23
surface: agent
model: claude-opus-4-5-20251101
feature: 006-recurring-reminders
branch: 006-recurring-reminders
user: alihashmi
command: /sp.adr
labels: ["adr", "architecture", "recurring-tasks", "data-model", "occurrence-generation"]
links:
  spec: specs/006-recurring-reminders/spec.md
  ticket: null
  adr: history/adr/ADR-001-hybrid-occurrence-generation.md
  pr: null
files:
  - history/adr/ADR-001-hybrid-occurrence-generation.md
  - specs/006-recurring-reminders/plan.md
tests:
  - none (architecture documentation)
---

## Prompt

Run /sp.adr hybrid-occurrence-generation

## Response snapshot

Created ADR-001: Hybrid Occurrence Generation for Recurring Tasks

**Decision**: Use a hybrid strategy combining:
- 30-day materialization window in `todo_occurrences` table
- Daily background job for occurrence refresh
- On-completion generation for next occurrence
- RRULE storage for unlimited future calculation

**Significance Test (all passed)**:
1. Impact: Defines core data model for recurring tasks ✅
2. Alternatives: 3 options evaluated (virtual, materialized, hybrid) ✅
3. Scope: Affects backend models, APIs, services, frontend queries ✅

**Alternatives Documented**:
- Pure Virtual: Rejected due to expensive queries at scale
- Pure Materialized: Rejected due to unbounded storage
- Calendar Service: Rejected due to external dependency

**Consequences**:
- Positive: Fast queries, bounded storage, individual tracking, familiar patterns
- Negative: Background job dependency, storage overhead, eventual consistency

Updated plan.md to reference ADR-001.

## Outcome

- Impact: Documented key architectural decision for recurring tasks data layer
- Tests: none (architecture documentation)
- Files: ADR-001 created, plan.md updated with ADR reference
- Next prompts: /sp.tasks to generate implementation tasks
- Reflection: ADR captures decision rationale for future reference and team alignment

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): Significance test PASS (3/3), Checklist grader PASS
- Prompt variant (if applicable): standard-adr
- Next experiment (smallest change to try): none needed
