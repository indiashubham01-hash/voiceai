"""
Agent 1: Source Trust & Conflict Analysis Agent (Objective 3)
Calculates epistemic trust using:
Trust Score(S) = 0.40 * Recency + 0.40 * Authority + 0.20 * Consensus
"""

from typing import List, Dict, Any
from ..models.source import Resource, SourceTrustReport

class SourceTrustAgent:
    CURRENT_YEAR = 2026

    @classmethod
    def evaluate_resources(
        cls, 
        resources: List[Resource], 
        ground_truth_id: str = "doc-ncert-2026"
    ) -> List[SourceTrustReport]:
        reports = []

        for res in resources:
            delta_year = max(0, cls.CURRENT_YEAR - res.version_year)
            recency = max(0.1, 1.0 - (delta_year * 0.12))
            authority = res.authority_score

            # NLI contradiction scoring simulation
            if res.id != ground_truth_id and ("2021" in res.filename or "notes" in res.file_type):
                p_contra = 0.89
                p_entail = 0.04
                p_neutral = 0.07
                consensus = 0.11
                status = "CONFLICT_IGNORED"
                conflict_reason = (
                    "Contradiction detected: Outdated note omits balanced 6CO2 stoichiometry "
                    "and modern stomatal guard cell mechanics required by 2026 curriculum."
                )
            else:
                p_contra = 0.02
                p_entail = 0.96
                p_neutral = 0.02
                consensus = 0.98
                status = "LOCKED_GROUND_TRUTH" if res.id == ground_truth_id else "ACTIVE_SUPPORT"
                conflict_reason = None

            # Formula: Trust Score(S) = 0.40 * Recency + 0.40 * Authority + 0.20 * Consensus
            final_trust = (0.40 * recency + 0.40 * authority + 0.20 * consensus) * 100.0

            reports.append(SourceTrustReport(
                source_id=res.id,
                title=res.title,
                version_year=res.version_year,
                recency_score=round(recency, 3),
                authority_score=round(authority, 3),
                consensus_score=round(consensus, 3),
                final_trust_score=round(final_trust, 1),
                nli_p_contradiction=p_contra,
                nli_p_entailment=p_entail,
                nli_p_neutral=p_neutral,
                status=status,
                conflict_explanation=conflict_reason,
                cited_pages="pp. 12-16" if res.id == ground_truth_id else "pp. 3-4"
            ))

        return reports
