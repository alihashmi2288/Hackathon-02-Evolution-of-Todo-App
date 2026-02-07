"""
TodoTag junction model for many-to-many relationship.

Task Reference: T003 - Create TodoTag junction model
Feature: 005-todo-enhancements

Provides the junction table for the many-to-many relationship
between Todos and Tags with cascade delete behavior.
"""

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Index
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .tag import Tag
    from .todo import Todo


class TodoTag(SQLModel, table=True):
    """
    Junction table for Todo-Tag many-to-many relationship.

    Attributes:
        todo_id: FK to todos.id (cascade delete)
        tag_id: FK to tags.id (cascade delete)

    Cascade Behavior:
        - Delete todo → deletes all associated todo_tags
        - Delete tag → deletes all associated todo_tags
    """

    __tablename__ = "todo_tags"
    __table_args__ = (
        Index("idx_todo_tags_tag_id", "tag_id"),
    )

    todo_id: str = Field(
        foreign_key="todos.id",
        primary_key=True,
        max_length=21,
        ondelete="CASCADE",
        description="FK to todos.id",
    )
    tag_id: str = Field(
        foreign_key="tags.id",
        primary_key=True,
        max_length=21,
        ondelete="CASCADE",
        description="FK to tags.id",
    )

    # Relationships
    todo: Optional["Todo"] = Relationship(back_populates="todo_tags")
    tag: Optional["Tag"] = Relationship(back_populates="todo_tags")
