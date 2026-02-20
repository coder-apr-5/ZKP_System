from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.issuer.routes import router as issuer_router
from app.api.verifier.routes import router as verifier_router
import structlog

# Simple structlog configuration
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer()
    ]
)

app = FastAPI(
    title="PrivaSeal API",
    description="Universal Privacy-First Verification Protocol",
    version="0.1.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# CORS (Allow all for development, restrict for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(issuer_router, prefix="/api/issuer", tags=["Issuer"])
app.include_router(verifier_router, prefix="/api/verifier", tags=["Verifier"])

@app.get("/")
async def root():
    return {"message": "PrivaSeal API Running", "version": "0.1.0"}
