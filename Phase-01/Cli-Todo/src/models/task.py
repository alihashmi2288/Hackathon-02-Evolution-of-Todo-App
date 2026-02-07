"""Task data model for the Todo application."""

from dataclasses import dataclass
from uuid import UUID, uuid4


@dataclass(frozen=True)
class Task:
    """Represents a single todo task.

    Attributes:
        id: Unique identifier for the task (immutable)
        title: Task description (must be non-empty)
        completed: Whether the task is done (default: False)
    """

    id: UUID
    title: str
    completed: bool = False

    @classmethod
    def create(cls, title: str) -> "Task":
        """Create a new task with a generated UUID.

        Args:
            title: The task description (will be stripped of whitespace)

        Returns:
            A new Task instance with pending status

        Raises:
            ValueError: If title is empty after stripping
        """
        stripped_title = title.strip()
        if not stripped_title:
            raise ValueError("Task title cannot be empty")
        return cls(id=uuid4(), title=stripped_title, completed=False)
