from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine, Base
from api.hospital.routes import router as hospital_router
from api.provider.routes import router as provider_router
from api.benchmarks.routes import router as benchmarks_router
from benchmarks.benchmark_service import engine as benchmark_engine

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
    # Start the background benchmark simulation engine
    benchmark_engine.start()

@app.on_event("shutdown")
async def shutdown_benchmark_engine():
    await benchmark_engine.stop()

# MediGuard API Routes
app.include_router(hospital_router, prefix="/api/hospital", tags=["Hospital (Issuer)"])
app.include_router(provider_router, prefix="/api/provider", tags=["Provider (Verifier)"])
app.include_router(benchmarks_router, prefix="/api/benchmarks", tags=["Benchmarks"])

@app.get("/")
def home():
    return {"message": "ZKP System Online", "docs": "/docs"}
