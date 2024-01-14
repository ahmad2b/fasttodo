from typing_extensions import Annotated
from pydantic import BaseModel, StringConstraints
from typing import Optional, List
from datetime import datetime


class TodoCreate(BaseModel):
    title: Annotated[str, StringConstraints(min_length=1)]
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
