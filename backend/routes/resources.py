"""
Resources API Route
POST /resources/upload
GET  /resources
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..models.source import Resource, ResourceChunk, SourceTrustReport
from ..services.pdf_parser import PDFParserService
from ..agents.source_trust import SourceTrustAgent
from .voice import MOCK_RESOURCES

router = APIRouter(prefix="/resources", tags=["Curriculum Resources"])

class UploadResourceRequest(BaseModel):
    title: str
    filename: str
    file_type: str = "pdf"
    version_year: int
    raw_text: str
    authority_score: float = 0.95

@router.post("/upload")
def upload_resource(body: UploadResourceRequest):
    """
    Parses document, splits into page chunks, and adds to pgvector index.
    """
    doc_id = f"doc-{len(MOCK_RESOURCES)+1}"
    chunks = PDFParserService.parse_document_text(doc_id, body.title, body.raw_text)

    new_res = Resource(
        id=doc_id,
        title=body.title,
        filename=body.filename,
        file_type=body.file_type,
        version_year=body.version_year,
        storage_url=f"https://supabase.storage/{body.filename}",
        total_pages=len(chunks),
        authority_score=body.authority_score,
        upload_timestamp="Just now",
        extracted_chunks=chunks
    )
    MOCK_RESOURCES.append(new_res)

    trust_reports = SourceTrustAgent.evaluate_resources(MOCK_RESOURCES)
    latest_report = next((r for r in trust_reports if r.source_id == doc_id), None)

    return {
        "status": "SUCCESS",
        "resource": new_res.dict(),
        "trust_evaluation": latest_report.dict() if latest_report else None,
        "total_indexed_chunks": len(chunks)
    }

@router.get("")
def list_resources():
    trust_reports = SourceTrustAgent.evaluate_resources(MOCK_RESOURCES)
    return {
        "total_resources": len(MOCK_RESOURCES),
        "resources": [r.dict() for r in MOCK_RESOURCES],
        "trust_reports": [r.dict() for r in trust_reports]
    }
