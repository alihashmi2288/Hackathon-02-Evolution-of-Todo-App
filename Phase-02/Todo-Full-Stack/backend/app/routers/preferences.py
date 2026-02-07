"""
User preferences router for managing user settings.

Task Reference: T091 - Create preferences router
Task Reference: T092 - GET /me/preferences endpoint
Task Reference: T093 - PATCH /me/preferences endpoint
Task Reference: T094 - GET /me/preferences/timezones endpoint
Feature: 006-recurring-reminders

Provides endpoints for user preferences management:
- GET /me/preferences - Get user preferences (create default if not exists)
- PATCH /me/preferences - Update user preferences
- GET /me/preferences/timezones - List available timezones
"""

from datetime import datetime, timezone
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi import status as http_status
from sqlmodel import Session, select

from app.database import get_session
from app.dependencies import CurrentUserDep
from app.models.user_preferences import UserPreferences
from app.schemas.error import ErrorResponse
from app.schemas.user_preferences import UserPreferencesResponse, UserPreferencesUpdate

router = APIRouter(
    prefix="/me/preferences",
    tags=["Preferences"],
    responses={
        401: {
            "model": ErrorResponse,
            "description": "Authentication required",
        },
    },
)

# Type alias for session dependency
SessionDep = Annotated[Session, Depends(get_session)]

# Common timezones for the dropdown
# Full list available via pytz.all_timezones but this provides a curated UX
COMMON_TIMEZONES = [
    # Americas
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Toronto",
    "America/Vancouver",
    "America/Mexico_City",
    "America/Sao_Paulo",
    "America/Buenos_Aires",
    # Europe
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Rome",
    "Europe/Madrid",
    "Europe/Amsterdam",
    "Europe/Stockholm",
    "Europe/Moscow",
    # Asia
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Hong_Kong",
    "Asia/Singapore",
    "Asia/Seoul",
    "Asia/Karachi",
    "Asia/Mumbai",
    "Asia/Dubai",
    "Asia/Bangkok",
    "Asia/Jakarta",
    # Pacific
    "Pacific/Auckland",
    "Pacific/Sydney",
    "Pacific/Honolulu",
    # Africa
    "Africa/Cairo",
    "Africa/Johannesburg",
    "Africa/Lagos",
    # UTC
    "UTC",
]


def _preferences_to_response(prefs: UserPreferences) -> UserPreferencesResponse:
    """Convert UserPreferences model to UserPreferencesResponse."""
    return UserPreferencesResponse(
        id=prefs.id,
        user_id=prefs.user_id,
        timezone=prefs.timezone,
        default_reminder_offset=prefs.default_reminder_offset,
        push_enabled=prefs.push_enabled,
        daily_digest_enabled=prefs.daily_digest_enabled,
        daily_digest_time=prefs.daily_digest_time,
        created_at=prefs.created_at,
        updated_at=prefs.updated_at,
    )


def _get_or_create_preferences(session: Session, user_id: str) -> UserPreferences:
    """
    Get user preferences or create default if not exists.

    Task Reference: T092 [US7]
    """
    statement = select(UserPreferences).where(UserPreferences.user_id == user_id)
    prefs = session.exec(statement).first()

    if prefs is None:
        # Create default preferences
        prefs = UserPreferences(user_id=user_id)
        session.add(prefs)
        session.commit()
        session.refresh(prefs)

    return prefs


@router.get(
    "",
    response_model=UserPreferencesResponse,
    responses={
        200: {"description": "User preferences"},
    },
)
async def get_preferences(
    current_user: CurrentUserDep,
    session: SessionDep,
) -> UserPreferencesResponse:
    """
    Get user preferences.

    Task Reference: T092 [US7] (006-recurring-reminders)

    Creates default preferences if they don't exist.

    Returns:
        200: User preferences
        401: Authentication required
    """
    prefs = _get_or_create_preferences(session, current_user.id)
    return _preferences_to_response(prefs)


@router.patch(
    "",
    response_model=UserPreferencesResponse,
    responses={
        200: {"description": "Preferences updated"},
        400: {"model": ErrorResponse, "description": "Validation error"},
    },
)
async def update_preferences(
    data: UserPreferencesUpdate,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> UserPreferencesResponse:
    """
    Update user preferences.

    Task Reference: T093 [US7] (006-recurring-reminders)

    Only provided fields are updated.

    Returns:
        200: Updated preferences
        400: Validation error
        401: Authentication required
    """
    prefs = _get_or_create_preferences(session, current_user.id)

    # Update only provided fields
    update_data = data.model_dump(exclude_unset=True)

    # Validate timezone if provided
    if "timezone" in update_data and update_data["timezone"]:
        tz = update_data["timezone"]
        # Basic validation - could use pytz for full validation
        try:
            import zoneinfo
            zoneinfo.ZoneInfo(tz)
        except Exception:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "VALIDATION_ERROR",
                    "message": f"Invalid timezone: {tz}",
                    "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                },
            )

    for field, value in update_data.items():
        setattr(prefs, field, value)

    prefs.updated_at = datetime.now(timezone.utc)
    session.add(prefs)
    session.commit()
    session.refresh(prefs)

    return _preferences_to_response(prefs)


@router.get(
    "/timezones",
    response_model=List[str],
    responses={
        200: {"description": "List of available timezones"},
    },
)
async def get_timezones() -> List[str]:
    """
    Get list of available timezones.

    Task Reference: T094 [US7] (006-recurring-reminders)

    Returns a curated list of common IANA timezones for the UI dropdown.
    For a complete list, clients can use a timezone library.

    Returns:
        200: List of timezone strings
    """
    return COMMON_TIMEZONES
