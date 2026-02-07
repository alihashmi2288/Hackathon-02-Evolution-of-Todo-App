"""
Application configuration using Pydantic Settings.

Task Reference: T027 - Create backend/app/config.py with Pydantic Settings
Feature: 001-project-init-architecture

Validates all required environment variables on startup and provides
type-safe access throughout the application.
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    All required variables will cause startup failure if missing.
    """

    model_config = SettingsConfigDict(
        env_file=[".env", "../.env"],
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    database_url: PostgresDsn = Field(
        ...,
        description="PostgreSQL connection string for Neon database",
    )

    # Authentication
    jwt_secret: str = Field(
        ...,
        min_length=32,
        validation_alias="BETTER_AUTH_SECRET",
        description="Secret key for JWT verification (must match Better Auth)",
    )
    jwt_algorithm: str = Field(
        default="HS256",
        description="Algorithm used for JWT signing",
    )

    # Environment
    environment: Literal["development", "staging", "production"] = Field(
        default="development",
        description="Current deployment environment",
    )

    # Server
    backend_host: str = Field(
        default="0.0.0.0",
        description="Host to bind the server to",
    )
    backend_port: int = Field(
        default=8000,
        ge=1,
        le=65535,
        description="Port to run the server on",
    )

    # CORS
    cors_origins: str = Field(
        default="http://localhost:3000",
        description="Comma-separated list of allowed CORS origins",
    )

    # Database pool
    db_pool_size: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Database connection pool size",
    )
    db_max_overflow: int = Field(
        default=10,
        ge=0,
        le=20,
        description="Maximum overflow connections above pool size",
    )

    # Debug
    debug: bool = Field(
        default=False,
        description="Enable debug mode",
    )

    # Push Notifications (006-recurring-reminders)
    # All optional - push disabled if not configured
    VAPID_PUBLIC_KEY: str | None = Field(
        default=None,
        description="VAPID public key for Web Push",
    )
    VAPID_PRIVATE_KEY: str | None = Field(
        default=None,
        description="VAPID private key for Web Push",
    )
    VAPID_CLAIMS_EMAIL: str | None = Field(
        default=None,
        description="Contact email for VAPID claims (mailto:...)",
    )

    @field_validator("cors_origins")
    @classmethod
    def validate_cors_origins(cls, v: str) -> str:
        """Ensure CORS origins is not empty."""
        if not v.strip():
            raise ValueError("CORS_ORIGINS cannot be empty")
        return v

    @property
    def cors_origins_list(self) -> list[str]:
        """Return CORS origins as a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    """
    Get cached application settings.

    Uses LRU cache to ensure settings are only loaded once.
    Raises ValidationError if required environment variables are missing.
    """
    return Settings()


# Convenience function for accessing settings
settings = get_settings()
