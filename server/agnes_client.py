"""
Module C: Official Agnes 3.0 Flash & Agnes Image 2.5 Flash Client
Adheres strictly to Agnes AI API specifications:
- Base URL: https://apihub.agnes-ai.com/v1
- Model: agnes-3.0-flash (512K Context, Tool Calling)
- Model: agnes-image-2.5-flash (1024x1024 Visual Generator)
- Rate Limit: 10 RPM In-Memory Token Bucket Queue
"""

import os
import time
import asyncio
from typing import Dict, List, Any, Optional
import httpx
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

AGNES_BASE_URL = os.getenv("AGNES_BASE_URL", "https://apihub.agnes-ai.com/v1")
AGNES_API_KEY = os.getenv("AGNES_API_KEY", "")

class RateLimiterMetrics(BaseModel):
    rpm_limit: int
    current_tokens: int
    last_request_time: float
    total_requests_served: int
    queue_wait_seconds: float

class AgnesRequestQueue:
    """
    In-memory Token Bucket Rate Limiter enforcing 10 RPM (6.0s spacing)
    as required by the Agnes free-plan rate limit rules.
    """
    def __init__(self, rpm_limit: int = 10):
        self.rpm_limit = rpm_limit
        self.interval = 60.0 / float(rpm_limit)  # 6.0 seconds per request
        self.lock = asyncio.Lock()
        self.last_execution_time = 0.0
        self.total_requests = 0

    async def execute(self, coro):
        async with self.lock:
            now = time.time()
            elapsed = now - self.last_execution_time
            if elapsed < self.interval:
                wait_time = self.interval - elapsed
                await asyncio.sleep(wait_time)
            
            result = await coro
            self.last_execution_time = time.time()
            self.total_requests += 1
            return result

    def get_metrics(self) -> RateLimiterMetrics:
        now = time.time()
        elapsed = now - self.last_execution_time
        available_tokens = min(self.rpm_limit, int(elapsed / self.interval) + 1) if self.last_execution_time > 0 else self.rpm_limit
        return RateLimiterMetrics(
            rpm_limit=self.rpm_limit,
            current_tokens=available_tokens,
            last_request_time=self.last_execution_time,
            total_requests_served=self.total_requests,
            queue_wait_seconds=max(0.0, self.interval - elapsed)
        )

# Global Rate Limiters for Text (10 RPM) and Images (10 RPM)
text_rate_limiter = AgnesRequestQueue(rpm_limit=10)
image_rate_limiter = AgnesRequestQueue(rpm_limit=10)

class AgnesClient:
    """
    Client for Agnes 3.0 Flash & Agnes Image 2.5 Flash API
    """
    
    @staticmethod
    def get_headers(custom_key: Optional[str] = None) -> Dict[str, str]:
        key = custom_key or AGNES_API_KEY or os.getenv("AGNES_API_KEY", "")
        return {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }

    @classmethod
    async def call_agnes_agent(
        cls,
        prompt: str,
        verified_curriculum: str,
        student_gap_data: Dict[str, Any],
        custom_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calls agnes-3.0-flash with 512K context and verified knowledge base.
        """
        payload = {
            "model": "agnes-3.0-flash",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are an Autonomous Pedagogical Teaching Agent (MINDMESH-NEXUS). "
                        "Use the provided verified 512K curriculum. Adapt explanation according to the "
                        "student's learning pace and proactively resolve learning gaps flagged by the ML pipeline "
                        "before moving to advanced topics. Provide structured output with timeline, bilingual "
                        "analogies, and formative quiz."
                    )
                },
                {
                    "role": "system",
                    "content": f"Verified Ground Truth Knowledge (NCERT 2026):\n{verified_curriculum}\n\nDeep Knowledge Tracing ML Diagnostics:\n{student_gap_data}"
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.2
        }

        async def _make_request():
            key = custom_key or AGNES_API_KEY
            if not key or key == "demo" or key.startswith("test"):
                # Simulated high-fidelity Agnes 3.0 Flash response when API key is in local demo mode
                await asyncio.sleep(0.4)
                return {
                    "source": "agnes-3.0-flash (Simulated Local Mode)",
                    "model": "agnes-3.0-flash",
                    "context_window": "512K",
                    "content": (
                        "Generated 40-minute differentiated lesson plan for Grade 7 Science (Photosynthesis). "
                        "Grounded strictly in NCERT 2026 Ch 1 (pp. 12-16). Outdated 2021 note was rejected. "
                        "Three students (Aarav, Priya, Rohan) flagged by DKT LSTM model (<0.65 mastery on chemical equations). "
                        "Inserted 'Plant Kitchen' visual analogy and bilingual Hindi glossary."
                    ),
                    "tool_calls": [
                        {"tool": "get_predicted_learning_gap", "student_ids": ["std-1", "std-2", "std-3"], "status": "executed"},
                        {"tool": "request_visual_aid", "concept": "photosynthesis chloroplast stomata", "status": "executed"}
                    ]
                }

            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{AGNES_BASE_URL}/chat/completions",
                    json=payload,
                    headers=cls.get_headers(custom_key)
                )
                resp.raise_for_status()
                data = resp.json()
                return {
                    "source": "agnes-3.0-flash (Live API)",
                    "model": "agnes-3.0-flash",
                    "context_window": "512K",
                    "content": data["choices"][0]["message"]["content"],
                    "usage": data.get("usage", {})
                }

        return await text_rate_limiter.execute(_make_request())

    @classmethod
    async def generate_visual_diagram(
        cls, 
        prompt: str, 
        custom_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calls agnes-image-2.5-flash to generate 1024x1024 scientific infographics.
        """
        payload = {
            "model": "agnes-image-2.5-flash",
            "prompt": f"Clear educational diagram, scientific illustration, high contrast, clean typography: {prompt}",
            "size": "1024x1024"
        }

        async def _make_request():
            key = custom_key or AGNES_API_KEY
            if not key or key == "demo" or key.startswith("test"):
                await asyncio.sleep(0.3)
                return {
                    "source": "agnes-image-2.5-flash (Local Asset Fallback)",
                    "model": "agnes-image-2.5-flash",
                    "resolution": "1024x1024",
                    "url": "/assets/photosynthesis.jpg"
                }

            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{AGNES_BASE_URL}/images/generations",
                    json=payload,
                    headers=cls.get_headers(custom_key)
                )
                resp.raise_for_status()
                data = resp.json()
                return {
                    "source": "agnes-image-2.5-flash (Live API)",
                    "model": "agnes-image-2.5-flash",
                    "resolution": "1024x1024",
                    "url": data["data"][0]["url"]
                }

        return await image_rate_limiter.execute(_make_request())
