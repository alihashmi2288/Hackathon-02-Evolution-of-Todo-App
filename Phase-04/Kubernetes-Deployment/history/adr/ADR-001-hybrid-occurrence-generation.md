# ADR-001: Hybrid Occurrence Generation for Recurring Tasks

> **Scope**: This ADR documents the data architecture strategy for generating and storing recurring task occurrences, balancing query performance with storage efficiency.

- **Status:** Accepted
- **Date:** 2026-01-23
- **Feature:** 006-recurring-reminders
- **Context:** The recurring tasks feature requires a strategy for handling potentially infinite series of todo occurrences. Users need to see "what's due today" quickly, complete individual occurrences, and have the system automatically generate future instances. The key challenge is balancing three competing concerns: query performance for date-range filtering, storage efficiency for long-running series, and simplicity of implementation.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security? ✅ Yes - defines core data model for recurring tasks
     2) Alternatives: Multiple viable options considered with tradeoffs? ✅ Yes - pure virtual, pure materialized, hybrid
     3) Scope: Cross-cutting concern (not an isolated detail)? ✅ Yes - affects backend models, APIs, services, and frontend queries
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

We will use a **hybrid occurrence generation strategy** that combines bounded materialization with on-demand generation:

**Core Strategy:**
- **Materialization Window**: Generate and store the next 30 days of occurrences in a `todo_occurrences` table
- **Background Refresh**: Daily job generates occurrences for next 7 days for all active series
- **On-Completion Generation**: When an occurrence is completed, generate the next occurrence if within the window
- **RRULE Storage**: Store the recurrence rule as an RFC 5545 RRULE string on the parent `Todo` for unlimited future calculation

**Data Model:**
- Parent `todos` table: Extended with `is_recurring`, `rrule`, `recurrence_end_date`, `recurrence_count`, `occurrences_generated`
- Child `todo_occurrences` table: `id`, `parent_todo_id`, `user_id`, `occurrence_date`, `status` (pending/completed/skipped)

**Key Indexes:**
```sql
CREATE INDEX idx_occurrences_user_due ON todo_occurrences(user_id, occurrence_date);
CREATE UNIQUE CONSTRAINT uq_occurrence_date ON todo_occurrences(parent_todo_id, occurrence_date);
```

## Consequences

### Positive

1. **Fast Date-Range Queries**: "What's due today?" is a simple indexed query on `todo_occurrences` - no RRULE calculation at query time
2. **Bounded Storage**: Maximum ~30 rows per recurring todo at any time, regardless of series length
3. **Individual Completion Tracking**: Each occurrence has its own status, allowing skip/complete without affecting the series
4. **Familiar Query Patterns**: Frontend can query todos the same way as non-recurring items
5. **Offline Resilience**: Pre-generated occurrences don't require complex calculation client-side
6. **Audit Trail**: Completed/skipped occurrences persist for historical review

### Negative

1. **Background Job Dependency**: Requires a daily scheduled job to maintain the occurrence window; if job fails, far-future views may be empty
2. **Storage Overhead**: Each occurrence is a row (~50-100 bytes each), adding ~3KB per recurring todo
3. **Eventual Consistency**: Newly created recurring todos won't show occurrences beyond 30 days until background job runs
4. **Complexity**: Two-table model is more complex than single-table with virtual calculation
5. **Cascade Considerations**: Editing "all future occurrences" requires bulk update of materialized rows

## Alternatives Considered

### Alternative A: Pure Virtual (On-Demand Calculation)

Store only the RRULE; calculate occurrences dynamically at query time.

| Pros | Cons |
|------|------|
| Zero storage overhead | Expensive queries: must calculate RRULE for every recurring todo |
| Always accurate | Complex JOINs for "due today" across multiple series |
| No background jobs | Individual occurrence status requires separate tracking table anyway |

**Why Rejected**: Query performance degrades as users create more recurring todos. Calculating RRULE for 100 series on every page load is unacceptable.

### Alternative B: Pure Materialization (Generate All)

Pre-generate all occurrences up to the end date (or a far horizon like 5 years).

| Pros | Cons |
|------|------|
| Simplest query model | Storage explosion: "forever" series generates unlimited rows |
| Fast queries | Bulk operations to create/update thousands of rows |
| No calculation at runtime | Editing series title requires updating all future rows |

**Why Rejected**: Unbounded storage for "daily forever" series (365+ rows/year). Difficult to handle truly infinite series.

### Alternative C: Calendar Service Integration

Delegate to external calendar service (Google Calendar API, iCal server).

| Pros | Cons |
|------|------|
| Offloads complexity | External dependency; increases latency |
| Rich recurrence features | Sync complexity; conflict resolution |
| Industry-standard | Out of scope; user data leaves our system |

**Why Rejected**: Adds external dependency, increases complexity, and moves user data outside our control. Out of scope for this feature.

## References

- Feature Spec: [specs/006-recurring-reminders/spec.md](../../specs/006-recurring-reminders/spec.md)
- Implementation Plan: [specs/006-recurring-reminders/plan.md](../../specs/006-recurring-reminders/plan.md)
- Research Document: [specs/006-recurring-reminders/research.md](../../specs/006-recurring-reminders/research.md)
- Data Model: [specs/006-recurring-reminders/data-model.md](../../specs/006-recurring-reminders/data-model.md)
- Related ADRs: None (first ADR for this feature)
- Evaluator Evidence: Performance requirements in spec (SC-006: 100 recurring todos/user, SC-007: notification center < 1s)
