from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from loguru import logger
from datetime import timedelta
from dotenv import load_dotenv

from ..services.user import create_user, get_user
from ..database.db import get_db
from ..schemas.user import UserCreate, UserResponse, UserLogin
from ..schemas.token import Token, TokenRefresh
from ..utils.auth import (
    get_current_user,
    verify_password,
    create_access_token,
    create_refresh_token,
    authenticate_user,
    verify_token,
)

router = APIRouter(tags=["User"])

ACCESS_TOKEN_EXPIRE_MINUTES = 5
REFRESH_TOKEN_EXPIRE_MINUTES = 10


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Create user API endpoint. Creates a new user.
    """
    logger.info("Creating a new user")

    # try:
    db_user = get_user(db, username=user.username)
    if db_user:
        logger.warning("Username already registered")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already registered",
        )
        # create new user
    new_user = create_user(db=db, user=user)
    return UserResponse(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        todos=new_user.todos,
        created_at=new_user.created_at,
        updated_at=new_user.updated_at,
    )
    # except Exception as e:
    #     logger.error(f"Error creating user: {e}", exc_info=True)
    #     raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/signin", status_code=status.HTTP_200_OK, response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """
    Login route. Returns a JWT token to be used in subsequent requests.
    """

    logger.info("Logging in user")

    db_user = get_user(db, username=user.username)

    if not db_user:
        logger.error("User not found.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if not verify_password(user.password, db_user.hashed_password):
        logger.error("Incorrect password")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user.username}, expires_delta=refresh_token_expires
    )
    logger.info("User logged in successfully")
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "username": user.username,
    }


@router.get("/me", status_code=status.HTTP_200_OK, response_model=UserResponse)
def get_loggedin_user(
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Returns the information of the currently logged in user.
    """
    logger.info("Fetching current user information")
    return current_user


@router.post("/token/refresh", response_model=Token)
def refresh_token(token_refresh: TokenRefresh, db: Session = Depends(get_db)):
    logger.info("Refreshing token")
    refresh_token = token_refresh.refresh_token
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_token(refresh_token, credentials_exception)

    user = get_user(db, username=token_data.sub)

    if user is None:
        raise credentials_exception
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "refresh_token": refresh_token,
    }
