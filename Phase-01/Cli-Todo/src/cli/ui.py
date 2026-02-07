"""UI module for the Todo CLI application.

Provides ANSI color codes, icon constants, formatter functions,
and display utilities for a polished terminal experience.
"""

from typing import Optional


# ============================================================================
# ANSI Color Codes
# ============================================================================

class Colors:
    """Terminal color codes using ANSI escape sequences."""

    # Basic colors
    BLACK = "\033[30m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN = "\033[36m"
    WHITE = "\033[37m"

    # Bright/bold colors
    BRIGHT_BLACK = "\033[90m"
    BRIGHT_RED = "\033[91m"
    BRIGHT_GREEN = "\033[92m"
    BRIGHT_YELLOW = "\033[93m"
    BRIGHT_BLUE = "\033[94m"
    BRIGHT_MAGENTA = "\033[95m"
    BRIGHT_CYAN = "\033[96m"
    BRIGHT_WHITE = "\033[97m"

    # Background colors
    BG_RED = "\033[41m"
    BG_GREEN = "\033[42m"
    BG_YELLOW = "\033[43m"
    BG_BLUE = "\033[44m"

    # Text formatting
    BOLD = "\033[1m"
    DIM = "\033[2m"
    ITALIC = "\033[3m"
    UNDERLINE = "\033[4m"
    RESET = "\033[0m"


# ============================================================================
# Icon Constants (Unicode symbols)
# ============================================================================

class Icons:
    """Unicode icon constants for UI elements."""

    # Task status
    COMPLETED = "✔"  # Completed task
    PENDING = "○"    # Pending task

    # Actions
    ADD = "📝"       # Add task
    VIEW = "👁"       # View tasks
    EDIT = "✏"       # Update task
    DELETE = "🗑"      # Delete task

    # Dialog
    CONFIRM = "✓"     # Yes/confirm
    CANCEL = "✗"      # No/cancel

    # Emphasis
    IMPORTANT = "🔥"  # Featured/important
    INFO = "ℹ"        # Information
    WARNING = "⚠"     # Warning

    # Keys
    ENTER = "↵"       # Enter key


# ============================================================================
# Color Themes for Different UI Elements
# ============================================================================

class Theme:
    """Color themes for consistent UI styling."""

    # Primary UI elements
    HEADER = Colors.BRIGHT_BLUE + Colors.BOLD
    SUCCESS = Colors.BRIGHT_GREEN
    ERROR = Colors.BRIGHT_RED
    WARNING = Colors.BRIGHT_YELLOW
    INFO = Colors.BRIGHT_CYAN
    DIM_TEXT = Colors.DIM

    # Menu styling
    MENU_NUMBER = Colors.BRIGHT_CYAN
    MENU_ICON = Colors.BRIGHT_MAGENTA
    MENU_DESC = Colors.WHITE

    # Task styling
    TASK_ID = Colors.DIM
    TASK_TITLE = Colors.WHITE
    TASK_COMPLETED = Colors.BRIGHT_GREEN
    TASK_PENDING = Colors.BRIGHT_YELLOW

    # Border/separator
    BORDER = Colors.BRIGHT_BLACK


# ============================================================================
# ASCII Logo
# ============================================================================

LOGO = rf"""
{Colors.BRIGHT_BLUE}╔══════════════════════════════════════════════════════════════╗
║{Colors.BRIGHT_CYAN}   _____             _                    _   _     _       {Colors.BRIGHT_BLUE}║
║{Colors.BRIGHT_CYAN}  / ____|           | |                  | | (_)   | |      {Colors.BRIGHT_BLUE}║
║{Colors.BRIGHT_CYAN} | (___   ___  ___  | |__   ___ _ __ ___ | |_ ___| |_ ___ {Colors.BRIGHT_BLUE}║
║{Colors.BRIGHT_CYAN}  \___ \ / _ \/ __| | '_ \ / _ \ '__/ _ \| __/ __| __/ __|{Colors.BRIGHT_BLUE}║
║{Colors.BRIGHT_CYAN}  ____) |  __/\__ \ | | | |  __/ | | (_) | |_\__ \ |_\__ \{Colors.BRIGHT_BLUE}║
║{Colors.BRIGHT_CYAN} |_____/ \___||___/ |_| |_|\___|_|  \___/ \__|___/\__|___/{Colors.BRIGHT_BLUE}║
║{Colors.BRIGHT_BLUE}                                                              ║
║{Colors.DIM}                     A Modern Todo CLI                               {Colors.BRIGHT_BLUE}║
║{Colors.DIM}                      Made by Syed Ali Hashmi                         {Colors.BRIGHT_BLUE}║
╚══════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}
"""


# ============================================================================
# Separator Lines
# ============================================================================

SEPARATOR_THIN = f"{Theme.BORDER}─" * 60 + Colors.RESET
SEPARATOR_THICK = f"{Theme.BORDER}━" * 60 + Colors.RESET
SEPARATOR_DOTTED = f"{Theme.BORDER}·" * 60 + Colors.RESET


# ============================================================================
# Formatter Functions
# ============================================================================

def bold(text: str) -> str:
    """Apply bold formatting to text.

    Args:
        text: The text to bold

    Returns:
        Bold-formatted text with reset
    """
    return f"{Colors.BOLD}{text}{Colors.RESET}"


def color(text: str, color_code: str) -> str:
    """Apply color to text.

    Args:
        text: The text to color
        color_code: ANSI color code

    Returns:
        Color-formatted text with reset
    """
    return f"{color_code}{text}{Colors.RESET}"


def success(text: str) -> str:
    """Format success message.

    Args:
        text: Success message text

    Returns:
        Green-formatted success message
    """
    return f"{Theme.SUCCESS}{text}{Colors.RESET}"


def error(text: str) -> str:
    """Format error message.

    Args:
        text: Error message text

    Returns:
        Red-formatted error message
    """
    return f"{Theme.ERROR}{text}{Colors.RESET}"


def warning(text: str) -> str:
    """Format warning message.

    Args:
        text: Warning message text

    Returns:
        Yellow-formatted warning message
    """
    return f"{Theme.WARNING}{text}{Colors.RESET}"


def info(text: str) -> str:
    """Format info message.

    Args:
        text: Info message text

    Returns:
        Cyan-formatted info message
    """
    return f"{Theme.INFO}{text}{Colors.RESET}"


def dim(text: str) -> str:
    """Format secondary/dim text.

    Args:
        text: Dimmed text

    Returns:
        Dim-formatted text
    """
    return f"{Theme.DIM_TEXT}{text}{Colors.RESET}"


def task_status(completed: bool) -> str:
    """Format task status with appropriate color.

    Args:
        completed: Whether the task is completed

    Returns:
        Formatted status icon with color
    """
    if completed:
        return f"{Theme.TASK_COMPLETED}{Icons.COMPLETED}{Colors.RESET}"
    return f"{Theme.TASK_PENDING}{Icons.PENDING}{Colors.RESET}"


# ============================================================================
# Display Functions
# ============================================================================

def print_banner() -> None:
    """Print the application startup banner with ASCII logo."""
    print(LOGO)


def print_separator(thin: bool = False) -> None:
    """Print a separator line.

    Args:
        thin: Use thin separator (default: thick)
    """
    if thin:
        print(SEPARATOR_THIN)
    else:
        print(SEPARATOR_THICK)


def print_header(text: str) -> None:
    """Print a section header.

    Args:
        text: Header text to display
    """
    print(f"\n{Theme.HEADER}{text}{Colors.RESET}")
    print(SEPARATOR_THIN)


def print_menu_item(
    number: int,
    icon: str,
    description: str,
    hotkey: Optional[str] = None,
) -> None:
    """Print a formatted menu item.

    Args:
        number: Menu item number
        icon: Icon for the menu item
        description: Description text
        hotkey: Optional hotkey hint (e.g., "[q] quit")
    """
    hotkey_part = f"  {dim(f'[{hotkey}]')}" if hotkey else ""
    print(
        f"  {Theme.MENU_NUMBER}{number:2}.{Colors.RESET} "
        f"{Theme.MENU_ICON}{icon}{Colors.RESET} "
        f"{Theme.MENU_DESC}{description}{Colors.RESET}"
        f"{hotkey_part}"
    )


def print_menu(
    title: str,
    items: list[tuple[int, str, str, Optional[str]]],
) -> None:
    """Print a formatted menu.

    Args:
        title: Menu title
        items: List of (number, icon, description, hotkey) tuples
    """
    print_header(title)
    for number, icon, description, hotkey in items:
        print_menu_item(number, icon, description, hotkey)
    print()


def print_task_list(
    tasks: list[tuple[str, str, bool]],
    empty_message: str = "No tasks available.",
) -> None:
    """Print a formatted task list.

    Args:
        tasks: List of (id, title, completed) tuples
        empty_message: Message to show when no tasks exist
    """
    if not tasks:
        print(f"\n  {dim(empty_message)}\n")
        return

    print(f"\n  {Theme.HEADER}{'ID':<8} {'Task Title':<40} Status{Colors.RESET}")
    print(SEPARATOR_THIN)

    for task_id, title, completed in tasks:
        # Truncate long titles
        display_title = title[:38] + ".." if len(title) > 40 else title
        status_icon = Icons.COMPLETED if completed else Icons.PENDING
        status_text = "Done" if completed else "Pending"
        status_color = Theme.TASK_COMPLETED if completed else Theme.TASK_PENDING

        print(
            f"  {dim(task_id[:8])}  "
            f"{display_title:<42} "
            f"{color(status_icon, status_color)} {status_text}"
        )

    print()


def print_success(message: str) -> None:
    """Print a success message with icon.

    Args:
        message: Success message text
    """
    print(f"  {Icons.CONFIRM} {success(message)}")


def print_error(message: str) -> None:
    """Print an error message with icon.

    Args:
        message: Error message text
    """
    print(f"  {Icons.CANCEL} {error(message)}")


def print_warning(message: str) -> None:
    """Print a warning message with icon.

    Args:
        message: Warning message text
    """
    print(f"  {Icons.WARNING} {warning(message)}")


def print_info(message: str) -> None:
    """Print an info message with icon.

    Args:
        message: Info message text
    """
    print(f"  {Icons.INFO} {info(message)}")


def print_prompt(prompt_text: str) -> str:
    """Print a formatted prompt and get user input.

    Args:
        prompt_text: Prompt message

    Returns:
        User input (stripped)
    """
    return input(f"  {dim(Icons.ENTER)} {prompt_text}: ").strip()


def confirm_action(action: str) -> bool:
    """Get user confirmation for a destructive action.

    Args:
        action: Description of the action being confirmed

    Returns:
        True if user confirmed, False otherwise
    """
    print(f"\n  {Icons.WARNING} {warning(f'Confirm {action}?')}")
    print(f"  {dim(f'Type {Icons.CONFIRM} to confirm or {Icons.CANCEL} to cancel: ')}", end="")
    response = input().strip().lower()

    if response in ("y", "yes", Icons.CONFIRM.lower(), "confirm"):
        return True
    return False


def format_task_id(task_id: str) -> str:
    """Format a task ID for display.

    Args:
        task_id: The task UUID

    Returns:
        Shortened, dimmed task ID
    """
    return dim(task_id[:8])
