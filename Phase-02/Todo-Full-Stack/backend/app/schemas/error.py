"""
Error response schemas per contracts/error-taxonomy.yaml.

Task Reference: T032 - Create backend/app/schemas/error.py
Feature: 001-project-init-architecture

Provides standardized error responses across all API endpoints.
"""

from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """
    Base error response used by all endpoints.

    Follows the error taxonomy contract for consistent error handling.
    """

    error: str = Field(
        ...,
        description="Machine-readable error code",
        examples=["VALIDATION_ERROR"],
    )
    message: str = Field(
        ...,
        description="Human-readable error description",
        examples=["Invalid input data provided"],
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        description="ISO 8601 timestamp when error occurred",
    )
    request_id: Optional[str] = Field(
        default=None,
        description="Unique identifier for request tracing",
    )
    details: Optional[dict[str, Any]] = Field(
        default=None,
        description="Additional error context",
    )


class FieldError(BaseModel):
    """Individual field validation error."""

    field: str = Field(..., description="Field name that failed validation")
    message: str = Field(..., description="Validation error message")
    code: str = Field(..., description="Validation error code")


class ValidationErrorResponse(ErrorResponse):
    """
    Validation error with field-level details.

    Used for 400 Bad Request and 422 Unprocessable Entity responses.
    """

    error: str = "VALIDATION_ERROR"
    details: Optional[dict[str, Any]] = Field(
        default=None,
        description="Contains 'fields' array with validation errors",
    )

    @classmethod
    def from_fields(
        cls, message: str, fields: list[FieldError], request_id: Optional[str] = None
    ) -> "ValidationErrorResponse":
        """Create a validation error response from field errors."""
        return cls(
            message=message,
            request_id=request_id,
            details={"fields": [f.model_dump() for f in fields]},
        )


class AuthenticationErrorResponse(ErrorResponse):
    """
    Authentication error response.

    Used for 401 Unauthorized responses.
    """

    error: str = Field(
        ...,
        description="Authentication error type",
        examples=["AUTHENTICATION_REQUIRED", "INVALID_TOKEN", "TOKEN_EXPIRED"],
    )


class AuthorizationErrorResponse(ErrorResponse):
    """
    Authorization error response.

    Used for 403 Forbidden responses.
    """

    error: str = Field(
        ...,
        description="Authorization error type",
        examples=["PERMISSION_DENIED", "RESOURCE_ACCESS_DENIED"],
    )


class NotFoundErrorResponse(ErrorResponse):
    """
    Resource not found error response.

    Used for 404 Not Found responses.
    """

    error: str = "RESOURCE_NOT_FOUND"
    details: Optional[dict[str, Any]] = Field(
        default=None,
        description="Contains 'resource_type' and 'resource_id'",
    )

    @classmethod
    def for_resource(
        cls,
        resource_type: str,
        resource_id: str,
        message: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> "NotFoundErrorResponse":
        """Create a not found error for a specific resource."""
        return cls(
            message=message or f"{resource_type} not found",
            request_id=request_id,
            details={"resource_type": resource_type, "resource_id": resource_id},
        )


class ConfigurationErrorResponse(ErrorResponse):
    """
    Configuration error response.

    Used when required configuration is missing or invalid.
    """

    error: str = Field(
        ...,
        description="Configuration error type",
        examples=["MISSING_CONFIGURATION", "INVALID_CONFIGURATION"],
    )
    details: Optional[dict[str, Any]] = Field(
        default=None,
        description="Contains 'variable' name",
    )


class InternalErrorResponse(ErrorResponse):
    """
    Internal server error response.

    Used for 500 Internal Server Error responses.
    """

    error: str = "INTERNAL_ERROR"


# Error code constants for consistency
class ErrorCodes:
    """Machine-readable error codes."""

    # Validation
    VALIDATION_ERROR = "VALIDATION_ERROR"

    # Authentication
    AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED"
    INVALID_TOKEN = "INVALID_TOKEN"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"

    # Authorization
    PERMISSION_DENIED = "PERMISSION_DENIED"
    RESOURCE_ACCESS_DENIED = "RESOURCE_ACCESS_DENIED"

    # Resources
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"

    # Configuration
    MISSING_CONFIGURATION = "MISSING_CONFIGURATION"
    INVALID_CONFIGURATION = "INVALID_CONFIGURATION"

    # Server
    INTERNAL_ERROR = "INTERNAL_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
