"""
APScheduler integration for background jobs.

Task Reference: T028 - Setup APScheduler integration
Task Reference: T135 - Implement 30-day notification auto-cleanup
Task Reference: T136 - Background job for daily occurrence generation refresh
Feature: 006-recurring-reminders

Provides:
- Scheduler initialization and shutdown
- Recurring reminder processing job
- Daily digest job
- Occurrence generation job
- Notification cleanup job
"""

import logging
from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from sqlmodel import select

from app.database import get_session
from app.models.enums import OccurrenceStatus
from app.models.notification import Notification
from app.models.occurrence import TodoOccurrence
from app.models.todo import Todo
from app.services.recurrence import recurrence_service
from app.services.reminder import reminder_service

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler: AsyncIOScheduler | None = None


async def process_reminders_job():
    """
    Background job to process pending reminders.

    Runs every minute to check for and fire due reminders.

    Task Reference: T053
    """
    logger.debug("Processing pending reminders...")

    try:
        # Get a database session
        async for session in get_session():
            processed = await reminder_service.process_pending_reminders(session)
            if processed > 0:
                logger.info(f"Processed {processed} reminders")
            break
    except Exception as e:
        logger.error(f"Error processing reminders: {e}")


async def generate_occurrences_job():
    """
    Background job to generate upcoming occurrences for recurring todos.

    Runs daily to ensure 30-day window of occurrences exists.

    Task Reference: T038 (extended), T136 [Polish]
    """
    logger.info("Running occurrence generation job...")

    try:
        async for session in get_session():
            # Get all recurring todos
            recurring_todos = session.exec(
                select(Todo).where(
                    Todo.is_recurring == True,  # noqa: E712
                    Todo.rrule.isnot(None),
                )
            ).all()

            total_created = 0
            today = date.today()
            window_days = 30

            for todo in recurring_todos:
                if not todo.rrule or not todo.due_date:
                    continue

                # Get existing occurrence dates for this todo
                existing = session.exec(
                    select(TodoOccurrence.occurrence_date).where(
                        TodoOccurrence.parent_todo_id == todo.id
                    )
                ).all()
                existing_dates = set(existing)

                # Generate occurrence dates for the next 30 days
                occurrence_dates = recurrence_service.generate_occurrences(
                    rrule_str=todo.rrule,
                    start_date=todo.due_date,
                    window_start=today,
                    max_occurrences=window_days,
                )

                # Create occurrences for dates that don't exist yet
                for occ_date in occurrence_dates:
                    if occ_date not in existing_dates:
                        occurrence = TodoOccurrence(
                            parent_todo_id=todo.id,
                            user_id=todo.user_id,
                            occurrence_date=occ_date,
                            status=OccurrenceStatus.PENDING,
                        )
                        session.add(occurrence)
                        total_created += 1

            if total_created > 0:
                session.commit()
                logger.info(f"Generated {total_created} new occurrences")

            break
    except Exception as e:
        logger.error(f"Error generating occurrences: {e}")

    logger.info("Occurrence generation complete")


async def daily_digest_job():
    """
    Background job to send daily digest notifications.

    Runs every hour to check for users whose digest time has arrived.

    Task Reference: T118, T119 [US11] (006-recurring-reminders)
    """
    logger.info("Running daily digest job...")

    try:
        async for session in get_session():
            from app.services.daily_digest import daily_digest_service
            sent_count = await daily_digest_service.process_daily_digests(session)
            if sent_count > 0:
                logger.info(f"Sent {sent_count} daily digests")
            break
    except Exception as e:
        logger.error(f"Error processing daily digests: {e}")

    logger.info("Daily digest complete")


async def cleanup_notifications_job():
    """
    Background job to clean up old notifications.

    Runs daily to delete notifications older than 30 days.

    Task Reference: T135 [Polish]
    """
    logger.info("Running notification cleanup job...")

    try:
        async for session in get_session():
            # Calculate cutoff date (30 days ago)
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=30)

            # Find and delete old notifications
            old_notifications = session.exec(
                select(Notification).where(
                    Notification.created_at < cutoff_date
                )
            ).all()

            deleted_count = len(old_notifications)
            for notification in old_notifications:
                session.delete(notification)

            if deleted_count > 0:
                session.commit()
                logger.info(f"Deleted {deleted_count} old notifications")

            break
    except Exception as e:
        logger.error(f"Error cleaning up notifications: {e}")

    logger.info("Notification cleanup complete")


def init_scheduler() -> AsyncIOScheduler:
    """
    Initialize the APScheduler with configured jobs.

    Returns:
        Configured scheduler instance

    Task Reference: T028
    """
    global scheduler

    if scheduler is not None:
        return scheduler

    scheduler = AsyncIOScheduler(
        timezone="UTC",
        job_defaults={
            "coalesce": True,  # Combine missed runs into one
            "max_instances": 1,  # Only one instance at a time
            "misfire_grace_time": 60,  # Allow 60s grace for missed jobs
        },
    )

    # Add reminder processing job - runs every minute
    scheduler.add_job(
        process_reminders_job,
        trigger=IntervalTrigger(minutes=1),
        id="process_reminders",
        name="Process pending reminders",
        replace_existing=True,
    )

    # Add occurrence generation job - runs daily at 1 AM UTC
    scheduler.add_job(
        generate_occurrences_job,
        trigger=CronTrigger(hour=1, minute=0),
        id="generate_occurrences",
        name="Generate recurring todo occurrences",
        replace_existing=True,
    )

    # Add daily digest check - runs every hour to check for users
    # whose digest time has arrived
    scheduler.add_job(
        daily_digest_job,
        trigger=CronTrigger(minute=0),  # Every hour on the hour
        id="daily_digest",
        name="Send daily digest notifications",
        replace_existing=True,
    )

    # Add notification cleanup job - runs daily at 2 AM UTC
    # T135 [Polish]
    scheduler.add_job(
        cleanup_notifications_job,
        trigger=CronTrigger(hour=2, minute=0),
        id="cleanup_notifications",
        name="Clean up old notifications",
        replace_existing=True,
    )

    logger.info("Scheduler initialized with jobs")
    return scheduler


def start_scheduler():
    """Start the scheduler if not already running."""
    global scheduler

    if scheduler is None:
        scheduler = init_scheduler()

    if not scheduler.running:
        scheduler.start()
        logger.info("Scheduler started")


def shutdown_scheduler():
    """Shutdown the scheduler gracefully."""
    global scheduler

    if scheduler is not None and scheduler.running:
        scheduler.shutdown(wait=True)
        logger.info("Scheduler shut down")


@asynccontextmanager
async def lifespan_scheduler():
    """
    Context manager for scheduler lifecycle.

    Use with FastAPI's lifespan:

    ```python
    from app.scheduler import lifespan_scheduler

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        async with lifespan_scheduler():
            yield
    ```
    """
    start_scheduler()
    try:
        yield
    finally:
        shutdown_scheduler()
