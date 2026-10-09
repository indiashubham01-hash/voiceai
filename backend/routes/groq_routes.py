"""
MINDMESH-NEXUS: Groq Cloud AI Routes
Fast Intent Recognition, Class Scheduling, and Whisper Audio Transcription
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from ..services.groq_service import groq_service

router = APIRouter(prefix="/api/groq", tags=["Groq Ultra-Fast AI"])

class ParseIntentRequest(BaseModel):
    utterance: Optional[str] = None
    text: Optional[str] = None
    prompt: Optional[str] = None

class ChatRequest(BaseModel):
    prompt: Optional[str] = None
    text: Optional[str] = None
    system_prompt: Optional[str] = None

class TranscribeRequest(BaseModel):
    audio_base64: str
    language: Optional[str] = "en"

@router.get("/status")
def get_groq_status():
    return {
        "status": "OPERATIONAL",
        "provider": "Groq Cloud LPU",
        "primary_model": groq_service.primary_model,
        "fallback_model": groq_service.fallback_model,
        "whisper_model": groq_service.whisper_primary,
        "role": "Primary Intent Recognition, Dynamic Class Scheduler, and Whisper Audio Engine",
        "latency_target": "< 200 ms"
    }

@router.post("/parse-intent")
def parse_voice_intent(req: ParseIntentRequest):
    utterance_text = (req.utterance or req.text or req.prompt or "").strip()
    if not utterance_text:
        raise HTTPException(status_code=400, detail="Utterance, text, or prompt cannot be empty")
    return groq_service.parse_intent_and_schedule(utterance_text)

@router.post("/transcribe")
async def transcribe_audio(req: TranscribeRequest):
    if not req.audio_base64.strip():
        raise HTTPException(status_code=400, detail="audio_base64 cannot be empty")
    return await groq_service.transcribe_audio_base64(req.audio_base64, req.language)

@router.post("/chat")
def groq_chat(req: ChatRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    response_text = groq_service.chat(req.prompt, req.system_prompt)
    return {
        "provider": "Groq Cloud LPU",
        "model": groq_service.primary_model,
        "response": response_text
    }
