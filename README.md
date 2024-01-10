# Fast Todo

## Table of Contents

- [Fast Todo](#fast-todo)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Frontend - Next.js](#frontend---nextjs)
  - [Backend - FastAPI](#backend---fastapi)
    - [API Endpoints](#api-endpoints)
    - [File Structure](#file-structure)
    - [How it works?](#how-it-works)
    - [Steps by steps](#steps-by-steps)

## Introduction

Fast Todo is a full-stack web app built with FastAPI and Next.js. It provides a user-friendly interface for managing todos.

## Frontend - Next.js

The frontend of the web app is built using Next.js, a popular React framework. It provides a user-friendly interface for managing todos.

## Backend - FastAPI

The backend of the web app is built using FastAPI. It provides a RESTful API for managing users and todos.

### API Endpoints

- `GET /api`: Root API endpoint. Returns a greeting message and the application name.
- `GET /api/status`: Status endpoint. Returns a success status and a greeting message.
- `POST /api/user/signup`: User signup API endpoint. Creates a new user.
- `POST /api/user/login`: Login route. Returns a JWT token to be used in subsequent requests.
- `GET /api/user/me`: Returns the information of the currently logged in user.
- `POST /api/todos`: Create todo API endpoint. Creates a new todo.
- `GET /api/todos`: Get all todos API endpoint. Returns a list of todos.
- `GET /api/todos/{todo_id}`: Get todo API endpoint. Returns a specific todo.
- `PUT /api/todos/{todo_id}`: Update todo API endpoint. Updates a specific todo.

### File Structure

- `api/crud/crud.py`: Contains the CRUD operations for the Todo and User models.
- `api/index.py`: The main entry point of the application. It defines the API endpoints and the application's configuration.
- `api/lib/auth.py`: Contains the authentication logic, including password hashing and token generation.
- `api/models/models.py`: Defines the SQLAlchemy models for the User and Todo entities.
- `api/schemas/schemas.py`: Defines the Pydantic models for request and response handling.

### How it works?

The application starts from `api/index.py`, where the `FastAPI` application is created and the API endpoints are defined. Each endpoint corresponds to a function that handles the request and returns a response.

The endpoints make use of the CRUD operations defined in `api/crud/crud.py` to interact with the database. These operations use the `SQLAlchemy` models defined in `api/models/models.py`.

The request and response data are validated and serialized using the `Pydantic` models defined in `api/schemas/schemas.py`.

The authentication logic is handled in `api/lib/auth.py`. This includes verifying the user's password, generating access tokens, and getting the current user from the token.

The application uses `JWT` for authentication. When a user logs in, they receive a token that they must include in the Authorization header of their subsequent requests. This token is used to identify the user and check their permissions.

The application also uses CORS middleware to handle cross-origin requests. The application is configured to serve the API documentation from `/api/docs` and the OpenAPI schema from `/api/openapi.json`. This is done using the `docs_url` and `openapi_url` parameters of the `FastAPI` application.

---

### Steps by steps

1. Create a `next.js` app
2. Deploy your simple next.js project to `vercel`
3. Create a `api/index.py` file in route
4. Create a simple `fastapi` `/api/status` GET route
5. Create `requirements.txt` file and add fastapi package
6. Deploy it to vercel
7. Visit `your-vercel.app/api/status`
8. If you can see your API status it means have successfuly deployed Fastapi with next.js on vercel
9. Create `config.py` file
10. Define schemas in a new `schemas.py` file
11. Create a new `db.py` file for creating db connection
12. Create models in new `models.py` file
13. Use `alembic` for migrations
14. Create CRUD operations in new `crud.py` file
15. Create API endpoints in `index.py` file
16. Deploy and test the endpoints by going to `/api/docs` endpoints
17. Design the frontend
