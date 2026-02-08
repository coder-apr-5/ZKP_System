from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from database.models import Hospital, IssuedCredential
from .schemas import HospitalInitRequest, HospitalInitResponse, IssueCredentialRequest, IssueCredentialResponse
from crypto.bbs_mock import BbsMock
import uuid
import json
from hashlib import sha256

router = APIRouter()

@router.post("/init", response_model=HospitalInitResponse)
async def init_hospital(req: HospitalInitRequest, db: AsyncSession = Depends(get_db)):
    """Initialize a new hospital issuer"""
    # Check if exists
    result = await db.execute(select(Hospital).where(Hospital.hospital_id == req.hospital_id))
    existing = result.scalars().first()
    if existing:
        return HospitalInitResponse(
            hospital_id=existing.hospital_id,
            public_key=existing.public_key,
            created_at=existing.created_at
        )
        
    pk, sk = BbsMock.generate_keys()
    
    hospital = Hospital(
        id=str(uuid.uuid4()),
        hospital_id=req.hospital_id,
        hospital_name=req.hospital_name,
        public_key=pk,
        private_key_encrypted=sk
    )
    db.add(hospital)
    await db.commit()
    await db.refresh(hospital)
    
    return HospitalInitResponse(
        hospital_id=hospital.hospital_id,
        public_key=hospital.public_key,
        created_at=hospital.created_at
    )

@router.post("/issue", response_model=IssueCredentialResponse)
async def issue_credential(req: IssueCredentialRequest, db: AsyncSession = Depends(get_db)):
    """Issue a medical credential signed by the hospital"""
    result = await db.execute(select(Hospital).where(Hospital.hospital_id == req.hospital_id))
    hospital = result.scalars().first()
    
    if not hospital:
        # Auto-init for demo if not exists
        pk, sk = BbsMock.generate_keys()
        hospital = Hospital(
            id=str(uuid.uuid4()),
            hospital_id=req.hospital_id,
            hospital_name=req.hospital_id, # Fallback
            public_key=pk,
            private_key_encrypted=sk
        )
        db.add(hospital)
        await db.commit()
        await db.refresh(hospital)

    # Sign attributes
    signature = BbsMock.sign(req.attributes, hospital.private_key_encrypted)
    credential_id = str(uuid.uuid4())
    
    # Audit log (no PII stored, just hash)
    cred_hash = sha256(json.dumps(req.attributes, sort_keys=True).encode()).hexdigest()
    
    issued_cred = IssuedCredential(
        id=str(uuid.uuid4()),
        credential_id=credential_id,
        hospital_id=hospital.id,
        credential_type=req.credential_type,
        credential_hash=cred_hash,
        attributes_count=len(req.attributes)
    )
    db.add(issued_cred)
    await db.commit()
    await db.refresh(issued_cred)
    
    # Generate QR Data
    qr_payload = {
        "id": credential_id,
        "type": req.credential_type,
        "iss": hospital.hospital_id,
        "data": req.attributes,
        "sig": signature,
        "pk": hospital.public_key
    }
    qr_data = f"mediguard://credential?payload={json.dumps(qr_payload)}"
    
    return IssueCredentialResponse(
        credential_id=credential_id,
        signature=signature,
        issuer_public_key=hospital.public_key,
        attributes=req.attributes,
        issued_at=issued_cred.issued_at,
        qr_code_data=qr_data
    )

@router.get("/{hospital_id}/public-key")
async def get_public_key(hospital_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Hospital).where(Hospital.hospital_id == hospital_id))
    hospital = result.scalars().first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
        
    return {
        "hospital_id": hospital.hospital_id,
        "hospital_name": hospital.hospital_name,
        "public_key": hospital.public_key
    }
