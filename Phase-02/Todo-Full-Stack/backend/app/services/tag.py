"""
Tag service layer for business logic.

Task Reference: T013 - Create TagService with CRUD operations
Feature: 005-todo-enhancements

Provides business logic for Tag CRUD operations with:
- User ownership validation (filter by user_id)
- Case-insensitive duplicate detection
- Timestamp management
- Todo count calculation
- Suggestion/autocomplete support
"""

from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import func
from sqlmodel import Session, select

from app.models.tag import Tag
from app.models.todo_tag import TodoTag
from app.schemas.tag import TagCreate, TagUpdate


class TagService:
    """
    Service layer for Tag operations.

    All methods require user_id for owner validation.
    Returns None for not found or unauthorized access (returns 404 to client).
    """

    @staticmethod
    def create_tag(session: Session, user_id: str, data: TagCreate) -> Tag:
        """
        Create a new tag for the specified user.

        Args:
            session: Database session
            user_id: Owner's user ID from JWT
            data: Tag creation data

        Returns:
            Created Tag instance

        Raises:
            ValueError: If tag name already exists for user (case-insensitive)
        """
        # Check for duplicate name (case-insensitive)
        existing = TagService.get_tag_by_name(session, user_id, data.name)
        if existing:
            raise ValueError(f"Tag '{data.name}' already exists")

        tag = Tag(
            name=data.name,
            color=data.color,
            user_id=user_id,
        )
        session.add(tag)
        session.commit()
        session.refresh(tag)
        return tag

    @staticmethod
    def get_tags(session: Session, user_id: str) -> List[Tag]:
        """
        Get all tags for the specified user.

        Args:
            session: Database session
            user_id: Owner's user ID from JWT

        Returns:
            List of tags owned by the user, ordered by name
        """
        statement = (
            select(Tag)
            .where(Tag.user_id == user_id)
            .order_by(Tag.name)
        )
        return list(session.exec(statement).all())

    @staticmethod
    def get_tag_by_id(
        session: Session, user_id: str, tag_id: str
    ) -> Optional[Tag]:
        """
        Get a specific tag by ID for the specified user.

        Always filters by BOTH id AND user_id to ensure owner-only access.
        Returns None if not found or not owned (client receives 404).

        Args:
            session: Database session
            user_id: Owner's user ID from JWT
            tag_id: Tag ID to retrieve

        Returns:
            Tag if found and owned, None otherwise
        """
        statement = select(Tag).where(
            Tag.id == tag_id,
            Tag.user_id == user_id,
        )
        return session.exec(statement).first()

    @staticmethod
    def get_tag_by_name(
        session: Session, user_id: str, name: str
    ) -> Optional[Tag]:
        """
        Get a tag by name for the specified user (case-insensitive).

        Args:
            session: Database session
            user_id: Owner's user ID from JWT
            name: Tag name to search

        Returns:
            Tag if found, None otherwise
        """
        statement = select(Tag).where(
            Tag.user_id == user_id,
            func.lower(Tag.name) == name.lower(),
        )
        return session.exec(statement).first()

    @staticmethod
    def update_tag(
        session: Session, user_id: str, tag_id: str, data: TagUpdate
    ) -> Optional[Tag]:
        """
        Update a tag for the specified user.

        Only updates fields that are provided (non-None).
        Automatically updates updated_at timestamp.

        Args:
            session: Database session
            user_id: Owner's user ID from JWT
            tag_id: Tag ID to update
            data: Update data (partial)

        Returns:
            Updated Tag if found and owned, None otherwise

        Raises:
            ValueError: If new name already exists for user (case-insensitive)
        """
        tag = TagService.get_tag_by_id(session, user_id, tag_id)
        if tag is None:
            return None

        # Check for duplicate name if name is being updated
        if data.name is not None and data.name.lower() != tag.name.lower():
            existing = TagService.get_tag_by_name(session, user_id, data.name)
            if existing:
                raise ValueError(f"Tag '{data.name}' already exists")

        # Update only provided fields
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tag, field, value)

        # Always update the timestamp
        tag.updated_at = datetime.now(timezone.utc)

        session.add(tag)
        session.commit()
        session.refresh(tag)
        return tag

    @staticmethod
    def delete_tag(session: Session, user_id: str, tag_id: str) -> bool:
        """
        Delete a tag for the specified user.

        Cascade delete removes associated todo_tags automatically.

        Args:
            session: Database session
            user_id: Owner's user ID from JWT
            tag_id: Tag ID to delete

        Returns:
            True if deleted, False if not found or not owned
        """
        tag = TagService.get_tag_by_id(session, user_id, tag_id)
        if tag is None:
            return False

        session.delete(tag)
        session.commit()
        return True

    @staticmethod
    def suggest_tags(
        session: Session, user_id: str, prefix: str, limit: int = 10
    ) -> List[Tag]:
        """
        Get tag suggestions for autocomplete.

        Returns tags matching the prefix (case-insensitive).

        Args:
            session: Database session
            user_id: Owner's user ID from JWT
            prefix: Search prefix
            limit: Maximum number of suggestions

        Returns:
            List of matching tags, ordered by name
        """
        statement = (
            select(Tag)
            .where(
                Tag.user_id == user_id,
                func.lower(Tag.name).startswith(prefix.lower()),
            )
            .order_by(Tag.name)
            .limit(limit)
        )
        return list(session.exec(statement).all())

    @staticmethod
    def get_tag_todo_count(session: Session, tag_id: str) -> int:
        """
        Get the number of todos using a specific tag.

        Args:
            session: Database session
            tag_id: Tag ID to count

        Returns:
            Number of todos with this tag
        """
        statement = (
            select(func.count())
            .select_from(TodoTag)
            .where(TodoTag.tag_id == tag_id)
        )
        result = session.exec(statement).first()
        return result or 0

    @staticmethod
    def get_tags_with_counts(session: Session, user_id: str) -> List[tuple[Tag, int]]:
        """
        Get all tags with their todo counts.

        Args:
            session: Database session
            user_id: Owner's user ID from JWT

        Returns:
            List of (tag, todo_count) tuples
        """
        tags = TagService.get_tags(session, user_id)
        return [
            (tag, TagService.get_tag_todo_count(session, tag.id))
            for tag in tags
        ]
