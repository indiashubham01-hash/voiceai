"""
Agent 3: Gap Predictor Agent (Objective 2)
Predicts future learning gaps using diagnostic scores and concept prerequisite DAGs.

Rule:
if prerequisite_score < 60:
    risk = "high"
elif prerequisite_score < 75:
    risk = "medium"
else:
    risk = "low"
"""

from typing import List
from ..models.student import Student
from ..models.lesson import GapPrediction

class GapPredictorAgent:
    @classmethod
    def predict_classroom_gaps(cls, students: List[Student]) -> List[GapPrediction]:
        predictions = []

        for student in students:
            # Find prerequisite scores (e.g. Plant Cell Structure, Fraction basics)
            scores = [m.recent_quiz_score / m.max_quiz_score * 100.0 for m in student.topic_mastery if m.max_quiz_score > 0]
            avg_prereq = float(sum(scores) / len(scores)) if scores else 50.0

            # Apply exact rule logic
            if avg_prereq < 60:
                risk = "high"
                proactive_reason = f"Prerequisite mastery ({round(avg_prereq, 1)}%) is under 60%. Highly likely to fail abstract chemical balancing."
                scaffold = "Inject 'Plant Kitchen' bilingual visual scaffold with step-by-step 2-minute checkpoint questions."
            elif avg_prereq < 75:
                risk = "medium"
                proactive_reason = f"Prerequisite mastery ({round(avg_prereq, 1)}%) is under 75%. May confuse stomatal gas exchange."
                scaffold = "Provide paired worksheet comparison of CO2 vs O2 movement."
            else:
                risk = "low"
                proactive_reason = f"Solid prerequisite mastery ({round(avg_prereq, 1)}%). Ready for advanced extension inquiry."
                scaffold = "Assign Calvin Cycle and variable light spectrum experiment."

            predictions.append(GapPrediction(
                student_id=student.id,
                student_name=student.name,
                weak_concept="Chemical Equation & Stomatal Mechanics" if risk == "high" else "Stomata Gas Exchange",
                prerequisite_score=round(avg_prereq, 1),
                risk_level=risk,
                proactive_reason=proactive_reason,
                suggested_scaffold=scaffold
            ))

        return predictions
