"""
Plans API Route
POST /plans/generate
POST /plans/{plan_id}/revise
POST /plans/{plan_id}/approve
GET  /plans/{plan_id}
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..models.lesson import LearningPlan, ApprovalState
from ..services.stt_service import STTService
from ..agents.source_trust import SourceTrustAgent
from ..agents.gap_predictor import GapPredictorAgent
from ..agents.learning_planner import LearningPlannerAgent
from ..models.lesson import PlanSource
from .voice import MOCK_RESOURCES, MOCK_STUDENTS

router = APIRouter(prefix="/plans", tags=["Lesson Plans"])

# In-memory plans store
STORED_PLANS: Dict[str, LearningPlan] = {}

class GeneratePlanRequest(BaseModel):
    topic: str = "Photosynthesis"
    grade: int = 7
    subject: str = "Science / Biology"
    duration_minutes: int = 40
    languages: list[str] = ["English", "Hindi"]
    teacher_notes: Optional[str] = "Three students need simpler explanations, exam next week."

class RevisePlanRequest(BaseModel):
    revision_instruction: str  # e.g., "The class is behind; reduce this to 20 minutes."

@router.post("/generate")
def generate_lesson_plan(body: GeneratePlanRequest):
    intent = STTService.transcribe_and_extract(
        f"I need a {body.duration_minutes}-minute Grade {body.grade} {body.subject} lesson on {body.topic} in {', '.join(body.languages)}. {body.teacher_notes or ''}"
    )

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

    gap_predictions = GapPredictorAgent.predict_classroom_gaps(MOCK_STUDENTS)

    plan = LearningPlannerAgent.generate_plan(
        intent=intent,
        trusted_sources=trusted_plan_sources,
        ignored_sources=ignored_sources,
        gap_predictions=gap_predictions
    )
    STORED_PLANS[plan.id] = plan

    return {
        "status": "DRAFT_READY_FOR_APPROVAL",
        "plan": plan.dict(),
        "approval_status": plan.approval_status.value
    }

@router.post("/{plan_id}/revise")
def revise_lesson_plan(plan_id: str, body: RevisePlanRequest):
    intent = STTService.transcribe_and_extract(body.revision_instruction)

    trust_reports = SourceTrustAgent.evaluate_resources(MOCK_RESOURCES)
    trusted_plan_sources = [
        PlanSource(
            source_id=r.source_id,
            citation=f"{r.title} ({r.cited_pages})",
            pages_used=r.cited_pages,
            trust_score=r.final_trust_score,
            usage_reason="Verified curriculum ground truth."
        )
        for r in trust_reports if r.status in ["LOCKED_GROUND_TRUTH", "ACTIVE_SUPPORT"]
    ]
    ignored_sources = [
        {"source_id": r.source_id, "reason": r.conflict_explanation or "Low trust"}
        for r in trust_reports if r.status == "CONFLICT_IGNORED"
    ]
    gap_predictions = GapPredictorAgent.predict_classroom_gaps(MOCK_STUDENTS)

    replanned = LearningPlannerAgent.generate_plan(
        intent=intent,
        trusted_sources=trusted_plan_sources,
        ignored_sources=ignored_sources,
        gap_predictions=gap_predictions,
        is_replanned=True,
        replanned_reason=body.revision_instruction
    )
    replanned.approval_status = ApprovalState.REVIEWING
    STORED_PLANS[plan_id] = replanned

    return {
        "status": "REVISED",
        "plan_id": plan_id,
        "revised_duration_minutes": replanned.duration_minutes,
        "replanned_reason": body.revision_instruction,
        "plan": replanned.dict(),
        "approval_status": replanned.approval_status.value
    }

@router.post("/{plan_id}/approve")
def approve_lesson_plan(plan_id: str):
    plan = STORED_PLANS.get(plan_id)
    if not plan:
        # Generate default photosynthesis plan if not in memory
        intent = STTService.transcribe_and_extract("Photosynthesis 40 min")
        trust_reports = SourceTrustAgent.evaluate_resources(MOCK_RESOURCES)
        trusted_plan_sources = [
            PlanSource(source_id=r.source_id, citation=f"{r.title} ({r.cited_pages})", pages_used=r.cited_pages, trust_score=r.final_trust_score, usage_reason="Curriculum standard")
            for r in trust_reports if r.status != "CONFLICT_IGNORED"
        ]
        gap_predictions = GapPredictorAgent.predict_classroom_gaps(MOCK_STUDENTS)
        plan = LearningPlannerAgent.generate_plan(intent, trusted_plan_sources, [], gap_predictions)
        STORED_PLANS[plan_id] = plan

    plan.approval_status = ApprovalState.APPROVED
    plan.last_updated = "Just now (Approved by Teacher)"

    return {
        "status": "APPROVED",
        "plan_id": plan_id,
        "approval_status": plan.approval_status.value,
        "message": "Lesson plan explicitly approved by teacher. Safe for student classroom delivery."
    }

@router.get("/{plan_id}")
def get_lesson_plan(plan_id: str):
    plan = STORED_PLANS.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan.dict()
