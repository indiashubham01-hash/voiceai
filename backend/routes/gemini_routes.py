"""
Google Gemini AI Routes
POST /api/gemini/chat
POST /api/gemini/lesson-scaffold
GET  /api/gemini/status
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter
from pydantic import BaseModel

from ..services.gemini_service import GeminiService, GEMINI_MODEL, GEMINI_API_KEY

router = APIRouter(prefix="/api/gemini", tags=["Google Gemini AI"])

class GeminiChatRequest(BaseModel):
    prompt: str
    domain: str = "Science / Engineering"
    language: str = "English"
    custom_api_key: Optional[str] = None

@router.get("/status")
def gemini_status():
    return {
        "status": "OPERATIONAL",
        "provider": "Google AI Studio",
        "project": "projects/899658269222",
        "model": GEMINI_MODEL,
        "api_key_configured": bool(GEMINI_API_KEY),
        "capabilities": [
            "Multimodal Scientific Reasoning",
            "Explainable AI Feature Attributions",
            "Multi-Tier Curriculum Scaffolding",
            "Universal Engineering Socratic QA"
        ]
    }

@router.post("/chat")
async def chat_gemini(req: GeminiChatRequest):
    result = await GeminiService.generate_socratic_response(
        prompt=req.prompt,
        domain=req.domain,
        language=req.language,
        custom_key=req.custom_api_key
    )
    return result
