from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum

class ApprovalState(str, Enum):
    DRAFT = "draft"
    REVIEWING = "reviewing"
    APPROVED = "approved"
    DELIVERED = "delivered"

class PlanSource(BaseModel):
    source_id: str
    citation: str
    pages_used: str
    trust_score: float
    usage_reason: str

class GapPrediction(BaseModel):
    student_id: str
    student_name: str
    weak_concept: str
    prerequisite_score: float
    risk_level: str  # "high" (<60), "medium" (<75), "low" (>=75)
    proactive_reason: str
    suggested_scaffold: str

class LessonSection(BaseModel):
    id: str
    time_allocation_minutes: int
    title_en: str
    title_hi: str
    title_kn: Optional[str] = None
    teacher_talking_points_en: List[str]
    teacher_talking_points_hi: List[str]
    teacher_talking_points_kn: Optional[List[str]] = None
    student_activities: List[str]
    grounded_citation: str
    scaffolding_tip: Optional[str] = None

class BeginnerTier(BaseModel):
    summary_en: str
    summary_hi: str
    summary_kn: Optional[str] = None
    key_analogy_en: str
    key_analogy_hi: str
    key_analogy_kn: Optional[str] = None
    visual_cues: List[str]
    vocabulary_glossary: List[Dict[str, str]]
    target_students: List[str]

class AdvancedTier(BaseModel):
    title_en: str
    title_hi: str
    title_kn: Optional[str] = None
    inquiry_challenge_en: str
    inquiry_challenge_hi: str
    inquiry_challenge_kn: Optional[str] = None
    deep_questions: List[str]
    extension_materials: List[str]
    target_students: List[str]

class VisualDiagram(BaseModel):
    title: str
    image_url: str
    caption_en: str
    caption_hi: str
    caption_kn: Optional[str] = None
    hotspots: List[Dict[str, Any]]

class LearningPlan(BaseModel):
    id: str
    topic_en: str
    topic_hi: str
    grade: int
    subject: str
    duration_minutes: int
    target_exam_date: Optional[str] = "Next Week (Mid-Term)"
    languages: List[str] = Field(default_factory=lambda: ["English", "Hindi"])
    
    # 3-Tier Differentiated Structure
    beginner_tier: BeginnerTier
    standard_sections: List[LessonSection]
    advanced_tier: AdvancedTier
    visual_diagram: VisualDiagram
    
    # Grounding & Citations
    sources_used: List[PlanSource] = Field(default_factory=list)
    ignored_sources: List[Dict[str, str]] = Field(default_factory=list)
    gap_predictions: List[GapPrediction] = Field(default_factory=list)
    
    # Teacher Governance State (Strict Control)
    approval_status: ApprovalState = ApprovalState.DRAFT
    version: int = 1
    is_replanned: bool = False
    replanned_reason: Optional[str] = None
    last_updated: str = "Just now"
