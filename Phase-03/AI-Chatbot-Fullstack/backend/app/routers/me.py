"""
Current user router.

Task Reference: T037 - Create GET /me endpoint returning current user info
Feature: 002-auth-identity

Provides endpoint for retrieving the authenticated user's information
extracted from their JWT token.
"""

from datetime import datetime, timezone

from fastapi import APIRouter

from app.dependencies import CurrentUserDep

router = APIRouter(
    prefix="/me",
    tags=["User"],
)


@router.get("")
async def get_current_user(
    current_user: CurrentUserDep,
) -> dict:
    """
    Get current authenticated user information.

    Returns the user's identity information extracted from the JWT token.
    This is useful for:
    - Verifying the user's authentication status
    - Getting user info without a separate database lookup
    - Displaying user information in the frontend

    Requires: Valid JWT Bearer token in Authorization header.

    Returns:
        200: User information from token claims
        401: Token missing, invalid, or expired

    Example response:
        {
            "id": "uuid-here",
            "email": "user@example.com",
            "authenticated_at": "2024-01-15T12:00:00Z"
        }
    """
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "authenticated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }
