from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    completed: Optional[bool] = False


class TodoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    completed: Optional[bool] = False
    created_at: datetime
    updated_at: datetime

    class ConfigDict:
        orm_mode = True


class UserCreate(BaseModel):
    username: str
    email: str
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


class TokenData(BaseModel):
    sub: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str
