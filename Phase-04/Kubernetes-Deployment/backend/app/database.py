"""
Database configuration and session management.

Task Reference: T028 - Create backend/app/database.py with SQLModel engine
Feature: 001-project-init-architecture

Provides:
- SQLModel engine configured for Neon PostgreSQL
- Session factory for dependency injection
- Database connectivity check for health endpoints
"""

from collections.abc import Generator
from contextlib import contextmanager

from sqlmodel import Session, SQLModel, create_engine

from app.config import settings


# Create the database engine
# Neon requires SSL mode for connections
engine = create_engine(
    str(settings.database_url),
    echo=settings.debug,  # Log SQL queries in debug mode
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_pre_ping=True,  # Verify connection health before use
    connect_args={
        "sslmode": "require",  # Required for Neon
    },
)


def create_db_and_tables() -> None:
    """
    Create all database tables defined in SQLModel models.

    Should be called on application startup in development.
    In production, use Alembic migrations instead.
    """
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency that provides a database session.

    Usage:
        @router.get("/items")
        def get_items(session: Session = Depends(get_session)):
            return session.exec(select(Item)).all()
    """
    with Session(engine) as session:
        yield session


@contextmanager
def get_session_context() -> Generator[Session, None, None]:
    """
    Context manager for database sessions.

    Usage:
        with get_session_context() as session:
            session.add(item)
            session.commit()
    """
    with Session(engine) as session:
        yield session


async def check_database_connection() -> bool:
    """
    Check if the database is reachable.

    Used by health check endpoints.

    Returns:
        True if database is connected, False otherwise.
    """
    try:
        with Session(engine) as session:
            session.exec("SELECT 1")  # type: ignore
            return True
    except Exception:
        return False
