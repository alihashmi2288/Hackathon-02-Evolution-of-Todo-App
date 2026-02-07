"""
FastAPI dependencies for dependency injection.

Task Reference: T011, T012, T014 - Update JWT validation
Task Reference: T048 - Add structured logging for auth events
Feature: 002-auth-identity

Provides:
- Database session dependency
- JWT authentication dependency with email claim
- Current user extraction with clock skew tolerance
- Structured logging for auth events
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from sqlmodel import Session

from app.config import settings
from app.database import get_session
from app.models.session import Session as DbSession
from app.models.user import User  # Changed from UserReference



# Structured logger for authentication events (T048)
auth_logger = logging.getLogger("auth")


# Security scheme for JWT Bearer tokens
security = HTTPBearer()

# Clock skew tolerance for token expiration validation (30 seconds)
# Per research.md: allows for minor time differences between frontend and backend
CLOCK_SKEW_TOLERANCE = timedelta(seconds=30)


class TokenPayload(BaseModel):
    """
    JWT token payload structure from Better Auth.

    Task Reference: T011 - Add email claim to TokenPayload
    """

    sub: str  # User ID (UUID as string)
    email: str  # User's email address - per FR-006
    exp: int  # Expiration timestamp
    iat: int  # Issued at timestamp


class CurrentUser(BaseModel):
    """
    Current authenticated user information.

    Task Reference: T012 - Add email field to CurrentUser
    """

    id: str  # Changed to str to match Better Auth IDs
    email: str  # User's email address extracted from JWT


# Type alias for database session dependency
SessionDep = Annotated[Session, Depends(get_session)]


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> CurrentUser:
    """
    Validate JWT token and extract current user.

    This dependency:
    1. Extracts the Bearer token from Authorization header
    2. Verifies the JWT signature using the shared secret
    3. Validates token expiration with clock skew tolerance
    4. Extracts user identity (id and email) from token claims
    5. Returns the authenticated user

    Task Reference: T014 - Add clock skew tolerance (30s)

    Raises:
        HTTPException 401: If token is missing, invalid, or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "error": "AUTHENTICATION_REQUIRED",
            "message": "Could not validate credentials",
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        },
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials

    try:
        # Decode and verify the JWT
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )

        # Extract user ID from subject claim
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception

        # Extract email from claim (per FR-006)
        email: str | None = payload.get("email")
        if email is None:
            raise credentials_exception

        # Validate expiration with clock skew tolerance (T014)
        exp = payload.get("exp")
        if exp:
            expiration_time = datetime.fromtimestamp(exp, tz=timezone.utc)
            current_time = datetime.now(timezone.utc)

            # Allow clock skew tolerance of 30 seconds
            if expiration_time + CLOCK_SKEW_TOLERANCE < current_time:
                # Log token expiration (T048)
                auth_logger.info(
                    "Token expired",
                    extra={
                        "event": "auth_token_expired",
                        "user_id": user_id,
                        "expired_at": expiration_time.isoformat(),
                        "checked_at": current_time.isoformat(),
                    },
                )
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail={
                        "error": "TOKEN_EXPIRED",
                        "message": "Token has expired",
                        "timestamp": current_time.isoformat().replace("+00:00", "Z"),
                    },
                    headers={"WWW-Authenticate": "Bearer"},
                )

        # Log successful authentication (T048)
        auth_logger.info(
            "Authentication successful",
            extra={
                "event": "auth_success",
                "user_id": user_id,
                "email": email,
            },
        )

        return CurrentUser(id=user_id, email=email)

    except JWTError as e:
        # T015: Fallback to Database Session Lookup
        # If JWT validation fails, check if it's an opaque session token
        # This handles the case where Better Auth sends a database session ID instead of a JWT

        from sqlmodel import select
        from app.database import engine

        try:
            with Session(engine) as db_session:
                # Look up the session token in the database
                statement = select(DbSession).where(DbSession.token == token)
                session_record = db_session.exec(statement).first()

                if session_record:
                    # Check expiration - handle both timezone-aware and naive datetimes
                    expires_at = session_record.expires_at
                    if expires_at.tzinfo is None:
                        expires_at = expires_at.replace(tzinfo=timezone.utc)

                    if expires_at > datetime.now(timezone.utc):
                        # Session is valid! Get the user.
                        user_statement = select(User).where(User.id == session_record.user_id)
                        user_record = db_session.exec(user_statement).first()

                        if user_record:
                            auth_logger.info(
                                "Authentication successful (DB Session Fallback)",
                                extra={
                                    "event": "auth_success_db_fallback",
                                    "user_id": user_record.id,
                                    "email": user_record.email,
                                },
                            )
                            # Return the user from DB info
                            return CurrentUser(id=user_record.id, email=user_record.email)
                        else:
                            auth_logger.warning(
                                "Session found but user not found",
                                extra={
                                    "event": "auth_user_not_found",
                                    "user_id": session_record.user_id,
                                },
                            )
                    else:
                        auth_logger.warning(
                            "Session token expired",
                            extra={
                                "event": "auth_session_expired",
                                "expires_at": str(expires_at),
                            },
                        )
                else:
                    auth_logger.debug(
                        "Session token not found in database",
                        extra={
                            "event": "auth_session_not_found",
                            "token_preview": token[:10] + "..." if len(token) > 10 else token,
                        },
                    )
        except Exception as db_error:
            # Log database errors but don't crash - fall through to 401 response
            auth_logger.error(
                "Database error during session lookup",
                extra={
                    "event": "auth_db_error",
                    "error_type": type(db_error).__name__,
                    "error_detail": str(db_error),
                },
            )

        # If fallback also fails, log the original error and raise
        auth_logger.warning(
            "Invalid JWT token and Session Lookup failed",
            extra={
                "event": "auth_invalid_token",
                "error_type": "jwt_error",
                "error_detail": str(e),
                "token_preview": token[:20] + "..." if len(token) > 20 else token
            },
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "INVALID_TOKEN",
                "message": "Invalid authentication token",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
            headers={"WWW-Authenticate": "Bearer"},
        )
    except ValueError as e:
        # Log invalid ID format error (T048)
        auth_logger.warning(
            "Invalid user identifier in token",
            extra={
                "event": "auth_invalid_id",
                "error_detail": str(e),
            },
        )

        # Handle invalid UUID format in sub claim
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "INVALID_TOKEN",
                "message": "Invalid user identifier in token",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            },
            headers={"WWW-Authenticate": "Bearer"},
        )


# Type alias for current user dependency
CurrentUserDep = Annotated[CurrentUser, Depends(get_current_user)]


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        HTTPBearer(auto_error=False)
    ),
) -> CurrentUser | None:
    """
    Optional user authentication.

    Returns the current user if a valid token is provided, None otherwise.
    Use for endpoints that work for both authenticated and anonymous users.
    """
    if credentials is None:
        return None

    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


# Type alias for optional user dependency
OptionalUserDep = Annotated[CurrentUser | None, Depends(get_optional_user)]
