from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "Next Fast Todo"

    class ConfigDict:
        env_file = ".env"
