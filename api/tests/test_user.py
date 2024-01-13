import pytest
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient
import sys

sys.path.append(r"C:\Users\ahmad\Desktop\BattleField\fasttodo")

from api.index import app
from api.services.user import get_user, create_user
from api.database.db import get_db

client = TestClient(app)


def test_create_user():
    """
    This test checks if a user can be created successfully.
    """
    # Arrange
    user_data = {
        "username": "testuser12",
        "email": "testuser12@example.com",
        "password": "testpassword",
    }
    response = client.post("/api/v1/users/", json=user_data)

    # Act
    # db: Session = next(get_db())
    user = get_user(db, user_data["username"])

    # Assert
    assert response.status_code == 201
    assert isinstance(response.json(), dict)
    assert response.json()["username"] == user_data["username"]


def test_create_user_missing_data():
    """
    This test checks what happens when you try to create a user with missing data.
    """
    # Arrange
    user_data = {
        "username": "testuser5",
        "password": "testpassword",
    }
    response = client.post("/api/v1/users/", json=user_data)

    # Assert
    assert response.status_code == 422  # Unprocessable Entity


def test_create_user_duplicate_username():
    """
    This test checks what happens when you try to create a user with a username that already exists.
    """
    # Arrange
    user_data = {
        "username": "testuser5",
        "email": "testuser5@example.com",
        "password": "testpassword",
    }
    client.post("/api/v1/users/", json=user_data)
    response = client.post("/api/v1/users/", json=user_data)

    # Assert
    assert response.status_code == 409  # Bad Request


def test_create_user_duplicate_email():
    """
    This test checks what happens when you try to create a user with an email address that already exists.
    """
    # Arrange
    user_data = {
        "username": "testuser5",
        "email": "testuser5@example.com",
        "password": "XXXXXXXXXXXX",
    }

    # Act
    # client.post("/api/v1/users/", json=user_data)
    response = client.post("/api/v1/users/", json=user_data)

    # Assert
    assert response.status_code == 409  # Bad Request


# Test edge case: empty username
def test_create_user_empty_username():
    """
    This test checks what happens when you try to create a user with an empty username.
    """
    user_data = {
        "username": "",
        "email": "testuser10@example.com",
        "password": "testpassword",
    }
    response = client.post("/api/v1/users/", json=user_data)
    assert response.status_code == 422  # Unprocessable Entity


# Test edge case: long username
def test_create_user_long_username():
    """
    This test checks what happens when you try to create a user with a username that's too long.
    """
    user_data = {
        "username": "a" * 101,  # Assuming max length is 100
        "email": "testuser10@example.com",
        "password": "testpassword",
    }
    response = client.post("/api/v1/users/", json=user_data)
    assert response.status_code == 422  # Unprocessable Entity


# Test invalid data: invalid email
def test_create_user_invalid_email():
    """
    This test checks what happens when you try to create a user with an invalid email address.
    """
    user_data = {
        "username": "testuser10",
        "email": "invalid email",
        "password": "testpassword",
    }
    response = client.post("/api/v1/users/", json=user_data)
    assert response.status_code == 422  # Unprocessable Entity


# Test user authentication: successful login
def test_authenticate_user_success():
    """
    This test checks if a user can log in successfully.
    """
    user_data = {
        "username": "testuser11",
        "password": "testpassword",
    }
    client.post("/api/v1/users/", json=user_data)
    response = client.post("/api/v1/users/signin/", json=user_data)
    assert response.status_code == 200
    assert "access_token" in response.json()


# Test user authentication: unsuccessful login
def test_authenticate_user_fail():
    """
    This test checks what happens when a user tries to log in with the wrong password.
    """
    user_data = {
        "username": "testuser10",
        "password": "wrongpassword",
    }
    response = client.post("/api/v1/users/signin/", json=user_data)
    assert response.status_code == 401  # Unauthorized


# ----------------------- #


def test_refresh_token():
    """
    This test checks if a user can refresh their access token.
    """

    # Arrange
    login_data = {"username": "testuser11", "password": "testpassword"}
    login_response = client.post("/api/v1/users/signin", json=login_data)
    assert login_response.status_code == 200
    refresh_token = login_response.json().get("refresh_token")

    json_data = {"refresh_token": refresh_token}

    # Act
    response = client.post("/api/v1/users/token/refresh", json=json_data)

    # Assert
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_refresh_token_invalid():
    """
    This test checks what happens when a user tries to refresh their access token with an invalid refresh token.
    """

    # Arrange
    json_data = {"refresh_token": "invalid_token"}

    # Act
    response = client.post("/api/v1/users/token/refresh", json=json_data)

    # Assert
    assert response.status_code == 401


def test_refresh_token_no_token():
    """
    This test checks what happens when a user tries to refresh their access token without a refresh token.
    """

    # Act
    response = client.post("/api/v1/users/token/refresh")

    # Assert
    assert response.status_code == 422
