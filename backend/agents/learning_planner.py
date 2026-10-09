"""
Agent 4: Learning Planner Agent (MINDMESH-NEXUS)
Assembles multi-tier differentiated lesson plans grounded in verified knowledge.
"""

from typing import List, Dict, Any, Optional
from ..models.lesson import (
    LearningPlan,
    LessonSection,
    BeginnerTier,
    AdvancedTier,
    VisualDiagram,
    PlanSource,
    GapPrediction,
    ApprovalState
)
from ..services.stt_service import SpokenIntent

class LearningPlannerAgent:
    @classmethod
    def generate_plan(
        cls,
        intent: SpokenIntent,
        trusted_sources: List[PlanSource],
        ignored_sources: List[Dict[str, str]],
        gap_predictions: List[GapPrediction],
        is_replanned: bool = False,
        replanned_reason: Optional[str] = None
    ) -> LearningPlan:
        duration = intent.duration_minutes
        
        # Beginner Tier: Plant Kitchen
        beginner = BeginnerTier(
            summary_en="Plants don't eat food with a mouth—they cook their own food inside their leaves using sunlight, air, and water!",
            summary_hi="पौधे हमारी तरह मुंह से खाना नहीं खाते—वे अपनी पत्तियों में धूप, हवा और पानी का उपयोग करके अपना खाना खुद बनाते हैं!",
            key_analogy_en='The "Kitchen of the Leaf": Leaf = Kitchen, Sunlight = Stove Flame, Water + CO2 = Raw Ingredients, Glucose = Cooked Meal, Oxygen = Fresh Breeze released!',
            key_analogy_hi='पत्ती की रसोई: पत्ती = किचन, धूप = गैस का चूल्हा, पानी + कार्बन डाइऑक्साइड = कच्ची सामग्री, ग्लूकोज = पका भोजन, ऑक्सीजन = ताज़ी हवा!',
            visual_cues=[
                "Leaf surface with green chloroplast solar panels",
                "Stomata acting like tiny breathing windows that open and close",
                "Roots acting like drinking straws sucking water upward"
            ],
            vocabulary_glossary=[
                {"term": "Photosynthesis", "hindi": "प्रकाश संश्लेषण (Prakash Sanshleshan)", "def": "Food making process in green plants"},
                {"term": "Chlorophyll", "hindi": "पर्णहरित / क्लोरोफिल", "def": "Green solar trapping pigment"},
                {"term": "Stomata", "hindi": "रंध्र (Stomata)", "def": "Microscopic pores on leaf surface"},
                {"term": "Glucose", "hindi": "ग्लूकोज (शर्करा)", "def": "Energy-rich sugar manufactured by plant"}
            ],
            target_students=["Aarav Sharma", "Priya Patel", "Rohan Verma"]
        )

        # Advanced Tier: Calvin Cycle
        advanced = AdvancedTier(
            title_en="Advanced Photobiology & Calvin Cycle Inquiry",
            title_hi="उच्च स्तरीय खोज चुनौती: प्रकाश तीव्रता और प्रकाश संश्लेषण दर",
            inquiry_challenge_en="Investigate how differing wavelengths of light (Red vs Blue vs Green) affect the rate of oxygen bubble emission in underwater Hydrilla plants.",
            inquiry_challenge_hi="हाइड्रिला पौधे में विभिन्न रंगों के प्रकाश का ऑक्सीजन उत्सर्जन पर प्रभाव मापें।",
            deep_questions=[
                "Why do green leaves reflect green light and absorb red/blue light photons?",
                "If temperatures rise above 45°C, why does photosynthesis drop drastically?"
            ],
            extension_materials=[
                "Hydrilla water bath apparatus guide",
                "Light spectrum filter color sheets"
            ],
            target_students=["Vihaan Reddy", "Ananya Iyer"]
        )

        # Visual Diagram
        visual = VisualDiagram(
            title="Photosynthesis: The Plant's Food Factory (Grade 7 Science)",
            image_url="/assets/photosynthesis.jpg",
            caption_en="Cross-section of leaf showing stomata gas exchange, chloroplast thylakoids, and xylem vessels.",
            caption_hi="पत्ती की आंतरिक संरचना: रंध्र, क्लोरोप्लास्ट और जाइलम संवहन।",
            hotspots=[
                {"label": "Sunlight & Photons", "hindi": "सूर्य का प्रकाश", "x": 18, "y": 16, "desc": "Solar energy trapped by chlorophyll pigments."},
                {"label": "Stomata Pores", "hindi": "रंध्र (स्टोमेटा)", "x": 12, "y": 72, "desc": "Guard cells regulate CO2 in and O2 out."},
                {"label": "Chloroplast Organelle", "hindi": "क्लोरोप्लास्ट", "x": 74, "y": 42, "desc": "The chemical solar kitchen containing thylakoids."}
            ]
        )

        # Standard Sections Timeline
        if duration == 20 or is_replanned:
            sections = [
                LessonSection(
                    id="sec-1",
                    time_allocation_minutes=3,
                    title_en="Rapid Hook: The Leaf Solar Factory",
                    title_hi="त्वरित शुरुआत और मुख्य प्रश्न",
                    teacher_talking_points_en=["Show leaf visual: How do plants make food without shopping?"],
                    teacher_talking_points_hi=["पत्ती का विजुअल दिखाएं और 3 मुख्य घटक बताएं।"],
                    student_activities=["Look at interactive leaf diagram."],
                    grounded_citation="NCERT 2026, Ch. 1, p. 12"
                ),
                LessonSection(
                    id="sec-2",
                    time_allocation_minutes=8,
                    title_en="Core Direct Instruction: Balanced Equation",
                    title_hi="मुख्य शिक्षण: संतुलित समीकरण (6CO2 + 6H2O -> C6H12O6 + 6O2)",
                    teacher_talking_points_en=["Write balanced formula on board; explain stomata guard cells."],
                    teacher_talking_points_hi=["संतुलित रासायनिक समीकरण स्पष्ट करें।"],
                    student_activities=["Copy color-coded formula into notebooks."],
                    grounded_citation="NCERT 2026, Ch. 1, pp. 13-14",
                    scaffolding_tip="Use 'Plant Kitchen' concrete analogy for Aarav, Priya, and Rohan."
                ),
                LessonSection(
                    id="sec-3",
                    time_allocation_minutes=6,
                    title_en="Rapid Diagnostic Checkpoint (2 Questions)",
                    title_hi="त्वरित 2-प्रश्न मूल्यांकन",
                    teacher_talking_points_en=["Check CO2 absorption and O2 release."],
                    teacher_talking_points_hi=["छात्रों की समझ की तुरंत जांच करें।"],
                    student_activities=["Solve 2 formative concept checks."],
                    grounded_citation="CBSE Guideline 2026, p. 47"
                ),
                LessonSection(
                    id="sec-4",
                    time_allocation_minutes=3,
                    title_en="Wrap-Up & Bilingual Flashcard Handout",
                    title_hi="त्वरित समापन और गृहकार्य",
                    teacher_talking_points_en=["Deliver core takeaway for next week's exam."],
                    teacher_talking_points_hi=["महत्वपूर्ण सारांश दोहराएं।"],
                    student_activities=["Collect bilingual summary sheet."],
                    grounded_citation="NCERT 2026, Ch. 1, p. 16"
                )
            ]
        else:
            sections = [
                LessonSection(
                    id="sec-1",
                    time_allocation_minutes=5,
                    title_en="The Hook: Mystery of the Green Solar Factory",
                    title_hi="शुरुआत: हरी सौर ऊर्जा फैक्ट्री का रहस्य",
                    teacher_talking_points_en=["Hold up a fresh green leaf. Ask how it feeds giant trees."],
                    teacher_talking_points_hi=["हाथ में हरी पत्ती उठाकर बच्चों से सवाल पूछें।"],
                    student_activities=["Touch and examine real leaves."],
                    grounded_citation="NCERT 2026, Ch. 1, p. 12"
                ),
                LessonSection(
                    id="sec-2",
                    time_allocation_minutes=12,
                    title_en="Direct Instruction: The Balanced Photosynthesis Equation",
                    title_hi="प्रत्यक्ष शिक्षण: 6CO2 + 6H2O + Light -> C6H12O6 + 6O2",
                    teacher_talking_points_en=[
                        "Explain 6 molecules CO2 + 6 molecules H2O yield 1 Glucose + 6 Oxygen.",
                        "Demonstrate stomatal guard cells under microscopic view."
                    ],
                    teacher_talking_points_hi=["समीकरण और रंध्र की कार्यप्रणाली समझाएं।"],
                    student_activities=["Copy color-coded equation into notebooks."],
                    grounded_citation="NCERT 2026, Ch. 1, pp. 13-14",
                    scaffolding_tip="Display Hindi glossary for Priya and Aarav."
                ),
                LessonSection(
                    id="sec-3",
                    time_allocation_minutes=10,
                    title_en="Guided Practice: The Iodine Starch Investigation",
                    title_hi="निर्देशित अभ्यास: स्टार्च और सूर्य के प्रकाश का परीक्षण",
                    teacher_talking_points_en=["Iodine turns blue-black where starch was manufactured."],
                    teacher_talking_points_hi=["आयोडीन स्टार्च परीक्षण का प्रदर्शन करें।"],
                    student_activities=["Label inputs and outputs on paired worksheets."],
                    grounded_citation="NCERT 2026, Ch. 1, p. 15"
                ),
                LessonSection(
                    id="sec-4",
                    time_allocation_minutes=8,
                    title_en="Formative AI Checkpoint: Diagnostic Quiz",
                    title_hi="रचनात्मक मूल्यांकन: त्वरित 3-प्रश्न क्विज़",
                    teacher_talking_points_en=["Administer 3 formative questions to catch exam gaps."],
                    teacher_talking_points_hi=["3 प्रश्नों की क्विज़ हल कराएं।"],
                    student_activities=["Solve formative quiz on tablet or paper."],
                    grounded_citation="CBSE Guideline 2026, p. 47"
                ),
                LessonSection(
                    id="sec-5",
                    time_allocation_minutes=5,
                    title_en="Synthesis & Differentiated Wrap-Up",
                    title_hi="निष्कर्ष और स्तर-अनुसार गृहकार्य",
                    teacher_talking_points_en=["Assign tiered homework (Comic strip for beginners, Calvin cycle for advanced)."],
                    teacher_talking_points_hi=["सभी छात्रों को उनके स्तर के अनुसार कार्य सौंपें।"],
                    student_activities=["30-second exit ticket whispering gas name to partner."],
                    grounded_citation="NCERT 2026, Ch. 1, p. 16"
                )
            ]

        plan_id = f"plan-photo-{duration}-{'replan' if is_replanned else 'init'}"

        return LearningPlan(
            id=plan_id,
            topic_en=intent.topic,
            topic_hi="प्रकाश संश्लेषण: पौधों का भोजन निर्माण",
            grade=intent.grade,
            subject=intent.subject,
            duration_minutes=duration,
            languages=intent.languages,
            beginner_tier=beginner,
            standard_sections=sections,
            advanced_tier=advanced,
            visual_diagram=visual,
            sources_used=trusted_sources,
            ignored_sources=ignored_sources,
            gap_predictions=gap_predictions,
            approval_status=ApprovalState.DRAFT,
            version=2 if is_replanned else 1,
            is_replanned=is_replanned,
            replanned_reason=replanned_reason,
            last_updated="Just now"
        )
