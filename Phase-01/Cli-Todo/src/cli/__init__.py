"""CLI interface for the Todo application.

Provides interactive command-line interface for managing todo tasks
with a polished user experience using ANSI colors and icons.
"""

from typing import Optional
from uuid import UUID

from src.models.task import Task
from src.services import TodoService
from src.cli.ui import (
    Icons,
    Theme,
    Colors,
    print_banner,
    print_menu,
    print_task_list,
    print_success,
    print_error,
    print_warning,
    print_info,
    print_prompt,
    print_header,
    confirm_action,
    format_task_id,
    task_status,
    bold,
)


# ============================================================================
# Menu Configuration
# ============================================================================

MENU_TITLE = "CLI-TODO Menu"

MENU_ITEMS = [
    (1, Icons.ADD, "Add a new task", None),
    (2, Icons.VIEW, "View all tasks", None),
    (3, Icons.EDIT, "Update a task", None),
    (4, Icons.DELETE, "Delete a task", None),
    (5, Icons.IMPORTANT, "Mark task as complete", None),
    (6, Icons.CANCEL, "Exit the application", "q"),
]


# ============================================================================
# Prompt Functions
# ============================================================================

def prompt_task_title() -> Optional[str]:
    """Prompt the user for a task title.

    Returns:
        The input title (stripped), or None if empty
    """
    title = print_prompt("Enter task title")
    stripped = title.strip()

    if not stripped:
        print_warning("Task title cannot be empty")
        return None

    # Provide hint for long input
    if len(stripped) > 100:
        print_info("Title will be truncated if too long")

    return stripped


def prompt_task_selection(tasks: list[Task]) -> Optional[UUID]:
    """Prompt user to select a task by number or UUID.

    Args:
        tasks: List of available tasks to display

    Returns:
        The selected task's UUID, or None if invalid
    """
    if not tasks:
        print_info("No tasks available. Add a task first!")
        return None

    # Prepare task list for display
    task_data = [
        (str(task.id), task.title, task.completed)
        for task in tasks
    ]

    print_header("Select a Task")
    print_task_list(task_data)
    print_info("Enter the task number or full UUID")

    selection = print_prompt("Task number or ID")

    # Try numeric selection first
    if selection.isdigit():
        num = int(selection)
        if 1 <= num <= len(tasks):
            return tasks[num - 1].id
        print_error(f"Invalid task number. Enter 1-{len(tasks)}")
        return None

    # Try UUID selection
    try:
        selected_uuid = UUID(selection)
        # Verify the UUID exists in tasks
        for task in tasks:
            if task.id == selected_uuid:
                return selected_uuid
        print_error("Task with that ID not found")
        return None
    except ValueError:
        print_error("Invalid selection. Enter a number or valid UUID")
        return None


# ============================================================================
# CLI Command Functions
# ============================================================================

def cli_add_task(service: TodoService) -> None:
    """Handle the add task CLI interaction.

    Args:
        service: The TodoService instance
    """
    print_header(f"{Icons.ADD} Add New Task")

    title = prompt_task_title()
    if title is None:
        return

    task = service.add_task(title)
    print_success(f"Task added successfully")
    print(f"  {format_task_id(str(task.id))} {bold(task.title)}")


def cli_view_tasks(service: TodoService) -> None:
    """Handle the view tasks CLI interaction.

    Args:
        service: The TodoService instance
    """
    print_header(f"{Icons.VIEW} Your Tasks")

    tasks = service.list_tasks()
    task_data = [
        (str(task.id), task.title, task.completed)
        for task in tasks
    ]
    print_task_list(task_data)

    # Show summary
    if tasks:
        completed_count = sum(1 for t in tasks if t.completed)
        pending_count = len(tasks) - completed_count
        print_info(
            f"Summary: {completed_count} completed, "
            f"{pending_count} pending"
        )


def cli_mark_complete(service: TodoService) -> None:
    """Handle the mark complete CLI interaction.

    Args:
        service: The TodoService instance
    """
    print_header(f"{Icons.IMPORTANT} Mark Task Complete")

    tasks = service.list_tasks()
    task_id = prompt_task_selection(tasks)
    if task_id is None:
        return

    task = service.get_task(task_id)
    if task is None:
        print_error("Task not found")
        return

    if task.completed:
        print_warning("This task is already completed")
        return

    if service.mark_complete(task_id):
        print_success(f"Task marked as complete")
        print(f"  {task_status(True)} {bold(task.title)}")
    else:
        print_error("Failed to mark task as complete")


def cli_update_task(service: TodoService) -> None:
    """Handle the update task CLI interaction.

    Args:
        service: The TodoService instance
    """
    print_header(f"{Icons.EDIT} Update Task")

    tasks = service.list_tasks()
    task_id = prompt_task_selection(tasks)
    if task_id is None:
        return

    old_task = service.get_task(task_id)
    if old_task is None:
        print_error("Task not found")
        return

    print_info(f"Current title: {bold(old_task.title)}")

    new_title = prompt_task_title()
    if new_title is None:
        return

    if new_title == old_task.title:
        print_info("No changes made")
        return

    if confirm_action(f"update task to '{new_title[:30]}...'"):
        if service.update_task(task_id, new_title):
            print_success("Task updated successfully")
        else:
            print_error("Failed to update task")
    else:
        print_info("Update cancelled")


def cli_delete_task(service: TodoService) -> None:
    """Handle the delete task CLI interaction.

    Args:
        service: The TodoService instance
    """
    print_header(f"{Icons.DELETE} Delete Task")

    tasks = service.list_tasks()
    task_id = prompt_task_selection(tasks)
    if task_id is None:
        return

    task = service.get_task(task_id)
    if task is None:
        print_error("Task not found")
        return

    print_warning(f"This will permanently delete:")
    print(f"  {task_status(task.completed)} {bold(task.title)}")
    print(f"  {format_task_id(str(task.id))}")

    if confirm_action("delete this task"):
        if service.delete_task(task_id):
            print_success("Task deleted successfully")
        else:
            print_error("Failed to delete task")
    else:
        print_info("Deletion cancelled")


# ============================================================================
# Main CLI Loop
# ============================================================================

def run_cli_loop(service: TodoService) -> None:
    """Run the main CLI menu loop.

    Args:
        service: The TodoService instance
    """
    # Print startup banner
    print_banner()
    print_info("Welcome to CLI-TODO! Use numbers to select options.")
    print()

    while True:
        print_menu(MENU_TITLE, MENU_ITEMS)

        choice = print_prompt("Enter your choice")

        # Handle both number and hotkey
        if choice.lower() in ("q", "6", "quit", "exit"):
            print()
            print_success("Thank you for using CLI-TODO!")
            print_info("Have a productive day!")
            print()
            break

        if choice == "1":
            cli_add_task(service)
        elif choice == "2":
            cli_view_tasks(service)
        elif choice == "3":
            cli_update_task(service)
        elif choice == "4":
            cli_delete_task(service)
        elif choice == "5":
            cli_mark_complete(service)
        else:
            print_error(f"Invalid choice: '{choice}'. Enter 1-6 or 'q' to quit.")
            print_info("Press Enter to continue...", end="")
            input()
