"""
Issuer API Routes
POST /api/issuer/issue  — issue a new credential and persist it
GET  /api/issuer/issued — return all issued credentials (newest first)
GET  /api/issuer/issued/{credential_id} — return one credential
DELETE /api/issuer/issued/{credential_id} — revoke a credential
GET  /api/issuer/stats  — aggregate stats for the dashboard
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
import uuid
import hashlib
import json
import logging

logger = logging.getLogger("issuer")
router = APIRouter()

# ---------------------------------------------------------------------------
# In-memory credential store (persists for the lifetime of the server process)
# Replacing with a database is as simple as swapping this list for ORM calls.
# ---------------------------------------------------------------------------

_credential_store: List[Dict[str, Any]] = []


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class IssueCredentialRequest(BaseModel):
    credential_type: str          # vaccination | prescription | age_verification
    issuer_id:       Optional[str] = "privaseal-hospital-001"
    attributes:      Dict[str, Any] = {}


class RevokeRequest(BaseModel):
    reason: Optional[str] = "Revoked by issuer"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

CREDENTIAL_TYPE_LABELS = {
    "vaccination":       "Vaccination Record",
    "prescription":      "Medical Prescription",
    "age_verification":  "Age Verification ID",
}


def _make_credential(req: IssueCredentialRequest) -> Dict[str, Any]:
    """Build a full credential record from an issue request."""
    cred_id   = str(uuid.uuid4())
    attrs     = req.attributes
    now       = datetime.now(timezone.utc).isoformat()

    # Privacy-preserving hash (no PII in the log — only the hash)
    attr_hash = hashlib.sha256(
        json.dumps(attrs, sort_keys=True).encode()
    ).hexdigest()[:16]

    # Derive display-friendly fields from attrs with sensible fallbacks
    name = (
        attrs.get("patient_name")
        or attrs.get("full_name")
        or attrs.get("name")
        or "—"
    )
    dob = (
        attrs.get("date_of_birth")
        or attrs.get("dob")
        or "—"
    )

    return {
        "id":              cred_id,
        "type":            req.credential_type,
        "typeLabel":       CREDENTIAL_TYPE_LABELS.get(req.credential_type, req.credential_type),
        "issuerId":        req.issuer_id,
        # Display fields (derived from attributes)
        "name":            name,
        "dob":             dob,
        "aadhaar":         attrs.get("aadhaar_number", "—"),
        "state":           attrs.get("state", "—"),
        "gender":          attrs.get("gender", "—"),
        # Vaccination-specific
        "vaccineType":     attrs.get("vaccine_type", "—"),
        "manufacturer":    attrs.get("manufacturer", "—"),
        "dateAdministered":attrs.get("date_administered", "—"),
        "doseNumber":      attrs.get("dose_number", "—"),
        # Prescription-specific
        "medication":      attrs.get("medication", "—"),
        "dosageInstructions": attrs.get("dosage_instructions", "—"),
        "prescribedBy":    attrs.get("prescribing_doctor", "—"),
        # Metadata
        "issuedAt":        now,
        "status":          "Active",
        "attrHash":        attr_hash,
        "attributeCount":  len(attrs),
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/")
async def get_issuer_status():
    return {
        "status":  "active",
        "type":    "issuer",
        "issued":  len(_credential_store),
    }


@router.post("/init")
async def init_issuer():
    return {"message": "Issuer Initialized", "public_key": f"pk_{uuid.uuid4()}"}


@router.post("/issue")
async def issue_credential(req: IssueCredentialRequest):
    """
    Issue a new credential and save it to the in-memory store.
    Always returns HTTP 200 with the created credential.
    """
    try:
        cred = _make_credential(req)
        _credential_store.append(cred)          # ← push, never overwrite
        logger.info(f"Credential issued: {cred['id']} type={cred['type']}")
        return JSONResponse(content={
            "success":    True,
            "credential": cred,
            "message":    f"{cred['typeLabel']} issued successfully.",
        })
    except Exception as exc:
        logger.error(f"Issue failed: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/issued")
async def get_issued_credentials(
    page:     int = 1,
    per_page: int = 20,
    search:   Optional[str] = None,
    type_filter: Optional[str] = None,
):
    """
    Return all issued credentials, newest first.
    Supports optional search (by name) and type filter.
    """
    results = list(reversed(_credential_store))

    # Filter by type
    if type_filter and type_filter != "all":
        results = [c for c in results if c["type"] == type_filter]

    # Search by name (case-insensitive)
    if search:
        q = search.lower()
        results = [
            c for c in results
            if q in c.get("name", "").lower()
            or q in c.get("id", "").lower()
        ]

    total = len(results)
    # Paginate
    start = (page - 1) * per_page
    page_data = results[start: start + per_page]

    return JSONResponse(content={
        "data":       page_data,
        "total":      total,
        "page":       page,
        "per_page":   per_page,
        "total_pages": max(1, -(-total // per_page)),  # ceiling division
    })


@router.get("/issued/{credential_id}")
async def get_single_credential(credential_id: str):
    """Fetch a single credential by its UUID."""
    for cred in _credential_store:
        if cred["id"] == credential_id:
            return JSONResponse(content={"credential": cred})
    raise HTTPException(status_code=404, detail="Credential not found")


@router.delete("/issued/{credential_id}")
async def revoke_credential(credential_id: str, body: RevokeRequest = RevokeRequest()):
    """Revoke (soft-delete) a credential by setting its status to Revoked."""
    for cred in _credential_store:
        if cred["id"] == credential_id:
            if cred["status"] == "Revoked":
                raise HTTPException(status_code=409, detail="Already revoked")
            cred["status"] = "Revoked"
            cred["revokedAt"] = datetime.now(timezone.utc).isoformat()
            cred["revokeReason"] = body.reason
            logger.info(f"Credential revoked: {credential_id}")
            return JSONResponse(content={"success": True, "credential": cred})
    raise HTTPException(status_code=404, detail="Credential not found")


@router.get("/stats")
async def get_issuer_stats():
    """Aggregate stats for the dashboard cards."""
    total  = len(_credential_store)
    active = sum(1 for c in _credential_store if c["status"] == "Active")
    types  = len({c["type"] for c in _credential_store})
    return JSONResponse(content={
        "totalIssued":       total,
        "activeCredentials": active,
        "activePercent":     round((active / total * 100) if total else 0, 1),
        "typesSupported":    max(types, 3),
    })
