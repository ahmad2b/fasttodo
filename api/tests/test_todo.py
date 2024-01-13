import pytest
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient
import sys

sys.path.append(r"C:\Users\ahmad\Desktop\BattleField\fasttodo")

from api.index import app
from api.services.todo import (
    get_todos,
    create_todo,
    read_todo,
    delete_todo,
    update_todo,
)
from api.database.db import get_db

client = TestClient(app)


def test_create_todo():
    # Arrange
    login_data = {"username": "testuser12", "password": "testpassword"}
    login_response = client.post("/api/v1/users/signin", json=login_data)
    assert login_response.status_code == 200
    access_token = login_response.json().get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"}

    new_todo = {"title": "Test Todo", "description": "This is a test todo"}

    # Act
    response = client.post("/api/v1/todos/", headers=headers, json=new_todo)

    # Assert
    assert response.status_code == 201
    assert response.json()["title"] == "Test Todo"
    assert response.json()["description"] == "This is a test todo"


def test_update_todo():
    # Arrange
    login_data = {"username": "testuser12", "password": "testpassword"}
    login_response = client.post("/api/v1/users/signin", json=login_data)
    assert login_response.status_code == 200
    access_token = login_response.json().get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"}

    new_todo = {"title": "Test Todo", "description": "This is a test todo"}
    create_response = client.post("/api/v1/todos/", headers=headers, json=new_todo)
    todo_id = create_response.json()["id"]

    updated_todo = {"title": "Updated Todo", "description": "This is an updated todo"}

    # Act
    response = client.put(
        f"/api/v1/todos/{todo_id}", headers=headers, json=updated_todo
    )

    # Assert
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Todo"


def test_delete_todo():
    # Arrange
    login_data = {"username": "testuser12", "password": "testpassword"}
    login_response = client.post("/api/v1/users/signin", json=login_data)
    assert login_response.status_code == 200
    access_token = login_response.json().get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"}

    new_todo = {"title": "Test Todo", "description": "This is a test todo"}
    create_response = client.post("/api/v1/todos/", headers=headers, json=new_todo)
    todo_id = create_response.json()["id"]

    # Act
    response = client.delete(f"/api/v1/todos/{todo_id}", headers=headers)

    # Assert
    assert response.status_code == 204


def test_get_todos():
    # Arrange
    login_data = {"username": "testuser12", "password": "testpassword"}
    login_response = client.post("/api/v1/users/signin", json=login_data)
    assert login_response.status_code == 200
    access_token = login_response.json().get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"}

    # Act
    response = client.get("/api/v1/todos/", headers=headers)

    # Assert
    assert response.status_code == 200
    assert response.json()[0]["title"] == "Test Todo"
    assert response.json()[0]["description"] == "This is a test todo"


def test_get_todos_no_todos():
    # Arrange
    login_data = {"username": "testuser11", "password": "testpassword"}
    login_response = client.post("/api/v1/users/signin", json=login_data)
    assert login_response.status_code == 200
    access_token = login_response.json().get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"}

    # Act
    response = client.get("/api/v1/todos/", headers=headers)

    # Assert
    assert response.status_code == 200
    assert response.json() == []


def test_create_todo_invalid_data():
    # Arrange
    login_data = {"username": "testuser12", "password": "testpassword"}
    login_response = client.post("/api/v1/users/signin", json=login_data)
    assert login_response.status_code == 200
    access_token = login_response.json().get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"}

    invalid_todo = {"title": "", "description": ""}  # Missing description

    # Act
    response = client.post("/api/v1/todos/", headers=headers, json=invalid_todo)

    # Assert
    assert response.status_code == 422


def test_update_todo_invalid_id():
    # Arrange
    login_data = {"username": "testuser12", "password": "testpassword"}
    login_response = client.post("/api/v1/users/signin", json=login_data)
    assert login_response.status_code == 200
    access_token = login_response.json().get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"}

    updated_todo = {"title": "Updated Todo", "description": "This is an updated todo"}

    invalid_id = 9999

    # Act
    response = client.put(
        f"/api/v1/todos/{invalid_id}", headers=headers, json=updated_todo
    )

    # Assert
    assert response.status_code == 404


def test_delete_todo_invalid_id():
    # Arrange
    login_data = {"username": "testuser12", "password": "testpassword"}
    login_response = client.post("/api/v1/users/signin", json=login_data)
    assert login_response.status_code == 200
    access_token = login_response.json().get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"}

    invalid_id = 9999

    # Act
    response = client.delete(f"/api/v1/todos/{invalid_id}", headers=headers)

    # Assert
    assert response.status_code == 404