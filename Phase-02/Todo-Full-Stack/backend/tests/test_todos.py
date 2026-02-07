"""
Todo API tests.

Task Reference: T020 - Create API tests for all endpoints
Feature: 003-todo-crud

Tests cover:
- POST /todos - Create todo
- GET /todos - List todos
- GET /todos/{id} - Get single todo
- PATCH /todos/{id} - Update todo
- DELETE /todos/{id} - Delete todo

All tests verify authentication and owner-only access.
"""

from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from jose import jwt
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.config import settings
from app.database import get_session
from app.main import app
from app.models.todo import Todo


# Test user data
TEST_USER_ID = "test_user_123"
TEST_USER_EMAIL = "test@example.com"
OTHER_USER_ID = "other_user_456"


def create_test_token(user_id: str = TEST_USER_ID, email: str = TEST_USER_EMAIL) -> str:
    """Create a valid JWT token for testing."""
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


@pytest.fixture(name="engine")
def engine_fixture():
    """Create an in-memory SQLite engine for testing."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture(name="session")
def session_fixture(engine):
    """Create a new database session for testing."""
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(engine):
    """Create a test client with overridden database session."""

    def get_session_override():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = get_session_override
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="auth_headers")
def auth_headers_fixture():
    """Create authorization headers with a valid JWT token."""
    token = create_test_token()
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(name="other_user_headers")
def other_user_headers_fixture():
    """Create authorization headers for a different user."""
    token = create_test_token(user_id=OTHER_USER_ID, email="other@example.com")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(name="sample_todo")
def sample_todo_fixture(session):
    """Create a sample todo in the database."""
    todo = Todo(
        title="Test Todo",
        description="Test description",
        user_id=TEST_USER_ID,
    )
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo


class TestCreateTodo:
    """Tests for POST /todos endpoint."""

    def test_create_todo_success(self, client: TestClient, auth_headers: dict):
        """Should create a todo with valid data."""
        response = client.post(
            "/todos",
            json={"title": "Buy groceries", "description": "Milk, eggs, bread"},
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Buy groceries"
        assert data["description"] == "Milk, eggs, bread"
        assert data["completed"] is False
        assert data["user_id"] == TEST_USER_ID
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_todo_minimal(self, client: TestClient, auth_headers: dict):
        """Should create a todo with only required fields."""
        response = client.post(
            "/todos",
            json={"title": "Minimal todo"},
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Minimal todo"
        assert data["description"] is None

    def test_create_todo_missing_title(self, client: TestClient, auth_headers: dict):
        """Should return 422 when title is missing."""
        response = client.post(
            "/todos",
            json={"description": "No title"},
            headers=auth_headers,
        )

        assert response.status_code == 422

    def test_create_todo_empty_title(self, client: TestClient, auth_headers: dict):
        """Should return 422 when title is empty."""
        response = client.post(
            "/todos",
            json={"title": ""},
            headers=auth_headers,
        )

        assert response.status_code == 422

    def test_create_todo_whitespace_title(self, client: TestClient, auth_headers: dict):
        """Should return 422 when title is only whitespace."""
        response = client.post(
            "/todos",
            json={"title": "   "},
            headers=auth_headers,
        )

        assert response.status_code == 422

    def test_create_todo_unauthenticated(self, client: TestClient):
        """Should return 401 when not authenticated."""
        response = client.post(
            "/todos",
            json={"title": "Test"},
        )

        assert response.status_code == 401


class TestListTodos:
    """Tests for GET /todos endpoint."""

    def test_list_todos_empty(self, client: TestClient, auth_headers: dict):
        """Should return empty list when user has no todos."""
        response = client.get("/todos", headers=auth_headers)

        assert response.status_code == 200
        assert response.json() == []

    def test_list_todos_with_data(
        self, client: TestClient, auth_headers: dict, sample_todo: Todo
    ):
        """Should return user's todos."""
        response = client.get("/todos", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == sample_todo.id
        assert data[0]["title"] == sample_todo.title

    def test_list_todos_owner_only(
        self,
        client: TestClient,
        other_user_headers: dict,
        sample_todo: Todo,
    ):
        """Should not return other users' todos."""
        response = client.get("/todos", headers=other_user_headers)

        assert response.status_code == 200
        assert response.json() == []

    def test_list_todos_unauthenticated(self, client: TestClient):
        """Should return 401 when not authenticated."""
        response = client.get("/todos")

        assert response.status_code == 401


class TestGetTodo:
    """Tests for GET /todos/{id} endpoint."""

    def test_get_todo_success(
        self, client: TestClient, auth_headers: dict, sample_todo: Todo
    ):
        """Should return todo when owned by user."""
        response = client.get(f"/todos/{sample_todo.id}", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_todo.id
        assert data["title"] == sample_todo.title

    def test_get_todo_not_found(self, client: TestClient, auth_headers: dict):
        """Should return 404 for non-existent todo."""
        response = client.get("/todos/nonexistent_id", headers=auth_headers)

        assert response.status_code == 404
        data = response.json()["detail"]
        assert data["error"] == "RESOURCE_NOT_FOUND"

    def test_get_todo_other_user(
        self,
        client: TestClient,
        other_user_headers: dict,
        sample_todo: Todo,
    ):
        """Should return 404 for another user's todo (security)."""
        response = client.get(f"/todos/{sample_todo.id}", headers=other_user_headers)

        assert response.status_code == 404

    def test_get_todo_unauthenticated(self, client: TestClient, sample_todo: Todo):
        """Should return 401 when not authenticated."""
        response = client.get(f"/todos/{sample_todo.id}")

        assert response.status_code == 401


class TestUpdateTodo:
    """Tests for PATCH /todos/{id} endpoint."""

    def test_update_todo_title(
        self, client: TestClient, auth_headers: dict, sample_todo: Todo
    ):
        """Should update todo title."""
        response = client.patch(
            f"/todos/{sample_todo.id}",
            json={"title": "Updated title"},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated title"
        assert data["description"] == sample_todo.description

    def test_update_todo_completed(
        self, client: TestClient, auth_headers: dict, sample_todo: Todo
    ):
        """Should update completed status."""
        response = client.patch(
            f"/todos/{sample_todo.id}",
            json={"completed": True},
            headers=auth_headers,
        )

        assert response.status_code == 200
        assert response.json()["completed"] is True

    def test_update_todo_partial(
        self, client: TestClient, auth_headers: dict, sample_todo: Todo
    ):
        """Should update only provided fields."""
        original_title = sample_todo.title
        response = client.patch(
            f"/todos/{sample_todo.id}",
            json={"description": "New description"},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == original_title
        assert data["description"] == "New description"

    def test_update_todo_not_found(self, client: TestClient, auth_headers: dict):
        """Should return 404 for non-existent todo."""
        response = client.patch(
            "/todos/nonexistent_id",
            json={"title": "Updated"},
            headers=auth_headers,
        )

        assert response.status_code == 404

    def test_update_todo_other_user(
        self,
        client: TestClient,
        other_user_headers: dict,
        sample_todo: Todo,
    ):
        """Should return 404 for another user's todo (security)."""
        response = client.patch(
            f"/todos/{sample_todo.id}",
            json={"title": "Hacked"},
            headers=other_user_headers,
        )

        assert response.status_code == 404

    def test_update_todo_unauthenticated(self, client: TestClient, sample_todo: Todo):
        """Should return 401 when not authenticated."""
        response = client.patch(
            f"/todos/{sample_todo.id}",
            json={"title": "Updated"},
        )

        assert response.status_code == 401


class TestDeleteTodo:
    """Tests for DELETE /todos/{id} endpoint."""

    def test_delete_todo_success(
        self, client: TestClient, auth_headers: dict, sample_todo: Todo
    ):
        """Should delete todo when owned by user."""
        response = client.delete(f"/todos/{sample_todo.id}", headers=auth_headers)

        assert response.status_code == 204

        # Verify deletion
        get_response = client.get(f"/todos/{sample_todo.id}", headers=auth_headers)
        assert get_response.status_code == 404

    def test_delete_todo_not_found(self, client: TestClient, auth_headers: dict):
        """Should return 404 for non-existent todo."""
        response = client.delete("/todos/nonexistent_id", headers=auth_headers)

        assert response.status_code == 404

    def test_delete_todo_other_user(
        self,
        client: TestClient,
        other_user_headers: dict,
        sample_todo: Todo,
    ):
        """Should return 404 for another user's todo (security)."""
        response = client.delete(
            f"/todos/{sample_todo.id}",
            headers=other_user_headers,
        )

        assert response.status_code == 404

    def test_delete_todo_unauthenticated(self, client: TestClient, sample_todo: Todo):
        """Should return 401 when not authenticated."""
        response = client.delete(f"/todos/{sample_todo.id}")

        assert response.status_code == 401
