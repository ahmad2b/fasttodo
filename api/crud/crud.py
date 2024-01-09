from sqlalchemy.orm import Session

from ..models.models import Todo, User
from ..schemas.schemas import TodoCreate, UserCreate
from ..lib import auth


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


def create_user(db: Session, user: UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = User(
        username=user.username, email=user.email, hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()
