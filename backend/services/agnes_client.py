"""
Agnes Client Service
Platform: https://platform.agnes-ai.com
API Base: https://apihub.agnes-ai.com/v1
Text Endpoints: POST /v1/chat/completions, POST /v1/responses, POST /v1/messages
Image Endpoint: POST /v1/images/generations
Video Endpoint: POST /v1/videos (Retrieved at https://apihub.agnes-ai.com/agnesapi using video_id & model_name=agnes-video-2.5)

Free-plan RPM Limits:
- Text: 10 RPM
- Image 1K: 10 RPM
- Image 2K: 5 RPM
- Image 3K/4K: 1 RPM
- Video: 1 RPM

Rules:
1. Keep API keys on the server.
2. Queue requests and use backoff on rate limits.
3. Video is asynchronous, so show task status and retrieve the finished output before reporting success.
4. Label saved outputs used as a demo fallback.
"""

import os
import time
import asyncio
import logging
from typing import Dict, List, Any, Optional
import httpx
from pydantic import BaseModel

logger = logging.getLogger("AgnesClient")

AGNES_BASE_URL = os.getenv("AGNES_BASE_URL", "https://apihub.agnes-ai.com/v1")
AGNES_API_KEY = os.getenv("AGNES_API_KEY", "")

class RateLimitBucket:
    """Token Bucket & Exponential Backoff for Agnes Free Plan RPM limits."""
    def __init__(self, rpm_limit: int = 10, name: str = "text"):
        self.rpm_limit = rpm_limit
        self.name = name
        self.interval = 60.0 / max(1.0, float(rpm_limit))
        self.lock = asyncio.Lock()
        self.last_req_time = 0.0
        self.total_served = 0

    async def execute(self, coro_func):
        async with self.lock:
            retries = 3
            backoff_factor = 2.0
            
            for attempt in range(retries):
                now = time.time()
                elapsed = now - self.last_req_time
                if elapsed < self.interval:
                    wait_time = self.interval - elapsed
                    await asyncio.sleep(wait_time)
                
                try:
                    self.last_req_time = time.time()
                    result = await coro_func()
                    self.total_served += 1
                    return result
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 429 and attempt < retries - 1:
                        sleep_duration = (backoff_factor ** attempt) * 3.0
                        logger.warning(f"Rate limited (429) on {self.name}. Backing off for {sleep_duration}s...")
                        await asyncio.sleep(sleep_duration)
                    else:
                        raise e

text_queue = RateLimitBucket(rpm_limit=10, name="text")
image_queue = RateLimitBucket(rpm_limit=10, name="image")
video_queue = RateLimitBucket(rpm_limit=1, name="video")

token_queue = text_queue  # Backwards compatibility alias

class AgnesService:
    @staticmethod
    def _headers(custom_key: Optional[str] = None) -> Dict[str, str]:
        key = custom_key or AGNES_API_KEY or os.getenv("AGNES_API_KEY", "")
        return {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }

    @classmethod
    async def chat_completion(
        cls,
        messages: List[Dict[str, str]],
        custom_key: Optional[str] = None,
        temperature: float = 0.2,
        tools: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Agnes 3.0 Flash Primary LLM (512K context, tool calling).
        Role: Source comparison, trust ranking, learner-path planning, multilingual content.
        """
        payload: Dict[str, Any] = {
            "model": "agnes-3.0-flash",
            "messages": messages,
            "temperature": temperature
        }
        if tools:
            payload["tools"] = tools

        async def _call():
            key = custom_key or AGNES_API_KEY
            if not key or key == "demo" or key.startswith("test"):
                await asyncio.sleep(0.3)
                return {
                    "model": "agnes-3.0-flash",
                    "demo_fallback": True,
                    "label": "[DEMO FALLBACK - CACHED 512K GROUNDED PLAN]",
                    "choices": [{
                        "message": {
                            "role": "assistant",
                            "content": (
                                "Synthesized 512K grounded curriculum plan using NCERT/DSERT 2026 standards. "
                                "Grounded in teacher uploaded materials with DKT & GNN gap diagnostic."
                            )
                        }
                    }]
                }

            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.post(
                        f"{AGNES_BASE_URL}/chat/completions",
                        json=payload,
                        headers=cls._headers(custom_key)
                    )
                    if res.status_code == 200:
                        data = res.json()
                        data["demo_fallback"] = False
                        return data
            except Exception as e:
                pass

            return {
                "model": "agnes-3.0-flash",
                "demo_fallback": True,
                "label": "[DEMO FALLBACK - CACHED 512K GROUNDED PLAN]",
                "choices": [{
                    "message": {
                        "role": "assistant",
                        "content": (
                            "Synthesized 512K grounded curriculum plan using NCERT/DSERT 2026 standards. "
                            "Grounded in teacher uploaded materials with DKT & GNN gap diagnostic."
                        )
                    }
                }]
            }

        return await text_queue.execute(_call)

    @classmethod
    async def generate_image(
        cls,
        prompt: str,
        size: str = "1024x1024",
        custom_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Agnes Image 2.5 Flash for visual concept diagrams & multimodal aids.
        Model: agnes-image-2.5flash (or agnes-image-2.5-flash)
        """
        payload = {
            "model": "agnes-image-2.5flash",
            "prompt": f"High contrast educational classroom science diagram: {prompt}",
            "size": size
        }

        async def _call():
            key = custom_key or AGNES_API_KEY
            if not key or key == "demo" or key.startswith("test"):
                return {
                    "demo_fallback": True,
                    "label": "[DEMO FALLBACK - CACHED INFOGRAPHIC]",
                    "url": "/assets/photosynthesis.jpg",
                    "model": "agnes-image-2.5flash"
                }

            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(
                    f"{AGNES_BASE_URL}/images/generations",
                    json=payload,
                    headers=cls._headers(custom_key)
                )
                res.raise_for_status()
                data = res.json()
                img_url = data.get("data", [{}])[0].get("url", "/assets/photosynthesis.jpg")
                return {
                    "demo_fallback": False,
                    "url": img_url,
                    "model": "agnes-image-2.5flash"
                }

        return await image_queue.execute(_call)

    @classmethod
    async def create_video_task(
        cls,
        prompt: str,
        custom_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Agnes Video 2.5 asynchronous generation (1 RPM).
        """
        payload = {
            "model": "agnes-video-2.5",
            "prompt": prompt
        }

        async def _call():
            key = custom_key or AGNES_API_KEY
            if not key or key == "demo" or key.startswith("test"):
                return {
                    "demo_fallback": True,
                    "label": "[DEMO FALLBACK - CACHED ANIMATION]",
                    "video_id": "demo_video_stomata_4k",
                    "status": "completed",
                    "video_url": "https://assets.mixkit.co/videos/preview/mixkit-plant-leaves-in-a-greenhouse-42352-large.mp4"
                }

            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(
                    f"{AGNES_BASE_URL}/videos",
                    json=payload,
                    headers=cls._headers(custom_key)
                )
                res.raise_for_status()
                return res.json()

        return await video_queue.execute(_call)

    @classmethod
    async def poll_video_status(
        cls,
        video_id: str,
        custom_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Poll video task status at https://apihub.agnes-ai.com/agnesapi using video_id and model_name=agnes-video-2.5
        """
        if video_id.startswith("demo"):
            return {
                "demo_fallback": True,
                "label": "[DEMO FALLBACK - CACHED ANIMATION]",
                "video_id": video_id,
                "status": "completed",
                "video_url": "https://assets.mixkit.co/videos/preview/mixkit-plant-leaves-in-a-greenhouse-42352-large.mp4"
            }

        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.get(
                "https://apihub.agnes-ai.com/agnesapi",
                params={"video_id": video_id, "model_name": "agnes-video-2.5"},
                headers=cls._headers(custom_key)
            )
            res.raise_for_status()
            return res.json()
