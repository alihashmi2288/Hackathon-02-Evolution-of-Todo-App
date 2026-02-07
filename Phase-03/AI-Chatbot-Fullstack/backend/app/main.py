"""
FastAPI application entry point for the Todo API.

Task Reference: T019, T029 - FastAPI app initialization with config validation
Task Reference: T040 - Register occurrences router (006-recurring-reminders)
Feature: 001-project-init-architecture, 006-recurring-reminders

This module initializes the FastAPI application and includes:
- Environment validation on startup
- CORS middleware configuration
- Health check router registration
- API versioning setup
- APScheduler for background jobs (reminders, occurrence generation)
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, chat, health, me, notifications, occurrences, preferences, push, reminders, tags, todos
from app.scheduler import start_scheduler, shutdown_scheduler


# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# API metadata
API_TITLE = "Todo Full-Stack API"
API_DESCRIPTION = """
A full-stack Todo application API built with FastAPI.

## Features
- Todo CRUD operations
- User authentication via Better Auth JWT
- Health monitoring endpoints

## Authentication
This API uses JWT tokens issued by Better Auth on the frontend.
Include the token in the Authorization header: `Bearer <token>`
"""
API_VERSION = "1.0.0"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler for startup/shutdown events.

    On startup:
    - Validates configuration
    - Logs environment info
    - Creates database tables (development only)
    - Starts APScheduler for background jobs
    """
    # Startup
    logger.info(f"Starting {API_TITLE} v{API_VERSION}")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug mode: {settings.debug}")
    logger.info(f"CORS origins: {settings.cors_origins_list}")

    # In development, create tables automatically
    if settings.is_development:
        logger.info("Development mode: Auto-creating database tables")
        from app.database import create_db_and_tables
        create_db_and_tables()

    # Start the background scheduler (006-recurring-reminders)
    logger.info("Starting background scheduler")
    start_scheduler()

    yield

    # Shutdown
    logger.info("Stopping background scheduler")
    shutdown_scheduler()
    logger.info(f"Shutting down {API_TITLE}")


def create_app() -> FastAPI:
    """
    Application factory for creating the FastAPI app.

    Returns:
        Configured FastAPI application instance.
    """
    app = FastAPI(
        title=API_TITLE,
        description=API_DESCRIPTION,
        version=API_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Configure CORS using settings
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers
    app.include_router(health.router)
    app.include_router(auth.router)  # T036: Auth health check router
    app.include_router(me.router)    # T038: Current user router
    app.include_router(todos.router)  # T008: Todo CRUD router (003-todo-crud)
    app.include_router(tags.router)   # T050: Tags CRUD router (005-todo-enhancements)
    app.include_router(occurrences.router)  # T040: Occurrences router (006-recurring-reminders)
    app.include_router(reminders.router)    # T055: Reminders router (006-recurring-reminders)
    app.include_router(notifications.router)  # T067: Notifications router (006-recurring-reminders)
    app.include_router(preferences.router)   # T096: Preferences router (006-recurring-reminders)
    app.include_router(push.router)          # T127: Push notifications router (006-recurring-reminders)
    app.include_router(chat.router)          # AI Chatbot router

    return app


# Create the application instance
app = create_app()


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": API_TITLE,
        "version": API_VERSION,
        "docs": "/docs",
        "health": "/health",
    }
