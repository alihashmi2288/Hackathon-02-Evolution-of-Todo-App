"""
Priority enum for todo priority levels.

Task Reference: T001 - Create Priority enum
Feature: 005-todo-enhancements

Provides a PostgreSQL ENUM type for todo priority levels.
"""

from enum import Enum


class Priority(str, Enum):
    """
    Priority levels for todos.

    Inherits from str for JSON serialization compatibility
    and Enum for type safety.

    Values:
        HIGH: Urgent tasks (displayed in red)
        MEDIUM: Normal priority (displayed in yellow)
        LOW: Can wait (displayed in gray)
    """

    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
