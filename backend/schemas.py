from pydantic import BaseModel
from typing import Dict, List, Any, Optional

class CredentialRequest(BaseModel):
    attributes: Dict[str, str]

class SignedCredential(BaseModel):
    attributes: Dict[str, str]
    signature: str
    issuer_public_key: str

class ProofRequest(BaseModel):
    verifier_id: str
    predicate: str  # e.g., "age > 18"
    nonce: str

class ProofSubmission(BaseModel):
    proof: Dict[str, Any]
    verifier_id: str
    nonce: str

class VerificationResult(BaseModel):
    verified: bool
    revealed_attributes: Dict[str, str]
