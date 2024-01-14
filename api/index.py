from fastapi import FastAPI, Depends, HTTPException, status, Body, Request
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from functools import lru_cache

# ---

from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
from dotenv import load_dotenv
import logging

from ._database.db import get_db
from ._schemas.user import UserResponse, UserCreate, UserLogin
from ._schemas.todo import TodoCreate, TodoResponse
from ._schemas.token import Token, TokenRefresh
from ._utils.auth import (
    get_current_user,
    verify_password,
    create_access_token,
    create_refresh_token,
    authenticate_user,
    verify_token,
)

from .services.todo import (
    create_todo,
    get_todos,
    read_todo,
    update_todo,
    delete_todo,
)
from .services.user import create_user, get_user, get_user_by_email


# from loguru import logger
from uuid import uuid4

# import sys

# sys.path.append(r"C:\Users\ahmad\Desktop\BattleField\fasttodo")

from api._config.config import settings

# from api.routers.user import router as user_router
# from api.routers.todo import router as todo_router


app = FastAPI(
    docs_url="/api/v1/docs",
    openapi_url="/api/v1/openapi.json",
    title="FastTodo API",
    version="0.1.0",
    debug=True,
)

# app.include_router(user_router, prefix="/api/v1/users")
# app.include_router(todo_router, prefix="/api/v1/todos")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://fasttodo.vercel.app",
    "https://fasttodo-v1.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ACCESS_TOKEN_EXPIRE_MINUTES = 5
REFRESH_TOKEN_EXPIRE_MINUTES = 10


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    print(f"OMG! An HTTP error!: {exc}")
    return JSONResponse({"detail": str(exc.detail)}, status_code=exc.status_code)


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    # logger.error(f"An error occurred: {exc}")
    return JSONResponse(status_code=500, content={"message": "Internal Server Error"})


@lru_cache()
def get_settings():
    return settings


@app.get("/api/status")
def hello():
    """
    Status endpoint. Returns a success status and a greeting message.
    """
    return {"status": "success", "message": "Hello Friends!"}


# logger.remove()

# logger.add(
#     sys.stdout,
#     level="INFO",
#     format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
# )

# logger.add(
#     "logs/esg_spider_{time}.log",
#     rotation="1 day",
#     retention="7 days",
#     level="INFO",
#     format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
# )


# @app.middleware("http")
# async def log_middleware(request: Request, call_next):
#     log_id = str(uuid4())
#     with logger.contextualize(log_id=log_id):
#         logger.info("Request to access " + request.url.path)
#         try:
#             response = await call_next(request)
#         except Exception as ex:
#             logger.error(f"Request to " + request.url.path + " failed: {ex}")
#             response = JSONResponse(content={"success": False}, status_code=500)
#         finally:
#             logger.info("Successfully accessed " + request.url.path)
#             return response


@app.post(
    "/api/v1/todos", response_model=TodoResponse, status_code=status.HTTP_201_CREATED
)
def create_todo_endpoint(
    todo: TodoCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Create todo API endpoint. Creates a new todo.
    """
    # logger.info("Creating a new todo")
    print("Creating a new todo")
    new_todo = create_todo(db=db, todo=todo, owner_id=current_user.id)
    return TodoResponse(
        id=new_todo.id,
        title=new_todo.title,
        description=new_todo.description,
        completed=new_todo.completed,
        created_at=new_todo.created_at,
        updated_at=new_todo.updated_at,
    )


@app.get(
    "/api/v1/todos", response_model=List[TodoResponse], status_code=status.HTTP_200_OK
)
def get_todos_endpoint(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    completed: bool = False,
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Get all todos API endpoint. Returns a list of todos.
    """
    # logger.info("Getting all todos")

    db_todos = get_todos(
        db=db, skip=skip, limit=limit, completed=completed, owner_id=current_user.id
    )

    if len(db_todos) == 0:
        # logger.warning("No todos found")
        return []

    return db_todos


@app.get(
    "/api/v1/todos/{todo_id}",
    response_model=TodoResponse,
    status_code=status.HTTP_200_OK,
)
def get_todo_endpoint(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Get todo API endpoint. Returns a specific todo.
    """
    # logger.info(f"Getting todo with id: {todo_id}")

    db_todo = read_todo(db=db, todo_id=todo_id, owner_id=current_user.id)
    if db_todo is None:
        # logger.warning(f"Todo with id {todo_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )
    return db_todo


@app.put(
    "/api/v1/todos/{todo_id}",
    response_model=TodoResponse,
    status_code=status.HTTP_200_OK,
)
def update_todo_endpoint(
    todo_id: int,
    todo: TodoCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Update todo API endpoint. Updates a specific todo.
    """
    # logger.info(f"Updating todo with id: {todo_id}")

    db_todo = update_todo(db=db, todo_id=todo_id, todo=todo, owner_id=current_user.id)
    if db_todo is None:
        # logger.warning("Todo not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )
    return db_todo


@app.delete("/api/v1/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo_endpoint(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Delete todo API endpoint. Deletes a specific todo.
    """
    # logger.info(f"Deleting todo with id: {todo_id}")

    db_todo = delete_todo(db=db, todo_id=todo_id, owner_id=current_user.id)
    if db_todo is None:
        # logger.warning("Todo not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )
    return db_todo


# ---


@app.post(
    "/api/v1/users", status_code=status.HTTP_201_CREATED, response_model=UserResponse
)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Create user API endpoint. Creates a new user.
    """
    # logger.info("Creating a new user")

    # try:
    db_user = get_user(db, username=user.username)
    if db_user:
        # logger.warning("Username already registered")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already registered",
        )
        # create new user

    db_email = get_user_by_email(db, email=user.email)
    if db_email:
        # logger.warning("Email already registered")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
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
    # logger.error(f"Error creating user: {e}", exc_info=True)
    #     raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/v1/users/signin", status_code=status.HTTP_200_OK, response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """
    Login route. Returns a JWT token to be used in subsequent requests.
    """

    # logger.info("Logging in user")

    db_user = get_user(db, username=user.username)

    if not db_user:
        # logger.error("User not found.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if not verify_password(user.password, db_user.hashed_password):
        # logger.error("Incorrect password")
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
    # logger.info("User logged in successfully")
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "username": user.username,
    }


@app.get(
    "/api/v1/users/me", status_code=status.HTTP_200_OK, response_model=UserResponse
)
def get_loggedin_user(
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Returns the information of the currently logged in user.
    """
    # logger.info("Fetching current user information")
    return current_user


# @app.post("/api/v1/users/token/refresh", response_model=Token)
# def refresh_token(token_refresh: TokenRefresh, db: Session = Depends(get_db)):
#     # logger.info("Refreshing token")
#     refresh_token = token_refresh.refresh_token

#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     token_data = verify_token(refresh_token, credentials_exception)

#     user = get_user(db, username=token_data.sub)

#     if user is None:
#         raise credentials_exception
#     access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     access_token = create_access_token(
#         data={"sub": user.username}, expires_delta=access_token_expires
#     )
#     return {
#         "access_token": access_token,
#         "token_type": "bearer",
#         "username": user.username,
#         "refresh_token": refresh_token,
#     }


@app.post("/api/v1/users/token/refresh", response_model=Token)
def refresh_token(token_refresh: TokenRefresh, db: Session = Depends(get_db)):
    logging.info("Refreshing token")
    refresh_token = token_refresh.refresh_token
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token_data = verify_token(refresh_token, credentials_exception)
    except Exception as e:
        logging.error(f"Failed to verify token: {e}")
        raise credentials_exception

    user = get_user(db, username=token_data.sub)

    if user is None:
        logging.error(f"No user found with username: {token_data.sub}")
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
