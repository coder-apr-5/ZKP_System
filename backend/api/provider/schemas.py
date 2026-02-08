from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime

class ProviderRequest(BaseModel):
    provider_id: str
    provider_name: str
    provider_type: str # pharmacy, insurance
    predicate: Dict[str, Any]

class ProviderRequestResponse(BaseModel):
    request_id: str
    provider_id: str
    predicate_human_readable: str
    qr_code_data: str
    created_at: datetime
    expires_at: datetime 

class VerifyProofRequest(BaseModel):
    request_id: str
    proof: str
    revealed_attributes: Dict[str, Any]
    issuer_public_key: str 

class VerifyProofResponse(BaseModel):
    verified: bool
    request_id: str
    verification_id: str
    provider_id: str
    timestamp: datetime         
