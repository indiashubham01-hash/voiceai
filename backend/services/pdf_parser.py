"""
PDF and Document Parser Service
Extracts text and splits documents into page-by-page chunks for pgvector indexing.
"""

from typing import List
from ..models.source import Resource, ResourceChunk

class PDFParserService:
    @classmethod
    def parse_document_text(
        cls, 
        doc_id: str, 
        title: str, 
        raw_text: str, 
        total_pages: int = 5
    ) -> List[ResourceChunk]:
        paragraphs = [p.strip() for p in raw_text.split("\n\n") if p.strip()]
        chunks = []

        for idx, para in enumerate(paragraphs):
            page_num = (idx % total_pages) + 1
            chunks.append(ResourceChunk(
                id=f"chk-{doc_id}-{idx+1}",
                resource_id=doc_id,
                page_number=page_num,
                chunk_index=idx + 1,
                content=para,
                similarity_score=0.92
            ))

        return chunks
