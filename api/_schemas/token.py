from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TokenData(BaseModel):
    sub: Optional[str] = None


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    username: str


class TokenRefresh(BaseModel):
    refresh_token: str
