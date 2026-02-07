"""Add todo enhancements: due_date, priority, tags

Revision ID: 20260118_todo_enhancements
Revises: aab32624893a
Create Date: 2026-01-18

Task Reference: T006 - Generate Alembic migration for schema changes
Feature: 005-todo-enhancements

Changes:
- Add due_date (DATE, nullable) to todos table
- Add priority (ENUM, nullable) to todos table
- Create priority_enum type (high, medium, low)
- Create tags table
- Create todo_tags junction table
- Add indexes for filtering performance
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '20260118_todo_enhancements'
down_revision: Union[str, None] = 'aab32624893a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create priority enum type
    priority_enum = postgresql.ENUM('high', 'medium', 'low', name='priority_enum')
    priority_enum.create(op.get_bind(), checkfirst=True)

    # Add columns to todos table
    op.add_column('todos', sa.Column('due_date', sa.Date(), nullable=True))
    op.add_column('todos', sa.Column(
        'priority',
        postgresql.ENUM('high', 'medium', 'low', name='priority_enum', create_type=False),
        nullable=True
    ))

    # Create indexes on todos for filtering
    op.create_index('idx_todos_due_date', 'todos', ['due_date'])
    op.create_index('idx_todos_priority', 'todos', ['priority'])
    op.create_index('idx_todos_user_completed', 'todos', ['user_id', 'completed'])

    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(length=21), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('color', sqlmodel.sql.sqltypes.AutoString(length=7), nullable=False, server_default='#3B82F6'),
        sa.Column('user_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_tags_user_id', 'tags', ['user_id'])
    # Case-insensitive unique constraint on (user_id, name)
    op.execute("CREATE UNIQUE INDEX uq_tags_user_name ON tags (user_id, lower(name))")

    # Create todo_tags junction table
    op.create_table(
        'todo_tags',
        sa.Column('todo_id', sqlmodel.sql.sqltypes.AutoString(length=21), nullable=False),
        sa.Column('tag_id', sqlmodel.sql.sqltypes.AutoString(length=21), nullable=False),
        sa.ForeignKeyConstraint(['todo_id'], ['todos.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('todo_id', 'tag_id')
    )
    op.create_index('idx_todo_tags_tag_id', 'todo_tags', ['tag_id'])


def downgrade() -> None:
    # Drop todo_tags table
    op.drop_index('idx_todo_tags_tag_id', table_name='todo_tags')
    op.drop_table('todo_tags')

    # Drop tags table
    op.execute("DROP INDEX IF EXISTS uq_tags_user_name")
    op.drop_index('idx_tags_user_id', table_name='tags')
    op.drop_table('tags')

    # Remove columns from todos
    op.drop_index('idx_todos_user_completed', table_name='todos')
    op.drop_index('idx_todos_priority', table_name='todos')
    op.drop_index('idx_todos_due_date', table_name='todos')
    op.drop_column('todos', 'priority')
    op.drop_column('todos', 'due_date')

    # Drop priority enum
    priority_enum = postgresql.ENUM('high', 'medium', 'low', name='priority_enum')
    priority_enum.drop(op.get_bind(), checkfirst=True)
