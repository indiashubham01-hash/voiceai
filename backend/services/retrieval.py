"""
Retrieval Service (pgvector Semantic Search Simulator)
Performs cosine similarity search against indexed curriculum resource chunks.
"""

from typing import List, Dict, Any
from ..models.source import Resource, ResourceChunk

class VectorRetrievalService:
    @classmethod
    def search_chunks(
        cls, 
        query: str, 
        resources: List[Resource], 
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        results = []
        query_words = set(query.lower().split())

        for res in resources:
            for chunk in res.extracted_chunks:
                chunk_words = set(chunk.content.lower().split())
                overlap = len(query_words.intersection(chunk_words))
                score = float(min(0.99, 0.65 + (overlap * 0.08)))
                
                results.append({
                    "resource_id": res.id,
                    "resource_title": res.title,
                    "page_number": chunk.page_number,
                    "chunk_text": chunk.content,
                    "similarity_score": round(score, 3),
                    "authority_score": res.authority_score,
                    "version_year": res.version_year
                })

        # Sort by similarity descending
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:top_k]
