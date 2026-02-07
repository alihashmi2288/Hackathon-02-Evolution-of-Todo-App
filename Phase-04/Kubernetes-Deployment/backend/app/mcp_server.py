"""
MCP tool implementations for the AI Todo Chatbot.

Task Reference: T003 (007-ai-todo-chatbot)
Feature: 007-ai-todo-chatbot

Plain functions (no decorators) that implement todo CRUD operations.
These are wrapped with @function_tool in routers/chat.py via scoped closures
that inject user_id from JWT.
"""

from typing import List, Optional

from pydantic import ValidationError

from app.database import get_session_context
from app.services.todo import TodoService
from app.schemas.todo import TodoCreate, TodoUpdate


def add_task(user_id: str, title: str, description: Optional[str] = None) -> dict:
    """
    Create a new task.
    Args:
        user_id: The ID of the user owning the task.
        title: The title of the task.
        description: Optional detailed description.
    """
    with get_session_context() as session:
        try:
            todo_data = TodoCreate(title=title, description=description)
            todo = TodoService.create_todo(session, user_id, todo_data)
            return {
                "task_id": todo.id,
                "status": "created",
                "title": todo.title
            }
        except ValidationError as e:
            return {"error": str(e)}
        except Exception as e:
            return {"error": f"Failed to create task: {str(e)}"}


def list_tasks(user_id: str, status: Optional[str] = "all") -> List[dict]:
    """
    Retrieve tasks from the list.
    Args:
        user_id: The ID of the user.
        status: Filter by status ("all", "active", "completed", "pending").
                "pending" is treated as "active".
    """
    valid_status = status
    if status == "pending":
        valid_status = "active"

    # Map "all" to None for TodoService
    service_status = valid_status if valid_status != "all" else None

    with get_session_context() as session:
        todos = TodoService.get_todos(session, user_id, status=service_status)
        return [
            {
                "id": t.id,
                "title": t.title,
                "completed": t.completed,
                "priority": t.priority,
                "due_date": t.due_date.isoformat() if t.due_date else None
            }
            for t in todos
        ]


def complete_task(user_id: str, task_id: str) -> dict:
    """
    Mark a task as complete.
    Args:
        user_id: The ID of the user.
        task_id: The ID of the task to complete.
    """
    with get_session_context() as session:
        update_data = TodoUpdate(completed=True)
        todo = TodoService.update_todo(session, user_id, task_id, update_data)

        if todo:
            return {
                "task_id": todo.id,
                "status": "completed",
                "title": todo.title
            }
        else:
            return {"error": "Task not found"}


def delete_task(user_id: str, task_id: str) -> dict:
    """
    Remove a task from the list.
    Args:
        user_id: The ID of the user.
        task_id: The ID of the task to delete.
    """
    with get_session_context() as session:
        todo = TodoService.get_todo_by_id(session, user_id, task_id)
        if not todo:
            return {"error": "Task not found"}

        title = todo.title
        success = TodoService.delete_todo(session, user_id, task_id)

        if success:
            return {
                "task_id": task_id,
                "status": "deleted",
                "title": title
            }
        else:
            return {"error": "Failed to delete task"}


def update_task(user_id: str, task_id: str, title: Optional[str] = None, description: Optional[str] = None) -> dict:
    """
    Modify task title or description.
    Args:
        user_id: The ID of the user.
        task_id: The ID of the task.
        title: New title (optional).
        description: New description (optional).
    """
    with get_session_context() as session:
        update_data = TodoUpdate(title=title, description=description)
        todo = TodoService.update_todo(session, user_id, task_id, update_data)

        if todo:
            return {
                "task_id": todo.id,
                "status": "updated",
                "title": todo.title
            }
        else:
            return {"error": "Task not found"}
