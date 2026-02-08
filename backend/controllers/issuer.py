from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from database.database import get_db
from database.models import IssuerKey
from utils.crypto import BBSPlusCrypto
from schemas import CredentialRequest, SignedCredential
import json

router = APIRouter()

@router.get("/public-key")
async def get_public_key(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(IssuerKey).limit(1))
    key = result.scalars().first()
    
    if key:
        return {"public_key": key.public_key}
    
    # Generate new key if none exists
    new_keys = BBSPlusCrypto.generate_keys()
    new_issuer_key = IssuerKey(
        private_key=new_keys["private_key"],
        public_key=new_keys["public_key"]
    )
    db.add(new_issuer_key)
    await db.commit()
    await db.refresh(new_issuer_key)
    
    return {"public_key": new_issuer_key.public_key}

@router.post("/issue", response_model=SignedCredential)
async def issue_credential(request: CredentialRequest, db: AsyncSession = Depends(get_db)):
    # Retrieve issuer key
    result = await db.execute(select(IssuerKey).limit(1))
    key = result.scalars().first()
    
    if not key:
        # Auto-generate if missing for convenience
        new_keys = BBSPlusCrypto.generate_keys()
        key = IssuerKey(
            private_key=new_keys["private_key"],
            public_key=new_keys["public_key"]
        )
        db.add(key)
        await db.commit()
        await db.refresh(key)
    
    # Sign logic
    # In a real BBS+ implementation, we would sign the attributes individually
    # For now, we sign the JSON representation or select attributes to sign
    signature = BBSPlusCrypto.sign_crypted(request.attributes, key.private_key)
    
    return SignedCredential(
        attributes=request.attributes,
        signature=signature,
        issuer_public_key=key.public_key
    )
