from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parents[1]

class Settings(BaseSettings):
    OPENAI_API_KEY: Optional[str] = None
    AI_SERVICE_PORT: int = 8000
    DATABASE_URL: Optional[str] = None

    model_config = {
        "env_file": str(BASE_DIR / ".env"),
        "env_file_encoding": "utf-8",
    }

settings = Settings()