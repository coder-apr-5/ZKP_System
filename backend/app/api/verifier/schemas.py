from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, List, Optional
from datetime import datetime

class Predicate(BaseModel):
    type: str  # "COMPARISON", "AND", etc.
    attribute: Optional[str] = None
    operator: Optional[str] = None
    value: Optional[str] = None
    predicates: Optional[List['Predicate']] = None

class VerifierRequestCreate(BaseModel):
    verifier_id: str
    verifier_name: str
    verifier_type: str  # pharmacy, ecommerce, insurance
    predicate: Predicate
    required_credential_type: str

class VerifierRequestResponse(BaseModel):
    request_id: str
    verifier_id: str
    predicate: Predicate
    predicate_human_readable: str
    qr_code_data: str
    qr_code_image: Optional[str] = None
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
    verification_id: Optional[str] = None
    timestamp: datetime
    verifier_id: Optional[str] = None
    error: Optional[str] = None
    message: Optional[str] = None
