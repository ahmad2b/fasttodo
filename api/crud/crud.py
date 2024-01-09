from sqlalchemy.orm import Session

from ..models.models import Todo
from ..schemas.schemas import TodoCreate


def create_todo(db: Session, todo: TodoCreate):
    db_todo = Todo(title=todo.title, description=todo.description)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


def get_todos(db: Session, skip: int = 0, limit: int = 100, completed: bool = False):
    if completed:
        return (
            db.query(Todo)
            .filter(Todo.completed == completed)
            .offset(skip)
            .limit(limit)
            .all()
        )
    return db.query(Todo).offset(skip).limit(limit).all()


def read_todo(db: Session, todo_id: int):
    return db.query(Todo).filter(Todo.id == todo_id).first()


def update_todo(db: Session, todo_id: int, todo: TodoCreate):
    db_todo = db.query(Todo).filter(Todo.id == todo_id).first()
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


def delete_todo(db: Session, todo_id: int):
    db.query(Todo).filter(Todo.id == todo_id).delete()
    db.commit()
    return True
