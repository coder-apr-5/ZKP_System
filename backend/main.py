from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine, Base
from api.hospital.routes import router as hospital_router
from api.provider.routes import router as provider_router

app = FastAPI(title="MediGuard | Healthcare Privacy Protocol", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# MediGuard API Routes
app.include_router(hospital_router, prefix="/api/hospital", tags=["Hospital (Issuer)"])
app.include_router(provider_router, prefix="/api/provider", tags=["Provider (Verifier)"])

@app.get("/")
def home():
    return {"message": "ZKP System Online", "docs": "/docs"}
