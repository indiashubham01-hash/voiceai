"""
Agent 2: Learner Profile & Mastery Agent (Objective 1)
Aggregates student preferences, pace, and topic mastery history.
"""

from typing import List, Dict, Any
from ..models.student import Student

class LearnerProfileAgent:
    @classmethod
    def analyze_classroom(cls, students: List[Student]) -> Dict[str, Any]:
        slow_pace = [s for s in students if s.preferences.learning_pace == "slow"]
        bilingual = [s for s in students if s.preferences.preferred_language in ["Hindi", "Bilingual"]]
        high_risk = [s for s in students if s.calculated_risk_score >= 70 or s.risk_level == "high"]

        return {
            "total_students": len(students),
            "struggling_learners_count": len(slow_pace),
            "struggling_learner_names": [s.name for s in slow_pace],
            "bilingual_learners_count": len(bilingual),
            "high_risk_count": len(high_risk),
            "recommended_scaffolding": "Concrete 'Plant Kitchen' visual analogy with bilingual Hindi terms."
        }
