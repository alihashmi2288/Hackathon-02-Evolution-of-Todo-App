"""
Recurrence service for RRULE parsing and occurrence generation.

Task Reference: T024 - Create RecurrenceService with RRULE parsing/generation
Feature: 006-recurring-reminders

Provides functionality for:
- Converting RecurrenceConfig to RFC 5545 RRULE strings
- Parsing RRULE strings back to recurrence data
- Generating occurrences for a given time window
"""

from datetime import date, datetime, timedelta
from typing import List, Optional

from dateutil.rrule import (
    DAILY,
    FR,
    MO,
    MONTHLY,
    SA,
    SU,
    TH,
    TU,
    WE,
    WEEKLY,
    YEARLY,
    rrule,
    rrulestr,
)

from app.schemas.recurrence import RecurrenceConfig


# Mapping from our API frequency to dateutil constants
FREQUENCY_MAP = {
    "daily": DAILY,
    "weekly": WEEKLY,
    "monthly": MONTHLY,
    "yearly": YEARLY,
    "custom": WEEKLY,  # Custom defaults to weekly with specific days
}

# Mapping from day strings to dateutil weekday constants
DAY_MAP = {
    "MO": MO,
    "TU": TU,
    "WE": WE,
    "TH": TH,
    "FR": FR,
    "SA": SA,
    "SU": SU,
}


class RecurrenceService:
    """
    Service for handling recurrence patterns and occurrence generation.

    Task Reference: T024
    """

    @staticmethod
    def config_to_rrule(config: RecurrenceConfig, start_date: date) -> str:
        """
        Convert a RecurrenceConfig to an RFC 5545 RRULE string.

        Args:
            config: The recurrence configuration from the API
            start_date: The start date for the recurrence (typically the todo's due_date)

        Returns:
            RFC 5545 RRULE string (e.g., "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR")

        Task Reference: T037, T081 [US5] - Custom RRULE generation
        """
        # T081 [US5] - For "custom" frequency, derive the base frequency from options
        if config.frequency == "custom":
            # Derive frequency from provided options
            if config.days_of_week:
                freq = "WEEKLY"
            elif config.day_of_month:
                freq = "MONTHLY"
            else:
                freq = "DAILY"  # Default to daily for interval-only custom
        else:
            freq = config.frequency.upper()

        parts = [f"FREQ={freq}"]

        if config.interval and config.interval != 1:
            parts.append(f"INTERVAL={config.interval}")

        if config.days_of_week:
            days = ",".join(config.days_of_week)
            parts.append(f"BYDAY={days}")

        if config.day_of_month:
            parts.append(f"BYMONTHDAY={config.day_of_month}")

        if config.end_date:
            # UNTIL format: YYYYMMDD
            parts.append(f"UNTIL={config.end_date.strftime('%Y%m%d')}")

        if config.end_count:
            parts.append(f"COUNT={config.end_count}")

        return ";".join(parts)

    @staticmethod
    def parse_rrule(rrule_str: str) -> dict:
        """
        Parse an RRULE string into a dictionary of components.

        Args:
            rrule_str: RFC 5545 RRULE string

        Returns:
            Dictionary with frequency, interval, days_of_week, etc.
        """
        parts = {}
        for part in rrule_str.split(";"):
            if "=" in part:
                key, value = part.split("=", 1)
                parts[key] = value
        return parts

    @staticmethod
    def generate_occurrences(
        rrule_str: str,
        start_date: date,
        window_start: Optional[date] = None,
        window_end: Optional[date] = None,
        max_occurrences: int = 30,
    ) -> List[date]:
        """
        Generate occurrence dates for a recurring todo.

        Args:
            rrule_str: RFC 5545 RRULE string
            start_date: The start date of the recurrence
            window_start: Start of the window to generate occurrences (default: start_date)
            window_end: End of the window (default: 30 days from window_start)
            max_occurrences: Maximum number of occurrences to generate

        Returns:
            List of occurrence dates within the window

        Task Reference: T038
        """
        if window_start is None:
            window_start = start_date
        if window_end is None:
            window_end = window_start + timedelta(days=30)

        # Build the full RRULE with DTSTART
        dtstart = datetime.combine(start_date, datetime.min.time())
        full_rrule = f"DTSTART:{dtstart.strftime('%Y%m%dT%H%M%S')}\nRRULE:{rrule_str}"

        try:
            rule = rrulestr(full_rrule)
        except Exception:
            # Fallback: try parsing just the RRULE
            rule = rrulestr(rrule_str, dtstart=dtstart)

        # Generate occurrences within the window
        window_start_dt = datetime.combine(window_start, datetime.min.time())
        window_end_dt = datetime.combine(window_end, datetime.max.time())

        occurrences = []
        for dt in rule:
            if dt.date() > window_end:
                break
            if dt.date() >= window_start:
                occurrences.append(dt.date())
            if len(occurrences) >= max_occurrences:
                break

        return occurrences

    @staticmethod
    def get_next_occurrence(
        rrule_str: str,
        start_date: date,
        after_date: Optional[date] = None,
    ) -> Optional[date]:
        """
        Get the next occurrence date after a given date.

        Args:
            rrule_str: RFC 5545 RRULE string
            start_date: The start date of the recurrence
            after_date: Find the next occurrence after this date (default: today)

        Returns:
            The next occurrence date, or None if no more occurrences
        """
        if after_date is None:
            after_date = date.today()

        occurrences = RecurrenceService.generate_occurrences(
            rrule_str=rrule_str,
            start_date=start_date,
            window_start=after_date,
            window_end=after_date + timedelta(days=365),
            max_occurrences=1,
        )

        return occurrences[0] if occurrences else None

    @staticmethod
    def validate_rrule(rrule_str: str) -> bool:
        """
        Validate that an RRULE string is parseable.

        Args:
            rrule_str: RFC 5545 RRULE string to validate

        Returns:
            True if valid, False otherwise
        """
        try:
            dtstart = datetime.now()
            rrulestr(rrule_str, dtstart=dtstart)
            return True
        except Exception:
            return False


# Singleton instance for easy import
recurrence_service = RecurrenceService()
