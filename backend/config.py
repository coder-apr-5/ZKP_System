from pydantic import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./test.db"
    ISSUER_KEY_SECRET: str = "secret-key-for-admin"
    PORT_ISSUER: int = 8000
    PORT_VERIFIER: int = 8001
    
    class Config:
        env_file = ".env"

settings = Settings()
