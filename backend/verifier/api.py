from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from database.models import VerificationRequest, VerificationResult
from app_schemas.common import (
    VerifyRequest, VerifyRequestResponse, 
    SubmitProofRequest, SubmitProofResponse,
    VerificationStatusResponse, AuditLogResponse, AuditLogEntry
)
import uuid
from crypto.bbs_mock import BbsMock

router = APIRouter()

@router.post("/request", response_model=VerifyRequestResponse)
async def create_verification_request(req: VerifyRequest, db: AsyncSession = Depends(get_db)):
    """
    Create a new verification request with a specific predicate.
    
    Args:
        req (VerifyRequest): Request details including verifier ID and predicate.
        db (AsyncSession): Database session.
    
    Returns:
        VerifyRequestResponse: The request ID and QR code data.
    """
    # Basic validation
    if not req.predicate:
         raise HTTPException(status_code=400, detail="Predicate cannot be empty")
         
    # Optional: If predicate is JSON, validate structure
    if req.predicate.strip().startswith("{"):
        import json
        from crypto.predicate_eval import PredicateEvaluator
        try:
            pred_obj = json.loads(req.predicate)
            PredicateEvaluator.validate(pred_obj)
        except Exception as e:
            # For now, log warning but don't hard fail if we want to support legacy string predicates
            # or fail if we want strict mode. 
            pass 

    request = VerificationRequest(
        id=str(uuid.uuid4()),
        verifier_id=req.verifierId,
        predicate=req.predicate
    )
    db.add(request)
    await db.commit()
    
    qr_data = f"verifier:{request.id}?predicate={req.predicate}"
    
    return VerifyRequestResponse(
        requestId=request.id,
        qrCode=qr_data,
        predicate=request.predicate
    )

@router.post("/submit", response_model=SubmitProofResponse)
async def submit_proof(req: SubmitProofRequest, db: AsyncSession = Depends(get_db)):
    """
    Submit a zero-knowledge proof for verification.
    
    Args:
        req (SubmitProofRequest): The proof, revealed attributes, and context.
        db (AsyncSession): Database session.
        
    Returns:
        SubmitProofResponse: Whether the proof was valid and the verification ID.
        
    Raises:
        HTTPException: If the request ID is invalid.
    """
    # Check if request exists
    request_res = await db.execute(select(VerificationRequest).where(VerificationRequest.id == req.requestId))
    request = request_res.scalars().first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request ID not found")
        
    verified = BbsMock.verify_proof(req.proof, req.issuerPublicKey, req.revealed)
    
    result = VerificationResult(
        id=str(uuid.uuid4()),
        request_id=req.requestId,
        verified=verified,
        proof_hash=str(hash(req.proof))
    )
    db.add(result)
    await db.commit()
    await db.refresh(result)
    
    return SubmitProofResponse(
        verified=verified,
        timestamp=str(result.verified_at),
        verificationId=result.id
    )

@router.get("/result/{request_id}", response_model=VerificationStatusResponse)
async def get_verification_result(request_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get the status of a specific verification request.
    
    Args:
        request_id (str): The ID of the verification request.
        db (AsyncSession): Database session.
        
    Returns:
        VerificationStatusResponse: The status and result of the verification.
        
    Raises:
        HTTPException: If the result is not found.
    """
    # Join Request and Result
    query = select(VerificationResult, VerificationRequest.predicate).join(
        VerificationRequest, VerificationResult.request_id == VerificationRequest.id
    ).where(VerificationResult.request_id == request_id)
    
    res = await db.execute(query)
    row = res.first()
    
    if not row:
         raise HTTPException(status_code=404, detail="Result not found")
         
    verification_result, predicate = row
    
    return VerificationStatusResponse(
        verified=verification_result.verified,
        predicate=predicate,
        timestamp=str(verification_result.verified_at)
    )

@router.get("/audit-log", response_model=AuditLogResponse)
async def get_audit_log(db: AsyncSession = Depends(get_db)):
    """
    Retrieve the audit log of recent verifications.
    
    Args:
        db (AsyncSession): Database session.
        
    Returns:
        AuditLogResponse: List of recent verification results.
    """
    query = select(VerificationResult, VerificationRequest.predicate).join(
        VerificationRequest, VerificationResult.request_id == VerificationRequest.id
    ).order_by(VerificationResult.verified_at.desc()).limit(50)
    
    res = await db.execute(query)
    rows = res.all()
    
    return AuditLogResponse(
        verifications=[
            AuditLogEntry(
                id=row[0].id,
                predicate=row[1],
                verified=row[0].verified,
                timestamp=str(row[0].verified_at)
            ) for row in rows
        ]
    )
