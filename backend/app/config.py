import os

class Settings:
    PROJECT_NAME: str = "PrivaSeal"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./zkp_credentials.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change_me_in_production")

settings = Settings()
