from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from database.database import get_db
from database.models import VerifierAudit
from utils.crypto import BBSPlusCrypto
# Assuming schemas are in the parent directory or accessible via path
from schemas import ProofSubmission, VerificationResult

router = APIRouter()

@router.post("/verify", response_model=VerificationResult)
async def verify_proof(proof_submission: ProofSubmission, db: AsyncSession = Depends(get_db)):
    # In a real implementation, we would fetch the issuer's public key from a trusted registry or the proof itself if it contains a reference
    # For this demo, we assume the proof is self-contained or use a fixed known key (mocked in crypto)
    
    is_valid = BBSPlusCrypto.verify_proof(proof_submission.proof, "mock_public_key", proof_submission.nonce)
    
    # Log the verification attempt
    audit_entry = VerifierAudit(
        verifier_id=proof_submission.verifier_id,
        predicate_hash=str(hash(str(proof_submission.proof))),  # Simple hash for demo
        verification_result="success" if is_valid else "fail"
    )
    db.add(audit_entry)
    await db.commit()
    
    return VerificationResult(
        verified=is_valid,
        revealed_attributes=proof_submission.proof.get("revealed_attributes", {})
    )

@router.get("/audits", response_model=Any)
async def get_audits(db: AsyncSession = Depends(get_db)):
    # This endpoint is for demo purposes to show the verifier logs
    # Implement query logic if needed
    return {"message": "Audit logs not implemented yet"}
