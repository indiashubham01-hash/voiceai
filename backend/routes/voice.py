"""
Voice Request API Route
POST /voice-request
Workflow:
Audio/Text -> STT Intent -> Semantic Retrieval -> Source Trust -> DKT Gap Predictor -> Agnes Planner -> Draft Plan (Pending Teacher Approval)
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..services.stt_service import STTService
from ..services.retrieval import VectorRetrievalService
from ..agents.source_trust import SourceTrustAgent
from ..agents.gap_predictor import GapPredictorAgent
from ..agents.learning_planner import LearningPlannerAgent
from ..models.source import Resource, ResourceChunk
from ..models.student import Student, StudentPreference, StudentTopicMastery
from ..models.lesson import PlanSource

router = APIRouter(tags=["Voice & Speech"])

class VoiceRequestBody(BaseModel):
    audio_transcript: Optional[str] = None
    transcript: Optional[str] = None
    student_ids: Optional[list[str]] = None
    custom_api_key: Optional[str] = None

# Mock In-Memory Database
MOCK_RESOURCES = [
    Resource(
        id="doc-ncert-2026",
        title="NCERT Grade 7 Science Ch 1 (2026 Revised)",
        filename="NCERT_Grade7_Science_Ch1_2026.pdf",
        version_year=2026,
        storage_url="https://supabase.storage/ncert-2026.pdf",
        total_pages=18,
        authority_score=0.98,
        upload_timestamp="2026-09-15",
        extracted_chunks=[
            ResourceChunk(
                id="chk-1",
                resource_id="doc-ncert-2026",
                page_number=12,
                chunk_index=1,
                content="Leaves are the food factories of plants. Balanced equation: 6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2. Stomata pores regulated by guard cells absorb CO2."
            )
        ]
    ),
    Resource(
        id="doc-notes-2021",
        title="Teacher Archived Notes (2021 Old Syllabus)",
        filename="Photosynthesis_Notes_2021.pdf",
        version_year=2021,
        storage_url="https://supabase.storage/notes-2021.pdf",
        total_pages=6,
        authority_score=0.42,
        upload_timestamp="2026-08-10",
        extracted_chunks=[
            ResourceChunk(
                id="chk-2",
                resource_id="doc-notes-2021",
                page_number=3,
                chunk_index=1,
                content="Plants make food using sunlight + water + carbon dioxide to make sugar. No need to teach 6CO2 balanced stoichiometry in Class 7."
            )
        ]
    )
]

MOCK_STUDENTS = [
    Student(
        id="std-0",
        name="Rahul Sharma",
        grade=7,
        class_id="class-7a",
        avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        preferences=StudentPreference(preferred_language="Hindi", learning_pace="slow"),
        topic_mastery=[
            StudentTopicMastery(topic_id="T-TCP", topic_name="TCP Basics", mastery_percentage=91, recent_quiz_score=9, max_quiz_score=10, last_assessed="2026-10-05", is_prerequisite=True),
            StudentTopicMastery(topic_id="T-FC", topic_name="Flow Control", mastery_percentage=72, recent_quiz_score=7, max_quiz_score=10, last_assessed="2026-10-06", is_prerequisite=True),
            StudentTopicMastery(topic_id="T-SS", topic_name="Slow Start", mastery_percentage=48, recent_quiz_score=4, max_quiz_score=10, last_assessed="2026-10-07", is_prerequisite=True),
            StudentTopicMastery(topic_id="T-CC", topic_name="Congestion Control", mastery_percentage=55, recent_quiz_score=5, max_quiz_score=10, last_assessed="2026-10-08", is_prerequisite=True)
        ],
        calculated_risk_score=82.0,
        risk_level="high"
    ),
    Student(
        id="std-1",
        name="Aarav Sharma",
        grade=7,
        class_id="class-7a",
        avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        preferences=StudentPreference(preferred_language="Hindi", learning_pace="slow"),
        topic_mastery=[
            StudentTopicMastery(topic_id="T1", topic_name="Plant Anatomy", mastery_percentage=50, recent_quiz_score=5, max_quiz_score=10, last_assessed="2026-09-28", is_prerequisite=True),
            StudentTopicMastery(topic_id="T2", topic_name="Nutrient Transport", mastery_percentage=40, recent_quiz_score=4, max_quiz_score=10, last_assessed="2026-10-02", is_prerequisite=True)
        ],
        calculated_risk_score=86.0,
        risk_level="high"
    ),
    Student(
        id="std-2",
        name="Priya Patel",
        grade=7,
        class_id="class-7a",
        avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
        preferences=StudentPreference(preferred_language="Bilingual", learning_pace="slow"),
        topic_mastery=[
            StudentTopicMastery(topic_id="T1", topic_name="Plant Anatomy", mastery_percentage=60, recent_quiz_score=6, max_quiz_score=10, last_assessed="2026-09-28", is_prerequisite=True),
            StudentTopicMastery(topic_id="T2", topic_name="Nutrient Transport", mastery_percentage=50, recent_quiz_score=5, max_quiz_score=10, last_assessed="2026-10-02", is_prerequisite=True)
        ],
        calculated_risk_score=78.0,
        risk_level="high"
    ),
    Student(
        id="std-3",
        name="Rohan Verma",
        grade=7,
        class_id="class-7a",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        preferences=StudentPreference(preferred_language="Hindi", learning_pace="slow"),
        topic_mastery=[
            StudentTopicMastery(topic_id="T1", topic_name="Plant Anatomy", mastery_percentage=40, recent_quiz_score=4, max_quiz_score=10, last_assessed="2026-09-28", is_prerequisite=True)
        ],
        calculated_risk_score=84.0,
        risk_level="high"
    )
]

@router.post("/voice-request")
async def process_voice_request(body: VoiceRequestBody):
    """
    Main Orchestration Flow:
    1. STT: Transcribes audio & extracts pedagogical constraints
    2. Vector Search: Searches uploaded curriculum resources
    3. Source Trust Agent: Resolves conflicts & assigns trust scores
    4. Gap Predictor Agent: Computes future risk scores (<60 high, <75 medium, else low)
    5. Learning Planner Agent: Calls Agnes 3.0 Flash logic & produces draft plan
    """
    raw_transcript = body.audio_transcript or body.transcript or "Photosynthesis in Grade 7"
    # 1. STT Intent Extraction
    intent = STTService.transcribe_and_extract(raw_transcript)

    # 2. Vector Retrieval
    retrieved_chunks = VectorRetrievalService.search_chunks(intent.topic, MOCK_RESOURCES, top_k=2)

    # 3. Source Trust Agent
    trust_reports = SourceTrustAgent.evaluate_resources(MOCK_RESOURCES)
    trusted_plan_sources = [
        PlanSource(
            source_id=r.source_id,
            citation=f"{r.title} ({r.cited_pages})",
            pages_used=r.cited_pages,
            trust_score=r.final_trust_score,
            usage_reason="Primary verified curriculum ground truth for photosynthesis."
        )
        for r in trust_reports if r.status in ["LOCKED_GROUND_TRUTH", "ACTIVE_SUPPORT"]
    ]
    ignored_sources = [
        {"source_id": r.source_id, "reason": r.conflict_explanation or "Low trust score"}
        for r in trust_reports if r.status == "CONFLICT_IGNORED"
    ]

    # 4. Gap Predictor Agent
    gap_predictions = GapPredictorAgent.predict_classroom_gaps(MOCK_STUDENTS)

    # 5. Agnes Learning Planner
    plan = LearningPlannerAgent.generate_plan(
        intent=intent,
        trusted_sources=trusted_plan_sources,
        ignored_sources=ignored_sources,
        gap_predictions=gap_predictions,
        is_replanned=intent.is_replanning,
        replanned_reason=intent.replan_trigger
    )

    return {
        "status": "DRAFT_GENERATED",
        "voice_transcript": intent.raw_transcript,
        "extracted_intent": intent.dict(),
        "epistemic_trust_reports": [r.dict() for r in trust_reports],
        "predicted_gaps": [g.dict() for g in gap_predictions],
        "learning_plan": plan.dict(),
        "governance": {
            "is_published": False,
            "requires_teacher_approval": True,
            "rule": "Never publish without explicit teacher sign-off."
        }
    }
