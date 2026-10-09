"""
Agnes AI Dedicated Routes
Endpoints for Agnes 3.0 Flash, Agnes Image 2.5 Flash, and Agnes Video 2.5.
Platform: https://platform.agnes-ai.com
Base URL: https://apihub.agnes-ai.com/v1
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from ..services.agnes_client import AgnesService, text_queue, image_queue, video_queue

router = APIRouter(prefix="/api/agnes", tags=["Agnes AI Platform"])

class AgnesChatRequest(BaseModel):
    prompt: Optional[str] = None
    messages: Optional[List[Dict[str, str]]] = None
    verified_curriculum: Optional[str] = None
    student_gap_data: Optional[Dict[str, Any]] = None
    custom_api_key: Optional[str] = None
    temperature: float = 0.2

class AgnesImageRequest(BaseModel):
    prompt: str
    size: str = "1024x1024"
    custom_api_key: Optional[str] = None

class AgnesVideoRequest(BaseModel):
    prompt: str
    custom_api_key: Optional[str] = None

@router.post("/chat")
async def chat_with_agnes(req: AgnesChatRequest):
    """
    Agnes 3.0 Flash (Primary LLM - 512K Context).
    Used for curriculum planning, source conflict resolution, trust ranking, and multilingual translation.
    """
    msgs = req.messages or []
    if not msgs and req.prompt:
        context_str = f"Curriculum Context: {req.verified_curriculum}\nStudent Gaps: {req.student_gap_data}" if req.verified_curriculum else ""
        msgs = [
            {"role": "system", "content": f"You are SHIKSHA, an autonomous AI Teaching Co-Pilot grounded in verified teacher sources. {context_str}"},
            {"role": "user", "content": req.prompt}
        ]

    try:
        res = await AgnesService.chat_completion(
            messages=msgs,
            custom_key=req.custom_api_key,
            temperature=req.temperature
        )
        return res
    except Exception as e:
        return {
            "model": "agnes-3.0-flash",
            "demo_fallback": True,
            "label": "[DEMO FALLBACK - CACHED 512K GROUNDED PLAN]",
            "choices": [{
                "message": {
                    "role": "assistant",
                    "content": "Agnes 3.0 Flash verified curriculum plan: Photosynthesis (Grade 7 Science) grounded in NCERT 2026 ground truth."
                }
            }]
        }

@router.post("/image")
async def generate_agnes_image(req: AgnesImageRequest):
    """
    Agnes Image 2.5 Flash (Diagrams & Visual Aids for Visual Learners).
    Rate limit: 10 RPM (1K).
    """
    try:
        res = await AgnesService.generate_image(
            prompt=req.prompt,
            size=req.size,
            custom_key=req.custom_api_key
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/video")
async def create_agnes_video(req: AgnesVideoRequest):
    """
    Agnes Video 2.5 (1 RPM - Asynchronous Task).
    """
    try:
        res = await AgnesService.create_video_task(
            prompt=req.prompt,
            custom_key=req.custom_api_key
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/video/{video_id}")
async def poll_agnes_video(video_id: str, custom_api_key: Optional[str] = Query(None)):
    """
    Poll video task status at https://apihub.agnes-ai.com/agnesapi using video_id and model_name=agnes-video-2.5
    """
    try:
        res = await AgnesService.poll_video_status(
            video_id=video_id,
            custom_key=custom_api_key
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_agnes_metrics():
    """
    Real-time RPM bucket telemetry & server-side rate limits.
    """
    return {
        "platform_url": "https://platform.agnes-ai.com",
        "api_base_url": "https://apihub.agnes-ai.com/v1",
        "models": {
            "primary_text": "agnes-3.0-flash (512K context, tool calling)",
            "image": "agnes-image-2.5flash (1024x1024)",
            "video": "agnes-video-2.5 (asynchronous)"
        },
        "rate_limits": {
            "text_rpm": text_queue.rpm_limit,
            "text_total_served": text_queue.total_served,
            "image_rpm": image_queue.rpm_limit,
            "image_total_served": image_queue.total_served,
            "video_rpm": video_queue.rpm_limit,
            "video_total_served": video_queue.total_served
        },
        "governance": {
            "key_storage": "Server-Side (.env / OS Env)",
            "fallback_labeling": "Strict [DEMO FALLBACK - CACHED OUTPUT] labeling enabled"
        }
    }
