"""
Bhashini Indic AI REST API Routes
Provides endpoints for Automatic Speech Recognition (ASR), Text-to-Speech (TTS), and Neural Machine Translation (NMT).
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..services.bhashini_service import BhashiniService

router = APIRouter(prefix="/api/bhashini", tags=["Bhashini Indic AI"])

class ASRRequest(BaseModel):
    audio_base64: str
    language: str = "en"
    audio_format: str = "wav"
    user_id: Optional[str] = None
    api_key: Optional[str] = None
    pipeline_id: Optional[str] = None

class TTSRequest(BaseModel):
    text: str
    language: str = "en"
    gender: str = "female"
    api_key: Optional[str] = None

class TranslationRequest(BaseModel):
    text: str
    source_language: str = "en"
    target_language: str = "hi"

class ConfigUpdateRequest(BaseModel):
    user_id: Optional[str] = None
    api_key: Optional[str] = None
    pipeline_id: Optional[str] = None
    inference_url: Optional[str] = None

@router.get("/status")
def get_bhashini_status():
    """
    Returns the operational status and supported Indic models for Bhashini.
    """
    return {
        "status": "OPERATIONAL",
        "service": "Digital India Bhashini (NLTM)",
        "supported_languages": [
            {"code": "en", "name": "Indian English", "script": "Latin"},
            {"code": "hi", "name": "Hindi (हिंदी)", "script": "Devanagari"},
            {"code": "kn", "name": "Kannada (ಕನ್ನಡ)", "script": "Kannada"},
            {"code": "ta", "name": "Tamil (தமிழ்)", "script": "Tamil"},
            {"code": "te", "name": "Telugu (తెలుగు)", "script": "Telugu"},
            {"code": "mr", "name": "Marathi (मराठी)", "script": "Devanagari"},
            {"code": "bn", "name": "Bengali (বাংলা)", "script": "Bengali"}
        ],
        "pipelines": {
            "asr": "AI4Bharat / Bhashini Conformer-Indic & Whisper-Indic",
            "tts": "AI4Bharat IndicTTS (FastSpeech2 + HiFi-GAN)",
            "nmt": "IndicTrans2 (12-Language Transformer NMT)"
        },
        "audio_specs": {
            "sample_rate": 16000,
            "channels": 1,
            "encoding": "PCM 16-bit WAV / Base64"
        }
    }

@router.post("/asr")
async def process_asr(req: ASRRequest):
    """
    Transcribes audio into text using Bhashini Indic ASR.
    """
    if not req.audio_base64:
        raise HTTPException(status_code=400, detail="Missing audio_base64 in request body")
    
    result = await BhashiniService.transcribe_audio(
        audio_base64=req.audio_base64,
        language=req.language,
        audio_format=req.audio_format,
        api_key=req.api_key,
        user_id=req.user_id,
        pipeline_id=req.pipeline_id
    )
    return result

@router.post("/tts")
async def process_tts(req: TTSRequest):
    """
    Synthesizes speech audio from text using Bhashini IndicTTS.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Empty text supplied for TTS")

    result = await BhashiniService.synthesize_speech(
        text=req.text,
        language=req.language,
        gender=req.gender,
        api_key=req.api_key
    )
    return result

@router.post("/translate")
async def process_translation(req: TranslationRequest):
    """
    Translates text between Indian languages and English.
    """
    result = await BhashiniService.translate_text(
        text=req.text,
        source_language=req.source_language,
        target_language=req.target_language
    )
    return result
