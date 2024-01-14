import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseModel):
    app_name: str = "Next Fast Todo"

    @property
    def database_url(self):
        return f"postgresql://{os.environ['DATABASE_USERNAME']}:{os.environ['DATABASE_PASSWORD']}@{os.environ['DATABASE_HOST']}/{os.environ['DATABASE_NAME']}?sslmode=require"

    class ConfigDict:
        env_file = ".env"


settings = Settings()
