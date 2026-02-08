from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine, Base
from issuer.api import router as issuer_router
from verifier.api import router as verifier_router

app = FastAPI(title="ZKP Credential System", version="1.0.0")

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

app.include_router(issuer_router, prefix="/api/issuer", tags=["Issuer"])
app.include_router(verifier_router, prefix="/api/verify", tags=["Verifier"])

@app.get("/")
def home():
    return {"message": "ZKP System Online", "docs": "/docs"}
