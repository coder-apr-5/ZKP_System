from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from database.db import get_db
from database.models import IssuerKey, IssuedCredential
from app_schemas.common import InitIssuerRequest, InitIssuerResponse, IssueRequest, IssueResponse, CredentialField
import uuid
from hashlib import sha256
import json
from crypto.bbs_mock import BbsMock

router = APIRouter()

@router.post("/init", response_model=InitIssuerResponse)
async def init_issuer(req: InitIssuerRequest, db: AsyncSession = Depends(get_db)):
    """
    Initialize a new issuer with a fresh key pair.
    
    Args:
        req (InitIssuerRequest): The initialization request containing issuer name.
        db (AsyncSession): Database session.
        
    Returns:
        InitIssuerResponse: The public key and ID of the new issuer.
    """
    pk, sk = BbsMock.generate_keys()
    
    issuer = IssuerKey(
        id=str(uuid.uuid4()),
        issuer_name=req.issuerName,
        public_key=pk,
        private_key_encrypted=sk
    )
    db.add(issuer)
    await db.commit()
    await db.refresh(issuer)
    
    return InitIssuerResponse(publicKey=issuer.public_key, issuerId=issuer.id)

@router.post("/issue", response_model=IssueResponse)
async def issue_credential(req: IssueRequest, db: AsyncSession = Depends(get_db)):
    """
    Issue a verifiable credential containing the provided attributes.
    Signs the attributes using the latest issuer's private key.
    
    Args:
        req (IssueRequest): The attributes to sign.
        db (AsyncSession): Database session.
        
    Returns:
        IssueResponse: The credential containing the signature and attributes.
    """
    result = await db.execute(select(IssuerKey).order_by(IssuerKey.created_at.desc()))
    issuer = result.scalars().first()
    
    if not issuer:
        pk, sk = BbsMock.generate_keys()
        issuer = IssuerKey(
            id=str(uuid.uuid4()),
            issuer_name="Auto Issuer",
            public_key=pk,
            private_key_encrypted=sk
        )
        db.add(issuer)
        await db.commit()
    
    signature = BbsMock.sign(req.attributes, issuer.private_key_encrypted)
    
    cred_hash = sha256(json.dumps(req.attributes, sort_keys=True).encode()).hexdigest()
    issued_cred = IssuedCredential(
        id=str(uuid.uuid4()),
        issuer_id=issuer.id,
        credential_hash=cred_hash,
        attributes_count=len(req.attributes)
    )
    db.add(issued_cred)
    await db.commit()
    
    return IssueResponse(
        credential=CredentialField(
            signature=signature,
            attributes=req.attributes,
            issuerPublicKey=issuer.public_key
        )
    )

@router.get("/public-key")
async def get_public_key(db: AsyncSession = Depends(get_db)):
    """
    Retrieve the current active issuer's public key.
    
    Returns:
        dict: The public key.
    """
    result = await db.execute(select(IssuerKey).order_by(IssuerKey.created_at.desc()))
    issuer = result.scalars().first()
    if not issuer:
        return {"error": "No issuer initialized"}
    return {"publicKey": issuer.public_key}

@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    """
    Get issuance statistics.
    
    Returns:
        dict: Total issued credentials and active count.
    """
    total_issued = await db.execute(select(func.count(IssuedCredential.id)))
    count = total_issued.scalar()
    # Active would require revocation logic, for now assume all active
    return { 
        "totalIssued": count or 0,
        "activeCredentials": count or 0
    }
