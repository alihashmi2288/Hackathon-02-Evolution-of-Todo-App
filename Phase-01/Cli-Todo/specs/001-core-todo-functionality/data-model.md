# Data Model: Core Todo Functionality

## Entity: Task

### Attributes
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Required, Immutable | Unique identifier for the task |
| `title` | str | Required, Non-empty | Task description |
| `completed` | bool | Default: False | Completion status |

### Relationships
- Task is a standalone entity
- No foreign keys or relationships to other entities

### Validation Rules
1. `title` MUST be non-empty string (trimmed)
2. `title` length SHOULD be reasonable (e.g., < 1000 chars)
3. `completed` is toggled, not directly set (business rule)

### State Transitions
```
pending -> completed (via mark_complete)
completed -> pending (no, marking complete again stays completed)
(any) -> deleted (via delete, removed from collection)
```

### Storage Schema (In-Memory)
```python
tasks: List[Task]  # Main collection, ordered by creation
task_index: Dict[UUID, int]  # Fast lookup by ID
```

### Data Flow
1. **Add Task**: Create Task object with new UUID, append to list
2. **View Tasks**: Iterate list in order, format for display
3. **Update Task**: Find by UUID, replace title field
4. **Delete Task**: Find by UUID, remove from list
5. **Mark Complete**: Find by UUID, toggle completed flag
