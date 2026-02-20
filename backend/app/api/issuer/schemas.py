from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class IssuerInitRequest(BaseModel):
    issuer_id: str
    issuer_name: str
    issuer_type: str  # hospital, government, bank

class IssuerInitResponse(BaseModel):
    issuer_id: str
    issuer_name: str
    issuer_type: str
    public_key: str
    created_at: datetime

class IssueCredentialRequest(BaseModel):
    issuer_id: str
    credential_type: str  # vaccination, prescription, age_verification
    attributes: Dict[str, Any]

class IssueCredentialResponse(BaseModel):
    credential_id: str
    signature: str
    issuer_public_key: str
    attributes: Dict[str, Any]
    credential_type: str
    issued_at: datetime
    qr_code_data: str
    qr_code_image: Optional[str] = None
