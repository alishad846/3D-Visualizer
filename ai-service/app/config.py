import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    AI_SERVICE_PORT: int = 8000
    DATABASE_URL: str = ""

    model_config = {"env_file": ".env"}
    
settings = Settings()