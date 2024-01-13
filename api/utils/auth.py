from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..utils.hash_password import HashPassword
from ..utils.token import create_access_token, create_refresh_token

from ..database.db import SessionLocal, get_db
from ..schemas.user import UserResponse
from ..services.user import get_user


from ..utils.token import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

verify_password = HashPassword().verify_pass
create_access_token = create_access_token
create_refresh_token = create_refresh_token


def authenticate_user(username: str, password: str, db: Session):
    user = get_user(db, username=username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> UserResponse:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_token(token, credentials_exception)
    user = get_user(db, username=token_data.sub)
    if user is None:
        raise credentials_exception

    return user
