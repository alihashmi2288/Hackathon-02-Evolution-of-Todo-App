# Research: Core Todo Functionality

## Summary
Research findings for implementing a Phase-1 In-Memory Todo Console App with Python 3.13+.

## Technical Decisions

### Language & Version
- **Decision**: Python 3.13+
- **Rationale**: Mandated by project constraints and constitution. Python 3.13 provides improved performance and modern language features.

### Dependencies Strategy
- **Decision**: No external dependencies for core functionality
- **Rationale**: Spec explicitly requires "No file system usage, No database usage, No external APIs". Standard library `dataclasses` and `uuid` will be used.

### Storage Strategy
- **Decision**: In-memory list/dictionary using Python dataclass
- **Rationale**: Phase I requirement for in-memory storage. Data resets on program restart as specified.
- **Alternatives Considered**:
  - SQLite: Rejected - violates "no database usage" constraint
  - JSON file: Rejected - violates "no file system usage" constraint

### CLI Framework
- **Decision**: Python standard library (argparse or simple input() loop)
- **Rationale**: Keep it simple for Phase I. No external CLI libraries needed for basic menu-driven interface.
- **Alternatives Considered**:
  - Click/Typer: Rejected - adds unnecessary dependency for simple Phase I
  - Rich: Rejected - scope creep for basic functionality

### Project Structure
- **Decision**: Standard single-project structure with `src/` and `tests/`
- **Rationale**: Follows Clean Code principles (Principle IV) and constitution requirements.

### Testing Framework
- **Decision**: pytest
- **Rationale**: Mandated by constitution. Standard for Python testing.

## Out of Scope
- File persistence (Phase II)
- Database integration (Phase II)
- Advanced CLI features (colored output, pagination)
- User authentication

## Best Practices Applied
1. Single Responsibility Principle - CLI and business logic separation
2. Type hints - Python 3.13+ native support
3. Dataclasses - Clean data model representation
4. UUID - Unique task identification
5. pytest fixtures - Reusable test setup
