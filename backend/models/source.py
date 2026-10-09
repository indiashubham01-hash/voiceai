from typing import List, Optional
from pydantic import BaseModel, Field

class ResourceChunk(BaseModel):
    id: str
    resource_id: str
    page_number: int
    chunk_index: int
    content: str
    embedding_dim: int = 1536
    similarity_score: Optional[float] = None

class Resource(BaseModel):
    id: str
    title: str
    filename: str
    file_type: str = "pdf"  # "pdf", "docx", "slides", "notes"
    version_year: int
    storage_url: str
    total_pages: int
    authority_score: float  # 0.0 - 1.0 (e.g., NCERT = 0.98, Personal Note = 0.42)
    upload_timestamp: str
    extracted_chunks: List[ResourceChunk] = Field(default_factory=list)

class SourceTrustReport(BaseModel):
    source_id: str
    title: str
    version_year: int
    recency_score: float      # 0.0 - 1.0
    authority_score: float    # 0.0 - 1.0
    consensus_score: float    # 0.0 - 1.0
    final_trust_score: float  # 0.0 - 100.0 (Formula: 0.4*Recency + 0.4*Authority + 0.2*Consensus)
    nli_p_contradiction: float
    nli_p_entailment: float
    nli_p_neutral: float
    status: str               # "LOCKED_GROUND_TRUTH", "ACTIVE_SUPPORT", "CONFLICT_IGNORED"
    conflict_explanation: Optional[str] = None
    cited_pages: str
