"""
Benchmark API Controller
Handles HTTP request/response for /api/benchmarks.
Separated from the service layer for clean architecture.
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from benchmarks.benchmark_service import engine as benchmark_engine

router = APIRouter()


@router.get(
    "",
    summary="Real-time ZK-Proof Benchmark Metrics",
    description=(
        "Returns live ZK-proof performance metrics including proof generation time, "
        "verification time, proof size, privacy score, entropy score, throughput history, "
        "p95 and average latency, and the last 50 benchmark run logs."
    ),
    tags=["Benchmarks"],
)
async def get_benchmarks():
    """
    GET /api/benchmarks

    Returns a JSON snapshot of the most recent ZK-proof performance metrics
    calculated under simulated concurrent load.
    """
    snapshot = await benchmark_engine.get_snapshot()
    return JSONResponse(content={
        "proofGenTime":      snapshot.proofGenTime,
        "verificationTime":  snapshot.verificationTime,
        "proofSize":         snapshot.proofSize,
        "privacyScore":      snapshot.privacyScore,
        "entropyScore":      snapshot.entropyScore,
        "throughput":        snapshot.throughput,
        "p95LatencyMs":      snapshot.p95LatencyMs,
        "avgLatencyMs":      snapshot.avgLatencyMs,
        "concurrentUsers":   snapshot.concurrentUsers,
        "history":           snapshot.history,
    })
