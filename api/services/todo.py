from sqlalchemy.orm import Session
from typing import Optional

from ..database.models.todo import Todo
from ..schemas.todo import TodoCreate


def create_todo(db: Session, todo: TodoCreate, owner_id: int):
    db_todo = Todo(title=todo.title, description=todo.description, owner_id=owner_id)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


def get_todos(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    completed: bool = False,
    owner_id: Optional[int] = None,
):
    if owner_id:
        return (
            db.query(Todo)
            .filter(Todo.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    return (
        db.query(Todo)
        .filter(Todo.completed == completed)
        .offset(skip)
        .limit(limit)
        .all()
    )

    if owner_id and completed:
        return (
            db.query(Todo)
            .filter(Todo.owner_id == owner_id)
            .filter(Todo.completed == completed)
            .offset(skip)
            .limit(limit)
            .all()
        )


def read_todo(db: Session, todo_id: int, owner_id: int):
    # return db.query(Todo).filter(Todo.id == todo_id).first()
    return (
        db.query(Todo)
        .filter(Todo.id == todo_id)
        .filter(Todo.owner_id == owner_id)
        .first()
    )


def update_todo(db: Session, todo_id: int, todo: TodoCreate, owner_id: int):
    # db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
    db_todo = (
        db.query(Todo)
        .filter(Todo.id == todo_id)
        .filter(Todo.owner_id == owner_id)
        .first()
    )
    if db_todo is None:
        return None
    db.query(Todo).filter(Todo.id == todo_id).update(
        {
            Todo.title: todo.title,
            Todo.description: todo.description,
            Todo.completed: todo.completed,
        }
    )
    db.commit()
    db.refresh(db_todo)
    return db_todo


def delete_todo(db: Session, todo_id: int, owner_id: int):
    db_todo = (
        db.query(Todo)
        .filter(Todo.id == todo_id)
        .filter(Todo.owner_id == owner_id)
        .first()
    )

    if db_todo is None:
        return None
    db.query(Todo).filter(Todo.id == todo_id).delete()
    db.commit()
    return db_todo
