import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.issuer.routes import router as issuer_router
from app.api.verifier.routes import router as verifier_router

# Use standard Python logging instead of structlog
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("privaseal")

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

# Include the old MediGuard routes (backward compatibility)
try:
    from api.hospital.routes import router as hospital_router
    from api.provider.routes import router as provider_router
    from database.db import engine, Base

    @app.on_event("startup")
    async def startup_db_client():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    app.include_router(hospital_router, prefix="/api/hospital", tags=["Hospital (Issuer)"])
    app.include_router(provider_router, prefix="/api/provider", tags=["Provider (Verifier)"])
    logger.info("Legacy MediGuard routes loaded successfully")
except ImportError as e:
    logger.warning(f"Legacy routes not loaded: {e}")

# New PrivaSeal routes
app.include_router(issuer_router, prefix="/api/issuer", tags=["Issuer"])
app.include_router(verifier_router, prefix="/api/verifier", tags=["Verifier"])

@app.get("/")
async def root():
    return {"message": "PrivaSeal API Running", "version": "0.1.0"}
