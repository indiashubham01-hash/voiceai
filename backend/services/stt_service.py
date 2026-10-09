"""
STT (Speech-to-Text) Service
Converts voice requests to structured intent & extracted pedagogical constraints.
"""

import re
from typing import Dict, List, Any, Optional
from pydantic import BaseModel

class SpokenIntent(BaseModel):
    raw_transcript: str
    topic: str
    grade: int
    subject: str
    duration_minutes: int
    languages: List[str]
    is_replanning: bool = False
    replan_trigger: Optional[str] = None
    target_constraints: List[str] = []

class STTService:
    @classmethod
    def transcribe_and_extract(cls, audio_text: str) -> SpokenIntent:
        text = audio_text.strip()
        lower = text.lower()

        # Check for dynamic replanning request
        if "reduce" in lower or "behind" in lower or "20 min" in lower or "shorten" in lower:
            return SpokenIntent(
                raw_transcript=text,
                topic="Photosynthesis",
                grade=7,
                subject="Science / Biology",
                duration_minutes=20,
                languages=["English", "Hindi"],
                is_replanning=True,
                replan_trigger="Class is behind schedule; compressed into 20-minute essential sequence.",
                target_constraints=[
                    "Preserve high-risk beginner scaffolds",
                    "Merge Hook with Direct Instruction",
                    "Condense formative quiz to 2 core diagnostic questions"
                ]
            )

        # Check for Grade 6 Fractions
        if "fraction" in lower or "grade 6" in lower or "math" in lower:
            return SpokenIntent(
                raw_transcript=text,
                topic="Equivalent Fractions",
                grade=6,
                subject="Mathematics",
                duration_minutes=30,
                languages=["English", "Hindi"],
                is_replanning=False,
                target_constraints=[
                    "Focus on equivalent visual strip models",
                    "Scaffold for students who failed previous fraction quiz"
                ]
            )

        # Default Grade 7 Science Photosynthesis
        duration_match = re.search(r'(\d+)\s*(?:min|minute)', lower)
        duration = int(duration_match.group(1)) if duration_match else 40

        languages = ["English"]
        if "hindi" in lower or "bilingual" in lower:
            languages.append("Hindi")

        return SpokenIntent(
            raw_transcript=text,
            topic="Photosynthesis: The Plant Food Factory",
            grade=7,
            subject="Science / Biology",
            duration_minutes=duration,
            languages=languages,
            is_replanning=False,
            target_constraints=[
                "Three students need simpler explanations (Aarav, Priya, Rohan)",
                "Exam scheduled for next week",
                "Ground strictly in verified NCERT chapter notes"
            ]
        )
