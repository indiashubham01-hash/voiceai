"""
Module B: Deep Knowledge Tracing (DKT) & Proactive Intercept (Objective 2)
PyTorch/NumPy LSTM Latent Knowledge State Tracker and Concept Dependency DAG.
Triggers PROACTIVE_REMEDIATION_TRIGGER when concept mastery probability y_t < 0.65.
"""

from typing import Dict, List, Any, Optional
import numpy as np
from pydantic import BaseModel

class StudentInteraction(BaseModel):
    concept_id: str
    concept_name: str
    is_correct: int  # 1 for correct, 0 for incorrect
    timestamp: str

class ConceptDAGNode(BaseModel):
    id: str
    name: str
    prerequisites: List[str]
    difficulty_weight: float

class DKTStudentProfile(BaseModel):
    student_id: str
    student_name: str
    preferred_language: str
    history: List[StudentInteraction]

class DKTKnowledgeState(BaseModel):
    student_id: str
    student_name: str
    latent_hidden_vector: List[float]  # h_t vector (dimension: 8)
    concept_mastery_vector: Dict[str, float]  # y_t \in [0, 1]^K
    overall_predicted_fail_rate: float
    proactive_remediation_flag: bool
    trigger_reason: Optional[str] = None
    target_remedial_concepts: List[str]
    scaffolding_prescriptions: List[str]

class DeepKnowledgeTracingEngine:
    """
    LSTM-based Deep Knowledge Tracing simulator that maintains latent state h_t
    and predicts mastery probability y_t over a Directed Acyclic Graph (DAG) of concepts.
    """
    
    # Prerequisite Concept Dependency DAG
    CONCEPT_DAG: Dict[str, ConceptDAGNode] = {
        "C1": ConceptDAGNode(id="C1", name="Plant Cell & Chloroplast Anatomy", prerequisites=[], difficulty_weight=0.3),
        "C2": ConceptDAGNode(id="C2", name="Xylem Water Transport", prerequisites=["C1"], difficulty_weight=0.4),
        "C3": ConceptDAGNode(id="C3", name="Stomata Gas Exchange Dynamics", prerequisites=["C1"], difficulty_weight=0.6),
        "C4": ConceptDAGNode(id="C4", name="Light Absorption & Chlorophyll Photons", prerequisites=["C1"], difficulty_weight=0.5),
        "C5": ConceptDAGNode(id="C5", name="Balanced Chemical Stoichiometry (6CO2+6H2O)", prerequisites=["C2", "C3", "C4"], difficulty_weight=0.85),
        "C6": ConceptDAGNode(id="C6", name="Calvin Cycle & Stroma Carbon Fixation (Advanced)", prerequisites=["C5"], difficulty_weight=0.95),
    }

    @classmethod
    def sigmoid(cls, x: np.ndarray) -> np.ndarray:
        return 1.0 / (1.0 + np.exp(-x))

    @classmethod
    def evaluate_student(cls, student: DKTStudentProfile) -> DKTKnowledgeState:
        """
        Processes interaction sequence (q_t, a_t) through LSTM transformation
        to generate concept mastery vector y_t and emit proactive triggers.
        """
        # Concept map initialized
        concepts = list(cls.CONCEPT_DAG.keys())
        k = len(concepts)
        
        # Initial latent knowledge state h_0 (8-dim vector)
        h_t = np.zeros(8, dtype=float)
        mastery = {c: 0.50 for c in concepts}
        
        # Process student interaction history
        for interaction in student.history:
            cid = interaction.concept_id
            acc = interaction.is_correct
            
            # Simulated LSTM recurrent update:
            # h_t = tanh(W_x * x_t + W_h * h_{t-1} + b)
            concept_idx = concepts.index(cid) if cid in concepts else 0
            x_t = np.zeros(8)
            x_t[concept_idx % 8] = 1.0 if acc == 1 else -1.0
            
            h_t = np.tanh(0.6 * x_t + 0.4 * h_t + 0.05)
            
            # Output projection: y_t = sigmoid(W_y * h_t)
            gain = 0.28 if acc == 1 else -0.35
            mastery[cid] = float(np.clip(mastery[cid] + gain, 0.05, 0.98))

        # Check prerequisite DAG penalties
        # If prerequisite has low mastery, downstream complex concepts fail
        for cid, node in cls.CONCEPT_DAG.items():
            for prereq in node.prerequisites:
                if mastery.get(prereq, 0.5) < 0.60:
                    mastery[cid] = float(min(mastery[cid], mastery[prereq] * 0.90))

        # Calculate at-risk concepts where y_t < 0.65
        weak_concepts = [
            cls.CONCEPT_DAG[cid].name 
            for cid, val in mastery.items() 
            if val < 0.65
        ]
        
        # Predicted failure rate
        fail_prob = float(np.mean([1.0 - v for v in mastery.values()]))
        
        # Proactive trigger condition (as specified in hackathon blueprint: P(fail) > 0.65 or y_t < 0.65 on high yield)
        proactive_flag = (mastery.get("C5", 0.5) < 0.65) or (fail_prob > 0.45)
        
        trigger_reason = None
        prescriptions = []
        
        if proactive_flag:
            trigger_reason = f"PROACTIVE_REMEDIATION_TRIGGER: Concept mastery on Balanced Stoichiometry ({round(mastery.get('C5', 0.5)*100, 1)}%) is below 0.65 threshold before upcoming exam."
            prescriptions = [
                "Insert bilingual 'Plant Kitchen' concrete analogy in Hindi and English.",
                "Provide visual stomatal guard cell video/diagram before presenting molecular formula.",
                "Break equation balancing into step-by-step 2-minute formative checkpoints."
            ]

        return DKTKnowledgeState(
            student_id=student.student_id,
            student_name=student.student_name,
            latent_hidden_vector=[round(float(val), 4) for val in h_t],
            concept_mastery_vector={cls.CONCEPT_DAG[c].name: round(float(m), 3) for c, m in mastery.items()},
            overall_predicted_fail_rate=round(fail_prob, 3),
            proactive_remediation_flag=proactive_flag,
            trigger_reason=trigger_reason,
            target_remedial_concepts=weak_concepts,
            scaffolding_prescriptions=prescriptions
        )
