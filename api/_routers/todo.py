from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

# from loguru import logger
from datetime import timedelta
from typing import List

from .._database.db import get_db
from .._schemas.user import UserResponse
from .._schemas.todo import TodoCreate, TodoResponse
from .._utils.auth import get_current_user
from ..services.todo import (
    create_todo,
    get_todos,
    read_todo,
    update_todo,
    delete_todo,
)


router = APIRouter(tags=["Todo"])


@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo_endpoint(
    todo: TodoCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Create todo API endpoint. Creates a new todo.
    """
    # logger.info("Creating a new todo")

    new_todo = create_todo(db=db, todo=todo, owner_id=current_user.id)
    return TodoResponse(
        id=new_todo.id,
        title=new_todo.title,
        description=new_todo.description,
        completed=new_todo.completed,
        created_at=new_todo.created_at,
        updated_at=new_todo.updated_at,
    )


@router.get("/", response_model=List[TodoResponse], status_code=status.HTTP_200_OK)
def get_todos_endpoint(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    completed: bool = False,
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Get all todos API endpoint. Returns a list of todos.
    """
    # logger.info("Getting all todos")

    db_todos = get_todos(
        db=db, skip=skip, limit=limit, completed=completed, owner_id=current_user.id
    )

    if len(db_todos) == 0:
        # logger.warning("No todos found")
        return []

    return db_todos


@router.get("/{todo_id}", response_model=TodoResponse, status_code=status.HTTP_200_OK)
def get_todo_endpoint(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Get todo API endpoint. Returns a specific todo.
    """
    # logger.info(f"Getting todo with id: {todo_id}")

    db_todo = read_todo(db=db, todo_id=todo_id, owner_id=current_user.id)
    if db_todo is None:
        # logger.warning(f"Todo with id {todo_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )
    return db_todo


@router.put("/{todo_id}", response_model=TodoResponse, status_code=status.HTTP_200_OK)
def update_todo_endpoint(
    todo_id: int,
    todo: TodoCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Update todo API endpoint. Updates a specific todo.
    """
    # logger.info(f"Updating todo with id: {todo_id}")

    db_todo = update_todo(db=db, todo_id=todo_id, todo=todo, owner_id=current_user.id)
    if db_todo is None:
        # logger.warning("Todo not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )
    return db_todo


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo_endpoint(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Delete todo API endpoint. Deletes a specific todo.
    """
    # logger.info(f"Deleting todo with id: {todo_id}")

    db_todo = delete_todo(db=db, todo_id=todo_id, owner_id=current_user.id)
    if db_todo is None:
        # logger.warning("Todo not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )
    return db_todo
