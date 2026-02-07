"""TodoService - Business logic for managing tasks in memory."""

from typing import List, Optional
from uuid import UUID

from src.models.task import Task


class TodoService:
    """Service for managing todo tasks with in-memory storage.

    Attributes:
        tasks: List of all tasks stored in memory
    """

    def __init__(self) -> None:
        """Initialize the TodoService with an empty task list."""
        self._tasks: List[Task] = []

    def add_task(self, title: str) -> Task:
        """Add a new task to the todo list.

        Args:
            title: The task description

        Returns:
            The newly created Task

        Raises:
            ValueError: If title is empty after stripping
        """
        task = Task.create(title)
        self._tasks.append(task)
        return task

    def list_tasks(self) -> List[Task]:
        """Return all tasks in creation order.

        Returns:
            List of all tasks (pending and completed)
        """
        return list(self._tasks)

    def get_task(self, task_id: UUID) -> Optional[Task]:
        """Find a task by its ID.

        Args:
            task_id: The UUID of the task to find

        Returns:
            The Task if found, None otherwise
        """
        for task in self._tasks:
            if task.id == task_id:
                return task
        return None

    def mark_complete(self, task_id: UUID) -> bool:
        """Mark a task as completed.

        Args:
            task_id: The UUID of the task to mark complete

        Returns:
            True if task was found and updated, False if not found
        """
        task = self.get_task(task_id)
        if task is None:
            return False
        # Create a new task with completed=True (immutable id)
        index = self._tasks.index(task)
        self._tasks[index] = Task(
            id=task.id,
            title=task.title,
            completed=True
        )
        return True

    def update_task(self, task_id: UUID, new_title: str) -> bool:
        """Update a task's title.

        Args:
            task_id: The UUID of the task to update
            new_title: The new title for the task

        Returns:
            True if task was found and updated, False if not found

        Raises:
            ValueError: If new_title is empty after stripping
        """
        task = self.get_task(task_id)
        if task is None:
            return False
        stripped_title = new_title.strip()
        if not stripped_title:
            raise ValueError("Task title cannot be empty")
        index = self._tasks.index(task)
        self._tasks[index] = Task(
            id=task.id,
            title=stripped_title,
            completed=task.completed
        )
        return True

    def delete_task(self, task_id: UUID) -> bool:
        """Delete a task from the list.

        Args:
            task_id: The UUID of the task to delete

        Returns:
            True if task was found and deleted, False if not found
        """
        task = self.get_task(task_id)
        if task is None:
            return False
        self._tasks.remove(task)
        return True
