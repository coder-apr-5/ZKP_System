from pydantic import BaseModel
from typing import Dict, Any, List

class InitIssuerRequest(BaseModel):
    issuerName: str

class InitIssuerResponse(BaseModel):
    publicKey: str
    issuerId: str

class IssueRequest(BaseModel):
    attributes: Dict[str, str]

class CredentialField(BaseModel):
    signature: str
    attributes: Dict[str, str]
    issuerPublicKey: str

class IssueResponse(BaseModel):
    credential: CredentialField
    
class VerifyRequest(BaseModel):
    predicate: str
    verifierId: str

class VerifyRequestResponse(BaseModel):
    requestId: str
    qrCode: str
    predicate: str

class SubmitProofRequest(BaseModel):
    requestId: str
    proof: str
    revealed: Dict[str, Any]
    issuerPublicKey: str

class SubmitProofResponse(BaseModel):
    verified: bool
    timestamp: str
    verificationId: str

class VerificationStatusResponse(BaseModel):
    verified: bool
    predicate: str
    timestamp: str

class AuditLogEntry(BaseModel):
    id: str
    predicate: str
    verified: bool
    timestamp: str

class AuditLogResponse(BaseModel):
    verifications: List[AuditLogEntry]
