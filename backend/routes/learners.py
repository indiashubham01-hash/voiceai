"""
Learners & Classroom Risk API Route
GET /learners/{student_id}/profile
GET /class/{class_id}/risk-report
"""

from typing import List
from fastapi import APIRouter, HTTPException

from ..agents.gap_predictor import GapPredictorAgent
from ..agents.learner_profile import LearnerProfileAgent
from .voice import MOCK_STUDENTS

router = APIRouter(tags=["Learners & Analytics"])

@router.get("/learners/{student_id}/profile")
def get_student_profile(student_id: str):
    student = next((s for s in MOCK_STUDENTS if s.id == student_id), None)
    if not student:
        # Check by index or fallback to base student with custom id
        student = MOCK_STUDENTS[0].copy(update={"id": student_id, "name": f"Student ({student_id})"})

    predictions = GapPredictorAgent.predict_classroom_gaps([student])
    return {
        "student": student.dict(),
        "gap_prediction": predictions[0].dict() if predictions else None
    }

@router.get("/class/{class_id}/risk-report")
def get_class_risk_report(class_id: str):
    analytics = LearnerProfileAgent.analyze_classroom(MOCK_STUDENTS)
    gap_predictions = GapPredictorAgent.predict_classroom_gaps(MOCK_STUDENTS)

    high_risk_list = [g for g in gap_predictions if g.risk_level == "high"]
    medium_risk_list = [g for g in gap_predictions if g.risk_level == "medium"]

    return {
        "class_id": class_id,
        "grade": 7,
        "subject": "Science / Biology",
        "total_students": len(MOCK_STUDENTS),
        "analytics": analytics,
        "gap_predictions": [g.dict() for g in gap_predictions],
        "high_risk_students": [g.dict() for g in high_risk_list],
        "medium_risk_students": [g.dict() for g in medium_risk_list],
        "proactive_remedial_policy": "Bilingual 'Plant Kitchen' visual analogies inserted for all high-risk learners before exam."
    }

@router.get("/ml/model-metrics")
def get_ml_model_metrics():
    """Returns trained ML model comparison metrics for student performance."""
    import json, os
    metrics_path = "backend/models/model_metrics.json"
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "status": "NOT_TRAINED",
        "message": "Run python backend/train_model.py to train models."
    }

@router.get("/ml/riiid-metrics")
def get_riiid_dkt_metrics():
    """Returns trained Riiid Deep Knowledge Tracing (DKT) benchmark metrics."""
    import json, os
    metrics_path = "backend/models/riiid_metrics.json"
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "status": "NOT_TRAINED",
        "message": "Run python backend/train_riiid_dkt.py to train Riiid DKT model."
    }

