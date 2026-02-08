from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
# Need to use standard sqlalchemy types for sqlite if not using PG
# Using string for UUID in SQLite
from .db import Base

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.sql import func
import uuid
from .db import Base

class Hospital(Base):
    __tablename__ = "hospitals"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    hospital_id = Column(String, unique=True, nullable=False)
    hospital_name = Column(String, nullable=False)
    public_key = Column(Text, nullable=False)
    private_key_encrypted = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class IssuedCredential(Base):
    __tablename__ = "issued_credentials"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    credential_id = Column(String, unique=True, nullable=False)
    hospital_id = Column(String, ForeignKey("hospitals.id"))
    credential_type = Column(String(50), nullable=False) # 'vaccination', 'prescription', 'blood_type'
    credential_hash = Column(String(64), nullable=False)
    attributes_count = Column(Integer)
    issued_at = Column(DateTime(timezone=True), server_default=func.now())

class VerificationRequest(Base):
    __tablename__ = "verification_requests"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    request_id = Column(String, unique=True, nullable=False)
    provider_id = Column(String, nullable=False)
    provider_name = Column(String, nullable=False)
    provider_type = Column(String(50)) # 'pharmacy', 'insurance', 'lab'
    predicate = Column(JSON, nullable=False) # Store complex predicate as JSON
    predicate_human_readable = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))

class VerificationResult(Base):
    __tablename__ = "verification_results"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    verification_id = Column(String, unique=True, nullable=False)
    request_id = Column(String, ForeignKey("verification_requests.id"))
    provider_id = Column(String, nullable=False)
    verified = Column(Boolean, nullable=False)
    error_code = Column(String(50))
    proof_hash = Column(String(64))
    verified_at = Column(DateTime(timezone=True), server_default=func.now())

class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    operation_type = Column(String(50))  # 'issue', 'prove', 'verify'
    duration_ms = Column(Integer)
    proof_size_bytes = Column(Integer)
    attribute_count = Column(Integer)
    predicate_complexity = Column(Integer)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
