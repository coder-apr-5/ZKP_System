import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PrivaSeal"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/privaseal_db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change_me_in_production")
    
    class Config:
        env_file = ".env"

settings = Settings()
