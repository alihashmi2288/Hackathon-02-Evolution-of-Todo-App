# Quickstart: Phase-1 Todo App

## Setup

```bash
# Initialize UV project
uv init --python 3.13

# Add pytest for testing
uv add --dev pytest
```

## Project Structure

```
src/
├── __init__.py
├── models/
│   └── task.py      # Task dataclass
├── services/
│   └── __init__.py  # TodoService class
├── cli/
│   └── __init__.py  # Menu-driven CLI interface
└── main.py          # Entry point

tests/
├── __init__.py
└── test_task.py     # Unit tests
```

## Running the App

```bash
# Development
python src/main.py

# Or with UV
uv run python src/main.py
```

## Running Tests

```bash
uv pytest tests/ -v
```

## Usage

```
=== Todo App ===
1. Add task
2. View tasks
3. Update task
4. Delete task
5. Mark complete
6. Exit
```

## Next Steps
- Run `/sp.tasks` to generate implementation tasks
- Run `/sp.analyze` to verify plan compliance
