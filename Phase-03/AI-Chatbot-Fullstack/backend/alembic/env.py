"""
Alembic migration environment configuration.

Task Reference: T046 - Create backend/alembic/env.py
Feature: 001-project-init-architecture

Configures Alembic to:
- Use SQLModel metadata for autogeneration
- Read DATABASE_URL from environment
- Support both online and offline migrations
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlmodel import SQLModel, create_engine

# Import all models here so they're registered with SQLModel.metadata
from app.models.base import BaseModel, UserOwnedModel  # noqa: F401
from app.models.priority import Priority  # noqa: F401
from app.models.todo import Todo  # noqa: F401
from app.models.tag import Tag  # noqa: F401
from app.models.todo_tag import TodoTag  # noqa: F401

# This is the Alembic Config object
config = context.config

# Configure logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# SQLModel metadata for autogenerate support
target_metadata = SQLModel.metadata


def get_database_url() -> str:
    """
    Get database URL from environment.

    Reads from app.config to ensure consistent configuration.
    """
    from app.config import settings
    return str(settings.database_url)


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    Generates SQL script without connecting to database.
    Useful for generating migration scripts to run manually.
    """
    url = get_database_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.

    Connects to database and executes migrations directly.
    Standard mode for development and deployment.
    """
    url = get_database_url()

    # Create engine with connection pooling disabled for migrations
    # Neon requires SSL mode
    connectable = create_engine(
        url,
        poolclass=pool.NullPool,
        connect_args={"sslmode": "require"},
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# Determine migration mode based on context
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
