from typing_extensions import Annotated
from pydantic import BaseModel, EmailStr, StringConstraints
from typing import Optional, List
from datetime import datetime
from .._schemas.todo import TodoResponse


class UserCreate(BaseModel):
    username: Annotated[str, StringConstraints(min_length=3, max_length=100)]
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    todos: List[TodoResponse] = []
    created_at: datetime
    updated_at: datetime

    class ConfigDict:
        orm_mode = True
