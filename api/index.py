from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.responses import JSONResponse, PlainTextResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Union, List
from functools import lru_cache
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from .lib.db import get_db, SessionLocal
from .lib.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    verify_password,
)
from .config import config
from .schemas.schemas import (
    TodoCreate,
    TodoResponse,
    UserResponse,
    UserCreate,
    TokenData,
    Token,
    UserLogin,
)
from .crud.crud import (
    create_todo,
    get_todos,
    delete_todo,
    update_todo,
    read_todo,
    get_user,
    create_user,
)

app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


origins = [
    "http://localhost:3000",
    "https://fasttodo.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    print(f"OMG! An HTTP error!: {exc}")
    return PlainTextResponse(str(exc.detail), status_code=exc.status_code)


@lru_cache()
def get_settings():
    return config.Settings()


@app.get("/api")
def read_root(settings: config.Settings = Depends(get_settings)):
    return {"Hello": "World", "app_name": settings.app_name}


@app.get("/api/status")
def hello():
    return {"status": "success", "message": "Hello Friends!"}


@app.post(
    "/api/auth/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, username=user.username)

    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return create_user(db=db, user=user)


@app.post("/api/auth/login", response_model=Token)
def login(
    user: UserLogin,
    db: Session = Depends(get_db),
):
    """
    Login route. Returns a JWT token to be used in subsequent requests.
    """
    db_user = get_user(db, username=user.username)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
    }


@app.get("/api/auth/me", response_model=UserResponse)
async def read_users_me(
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Get the login user information.
    """
    return current_user


@app.post(
    "/api/todos",
    response_model=TodoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_all_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    return create_todo(db=db, todo=todo)


@app.get(
    "/api/todos",
    response_model=List[TodoResponse],
    status_code=status.HTTP_200_OK,
)
def get_all_todos(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    completed: bool = False,
):
    db_todos = get_todos(db=db, skip=skip, limit=limit, completed=completed)

    if len(db_todos) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No todos found"
        )
    return db_todos


@app.get(
    "/api/todos/{todo_id}",
    response_model=TodoResponse,
    status_code=status.HTTP_200_OK,
)
def get_all_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = read_todo(db=db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )
    return db_todo


@app.put(
    "/api/todos/{todo_id}",
    response_model=TodoResponse,
    status_code=status.HTTP_200_OK,
)
def update_all_todo(todo_id: int, todo: TodoCreate, db: Session = Depends(get_db)):
    db_todo = update_todo(db=db, todo_id=todo_id, todo=todo)
    if db_todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )
    return db_todo


@app.delete("/api/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = delete_todo(db=db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )
    return db_todo
