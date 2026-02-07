"""
Health check router for the Todo API.
Contract: specs/001-project-init-architecture/contracts/health.yaml

Provides:
- /health - Basic liveness check for load balancers
- /health/ready - Readiness check with database and config validation
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Response, status
from pydantic import BaseModel


router = APIRouter(prefix="/health", tags=["Health"])


class HealthResponse(BaseModel):
    """Basic health check response."""
    status: str  # "healthy" | "unhealthy"
    timestamp: str
    error: Optional[str] = None


class ChecksDetail(BaseModel):
    """Detailed checks for readiness."""
    database: str  # "connected" | "disconnected"
    config: str  # "valid" | "invalid"


class ReadinessResponse(BaseModel):
    """Readiness check response with detailed checks."""
    status: str  # "ready" | "not_ready"
    timestamp: str
    checks: ChecksDetail
    error: Optional[str] = None


def get_timestamp() -> str:
    """Return current UTC timestamp in ISO 8601 format."""
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


@router.get("", response_model=HealthResponse)
async def health_check(response: Response) -> HealthResponse:
    """
    Basic health check endpoint.

    Use for:
    - Load balancer health probes
    - Container orchestration liveness checks
    - Basic availability verification

    Returns 200 if healthy, 503 if unhealthy.
    """
    # Basic check - if the server responds, it's healthy
    return HealthResponse(
        status="healthy",
        timestamp=get_timestamp()
    )


@router.get("/ready", response_model=ReadinessResponse)
async def readiness_check(response: Response) -> ReadinessResponse:
    """
    Readiness check endpoint with detailed status.

    Checks:
    - Database connectivity
    - Configuration validation

    Use for Kubernetes readiness probes.
    Returns 200 if ready, 503 if not ready.
    """
    timestamp = get_timestamp()
    errors = []

    # Check database connectivity
    # For now, we'll mark as connected - actual DB check will be added
    # when database.py is implemented in Phase 4 (T028)
    db_status = "connected"

    # Check configuration validity
    # For now, we'll mark as valid - actual config check will be added
    # when config.py is implemented in Phase 4 (T027)
    config_status = "valid"

    # Determine overall readiness
    is_ready = db_status == "connected" and config_status == "valid"

    if not is_ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        if db_status != "connected":
            errors.append("Database connection failed")
        if config_status != "valid":
            errors.append("Configuration validation failed")

    return ReadinessResponse(
        status="ready" if is_ready else "not_ready",
        timestamp=timestamp,
        checks=ChecksDetail(
            database=db_status,
            config=config_status
        ),
        error="; ".join(errors) if errors else None
    )
