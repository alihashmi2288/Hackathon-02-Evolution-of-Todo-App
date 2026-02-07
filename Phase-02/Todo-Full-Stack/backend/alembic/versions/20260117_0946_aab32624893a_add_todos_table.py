"""add todos table

Revision ID: aab32624893a
Revises:
Create Date: 2026-01-17 09:46:33.346060+00:00

Task Reference: T005 - Create database migration for todos table
Feature: 003-todo-crud
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'aab32624893a'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create todos table for SPEC-003: Todo CRUD Operations
    op.create_table('todos',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(length=21), nullable=False),
        sa.Column('title', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False),
        sa.Column('user_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    # Create index on user_id for fast user todo lookups
    op.create_index(op.f('ix_todos_user_id'), 'todos', ['user_id'], unique=False)


def downgrade() -> None:
    # Drop index and table
    op.drop_index(op.f('ix_todos_user_id'), table_name='todos')
    op.drop_table('todos')
