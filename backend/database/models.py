from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
# Need to use standard sqlalchemy types for sqlite if not using PG
# Using string for UUID in SQLite
from .db import Base

class IssuerKey(Base):
    __tablename__ = "issuer_keys"
    
    # Use string for UUID if SQLite
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    issuer_name = Column(String, nullable=False)
    public_key = Column(Text, nullable=False)
    private_key_encrypted = Column(Text, nullable=False)  # Using Text instead of BYTEA for simplicity in SQLite 
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class IssuedCredential(Base):
    __tablename__ = "issued_credentials"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    issuer_id = Column(String, ForeignKey("issuer_keys.id"))
    credential_hash = Column(String(64), nullable=False)
    attributes_count = Column(Integer)
    issued_at = Column(DateTime(timezone=True), server_default=func.now())

class VerificationRequest(Base):
    __tablename__ = "verification_requests"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    verifier_id = Column(String, nullable=False)
    predicate = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # expires_at removed for brevity or can add later

class VerificationResult(Base):
    __tablename__ = "verification_results"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    request_id = Column(String, ForeignKey("verification_requests.id"))
    verified = Column(Boolean, nullable=False)
    proof_hash = Column(String(64))
    verified_at = Column(DateTime(timezone=True), server_default=func.now())

class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    operation_type = Column(String(50))  # 'issue', 'prove', 'verify'
    duration_ms = Column(Integer)
    proof_size_bytes = Column(Integer)
    attribute_count = Column(Integer)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
