"""
Auth health check router.

Task Reference: T035 - Create /health/auth endpoint to verify JWT config
Feature: 002-auth-identity

Provides an authenticated health check endpoint to verify:
- JWT token validation is working
- Token contains expected claims (sub, email)
- Backend can successfully decode tokens from Better Auth
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.dependencies import CurrentUserDep

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get("/auth")
async def auth_health(
    current_user: CurrentUserDep,
) -> dict:
    """
    Authenticated health check endpoint.

    This endpoint verifies that:
    1. JWT token validation is working correctly
    2. The token contains valid user claims (sub, email)
    3. Backend can successfully decode tokens issued by Better Auth

    Requires: Valid JWT Bearer token in Authorization header.

    Returns:
        200: Authentication is working, includes user info from token
        401: Token missing, invalid, or expired

    Example response:
        {
            "status": "authenticated",
            "user_id": "uuid-here",
            "email": "user@example.com",
            "timestamp": "2024-01-15T12:00:00Z"
        }
    """
    return {
        "status": "authenticated",
        "user_id": str(current_user.id),
        "email": current_user.email,
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }
