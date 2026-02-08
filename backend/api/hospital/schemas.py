from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class HospitalInitRequest(BaseModel):
    hospital_id: str
    hospital_name: str

class HospitalInitResponse(BaseModel):
    hospital_id: str
    public_key: str
    created_at: datetime

class IssueCredentialRequest(BaseModel):
    hospital_id: str
    credential_type: str
    attributes: Dict[str, Any]

class IssueCredentialResponse(BaseModel):
    credential_id: str
    signature: str
    issuer_public_key: str
    attributes: Dict[str, Any]
    issued_at: datetime
    qr_code_data: str
