from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str = "your-openai-api-key"
    AI_SERVICE_PORT: int = 8000

    class Config:
        env_file = ".env"

settings = Settings()