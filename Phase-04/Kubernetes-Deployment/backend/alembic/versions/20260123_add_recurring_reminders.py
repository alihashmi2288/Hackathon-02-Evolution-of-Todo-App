"""Add recurring tasks and reminders support

Revision ID: 20260123_recurring_reminders
Revises: 20260118_todo_enhancements
Create Date: 2026-01-23

Task Reference: T017-T022 - Database migrations for 006-recurring-reminders
Feature: 006-recurring-reminders

Changes:
- Add recurrence fields to todos table (is_recurring, rrule, etc.)
- Create todo_occurrences table for materialized occurrences
- Create reminders table for time-based reminders
- Create notifications table for in-app notifications
- Create push_subscriptions table for Web Push
- Create user_preferences table for user settings
- Add status enums for occurrences, reminders, notifications
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '20260123_recurring_reminders'
down_revision: Union[str, None] = '20260118_todo_enhancements'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # =====================
    # Create ENUM types
    # =====================

    # OccurrenceStatus enum
    occurrence_status_enum = postgresql.ENUM(
        'pending', 'completed', 'skipped',
        name='occurrence_status_enum'
    )
    occurrence_status_enum.create(op.get_bind(), checkfirst=True)

    # ReminderStatus enum
    reminder_status_enum = postgresql.ENUM(
        'pending', 'sent', 'snoozed', 'cancelled',
        name='reminder_status_enum'
    )
    reminder_status_enum.create(op.get_bind(), checkfirst=True)

    # NotificationType enum
    notification_type_enum = postgresql.ENUM(
        'reminder', 'daily_digest', 'recurring_due',
        name='notification_type_enum'
    )
    notification_type_enum.create(op.get_bind(), checkfirst=True)

    # =====================
    # T017: Add recurrence fields to todos table
    # =====================
    op.add_column('todos', sa.Column('is_recurring', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('todos', sa.Column('rrule', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=True))
    op.add_column('todos', sa.Column('recurrence_end_date', sa.Date(), nullable=True))
    op.add_column('todos', sa.Column('recurrence_count', sa.Integer(), nullable=True))
    op.add_column('todos', sa.Column('occurrences_generated', sa.Integer(), nullable=False, server_default='0'))

    # Index for recurring todos lookup
    op.create_index('idx_todos_recurring', 'todos', ['user_id', 'is_recurring'])

    # =====================
    # T018: Create todo_occurrences table
    # =====================
    op.create_table(
        'todo_occurrences',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(length=21), nullable=False),
        sa.Column('parent_todo_id', sqlmodel.sql.sqltypes.AutoString(length=21), nullable=False),
        sa.Column('user_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('occurrence_date', sa.Date(), nullable=False),
        sa.Column(
            'status',
            postgresql.ENUM('pending', 'completed', 'skipped', name='occurrence_status_enum', create_type=False),
            nullable=False,
            server_default='pending'
        ),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['parent_todo_id'], ['todos.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('parent_todo_id', 'occurrence_date', name='uq_occurrence_date')
    )
    op.create_index('idx_occurrences_parent', 'todo_occurrences', ['parent_todo_id', 'occurrence_date'])
    op.create_index('idx_occurrences_user_date', 'todo_occurrences', ['user_id', 'occurrence_date', 'status'])

    # =====================
    # T019: Create reminders table
    # =====================
    op.create_table(
        'reminders',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(length=21), nullable=False),
        sa.Column('todo_id', sqlmodel.sql.sqltypes.AutoString(length=21), nullable=False),
        sa.Column('occurrence_id', sqlmodel.sql.sqltypes.AutoString(length=21), nullable=True),
        sa.Column('user_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('fire_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('offset_minutes', sa.Integer(), nullable=True),
        sa.Column(
            'status',
            postgresql.ENUM('pending', 'sent', 'snoozed', 'cancelled', name='reminder_status_enum', create_type=False),
            nullable=False,
            server_default='pending'
        ),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('snoozed_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['todo_id'], ['todos.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['occurrence_id'], ['todo_occurrences.id'], ondelete='CASCADE')
    )
    op.create_index('idx_reminders_fire', 'reminders', ['status', 'fire_at'])
    op.create_index('idx_reminders_todo', 'reminders', ['todo_id'])
    op.create_index('idx_reminders_user', 'reminders', ['user_id', 'status'])

    # =====================
    # T020: Create notifications table
    # =====================
    op.create_table(
        'notifications',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(length=21), nullable=False),
        sa.Column('user_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column(
            'type',
            postgresql.ENUM('reminder', 'daily_digest', 'recurring_due', name='notification_type_enum', create_type=False),
            nullable=False
        ),
        sa.Column('title', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('body', sa.Text(), nullable=True),
        sa.Column('todo_id', sqlmodel.sql.sqltypes.AutoString(length=21), nullable=True),
        sa.Column('reminder_id', sqlmodel.sql.sqltypes.AutoString(length=21), nullable=True),
        sa.Column('read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['todo_id'], ['todos.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['reminder_id'], ['reminders.id'], ondelete='SET NULL')
    )
    op.create_index('idx_notifications_user_read', 'notifications', ['user_id', 'read'])
    op.create_index('idx_notifications_user_created', 'notifications', ['user_id', 'created_at'])

    # =====================
    # T021: Create push_subscriptions table
    # =====================
    op.create_table(
        'push_subscriptions',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(length=21), nullable=False),
        sa.Column('user_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('endpoint', sa.Text(), nullable=False),
        sa.Column('p256dh_key', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('auth_key', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('user_agent', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('endpoint', name='uq_push_endpoint')
    )
    op.create_index('idx_push_subscriptions_user', 'push_subscriptions', ['user_id'])

    # =====================
    # T022: Create user_preferences table
    # =====================
    op.create_table(
        'user_preferences',
        sa.Column('id', sqlmodel.sql.sqltypes.AutoString(length=21), nullable=False),
        sa.Column('user_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('timezone', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False, server_default='UTC'),
        sa.Column('default_reminder_offset', sa.Integer(), nullable=True),
        sa.Column('push_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('daily_digest_enabled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('daily_digest_time', sa.Time(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', name='uq_user_preferences_user')
    )
    op.create_index('idx_user_preferences_user', 'user_preferences', ['user_id'])


def downgrade() -> None:
    # =====================
    # Drop tables in reverse order
    # =====================

    # T022: Drop user_preferences
    op.drop_index('idx_user_preferences_user', table_name='user_preferences')
    op.drop_table('user_preferences')

    # T021: Drop push_subscriptions
    op.drop_index('idx_push_subscriptions_user', table_name='push_subscriptions')
    op.drop_table('push_subscriptions')

    # T020: Drop notifications
    op.drop_index('idx_notifications_user_created', table_name='notifications')
    op.drop_index('idx_notifications_user_read', table_name='notifications')
    op.drop_table('notifications')

    # T019: Drop reminders
    op.drop_index('idx_reminders_user', table_name='reminders')
    op.drop_index('idx_reminders_todo', table_name='reminders')
    op.drop_index('idx_reminders_fire', table_name='reminders')
    op.drop_table('reminders')

    # T018: Drop todo_occurrences
    op.drop_index('idx_occurrences_user_date', table_name='todo_occurrences')
    op.drop_index('idx_occurrences_parent', table_name='todo_occurrences')
    op.drop_table('todo_occurrences')

    # T017: Remove recurrence columns from todos
    op.drop_index('idx_todos_recurring', table_name='todos')
    op.drop_column('todos', 'occurrences_generated')
    op.drop_column('todos', 'recurrence_count')
    op.drop_column('todos', 'recurrence_end_date')
    op.drop_column('todos', 'rrule')
    op.drop_column('todos', 'is_recurring')

    # Drop ENUM types
    notification_type_enum = postgresql.ENUM(
        'reminder', 'daily_digest', 'recurring_due',
        name='notification_type_enum'
    )
    notification_type_enum.drop(op.get_bind(), checkfirst=True)

    reminder_status_enum = postgresql.ENUM(
        'pending', 'sent', 'snoozed', 'cancelled',
        name='reminder_status_enum'
    )
    reminder_status_enum.drop(op.get_bind(), checkfirst=True)

    occurrence_status_enum = postgresql.ENUM(
        'pending', 'completed', 'skipped',
        name='occurrence_status_enum'
    )
    occurrence_status_enum.drop(op.get_bind(), checkfirst=True)
