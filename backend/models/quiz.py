from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class QuizQuestion(BaseModel):
    id: str
    question_en: str
    question_hi: str
    question_kn: Optional[str] = None
    options_en: List[str]
    options_hi: List[str]
    options_kn: Optional[List[str]] = None
    correct_option_index: int
    explanation_en: str
    explanation_hi: str
    explanation_kn: Optional[str] = None
    targeted_concept: str
    difficulty: str = "Medium"  # "Easy", "Medium", "Hard"

class Quiz(BaseModel):
    id: str
    plan_id: str
    topic: str
    grade: int
    questions: List[QuizQuestion] = Field(default_factory=list)
    total_marks: int = 3

class QuizAttempt(BaseModel):
    id: str
    quiz_id: str
    student_id: str
    student_name: str
    answers: Dict[int, int]  # question_idx -> chosen_option_index
    score: int
    max_score: int
    percentage: float
    timestamp: str
    remediation_required: bool = False
