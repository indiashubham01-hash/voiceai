from typing import List, Optional
from pydantic import BaseModel, Field

class StudentPreference(BaseModel):
    preferred_language: str = "Bilingual"  # "English", "Hindi", "Bilingual"
    learning_pace: str = "standard"        # "slow", "standard", "fast"
    needs_visual_scaffolding: bool = True
    phonetic_audio_assistance: bool = False

class StudentTopicMastery(BaseModel):
    topic_id: str
    topic_name: str
    mastery_percentage: float  # 0.0 - 100.0
    recent_quiz_score: float
    max_quiz_score: float
    last_assessed: str
    is_prerequisite: bool = False

class Student(BaseModel):
    id: str
    name: str
    grade: int
    class_id: str
    avatar_url: str
    preferences: StudentPreference = Field(default_factory=StudentPreference)
    topic_mastery: List[StudentTopicMastery] = Field(default_factory=list)
    calculated_risk_score: float = 0.0  # 0.0 - 100.0
    risk_level: str = "low"             # "high", "medium", "low"
    risk_rationale: Optional[str] = None
    prescribed_remediation: Optional[str] = None

class ClassGroup(BaseModel):
    id: str
    name: str
    grade: int
    subject: str
    teacher_id: str
    student_ids: List[str] = Field(default_factory=list)
