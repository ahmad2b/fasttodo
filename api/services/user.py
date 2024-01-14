from sqlalchemy.orm import Session
from typing import Optional
from sqlalchemy.exc import SQLAlchemyError


from .._database.models.user import User
from .._schemas.user import UserCreate
from .._utils.hash_password import HashPassword

create_pass_hash = HashPassword().create_pass


def create_user(db: Session, user: UserCreate):
    hashed_password = create_pass_hash(user.password)
    db_user = User(
        username=user.username, email=user.email, hashed_password=hashed_password
    )

    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except SQLAlchemyError as e:
        db.rollback()
        raise e

    return db_user


def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()
