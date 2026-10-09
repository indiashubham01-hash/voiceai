"""
Quizzes API Route with 11 Formative Check Questions & Live DKT Telemetry
Supports Trilingual (EN, HI, KN), Real-time Grading, DKT Knowledge Tracing,
and Groq LPU Adaptive Question Generation.
"""

from typing import Dict, List, Optional
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..models.quiz import Quiz, QuizQuestion, QuizAttempt
from .voice import MOCK_STUDENTS
from ..services.groq_service import groq_service

router = APIRouter(prefix="/quizzes", tags=["Formative Quizzes & DKT Telemetry"])

ALL_11_QUESTIONS: List[QuizQuestion] = [
    QuizQuestion(
        id="q-1",
        question_en="Which gas is taken in by green leaves through stomata during daytime photosynthesis?",
        question_hi="दिन के समय प्रकाश संश्लेषण के दौरान पत्तियों द्वारा रंध्रों से कौन सी गैस अंदर ली जाती है?",
        question_kn="ಹಗಲಿನ ವೇಳೆಯಲ್ಲಿ ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆಯ ಸಮಯದಲ್ಲಿ ಹಸಿರು ಎಲೆಗಳು ಪತ್ರರಂಧ್ರಗಳ ಮೂಲಕ ಯಾವ ಅನಿಲವನ್ನು ಒಳಗೆ ತೆಗೆದುಕೊಳ್ಳುತ್ತವೆ?",
        options_en=["Oxygen (O2)", "Carbon Dioxide (CO2)", "Nitrogen (N2)", "Hydrogen (H2)"],
        options_hi=["ऑक्सीजन (O2)", "कार्बन डाइऑक्साइड (CO2)", "नाइट्रोजन (N2)", "हाइड्रोजन (H2)"],
        options_kn=["ಆಮ್ಲಜನಕ (Oxygen - O2)", "ಇಂಗಾಲದ ಡೈಆಕ್ಸೈಡ್ (Carbon Dioxide - CO2)", "ಸಾರಜನಕ (Nitrogen - N2)", "ಜಲಜನಕ (Hydrogen - H2)"],
        correct_option_index=1,
        explanation_en="Carbon dioxide is absorbed through stomata pores and combined with water to create glucose.",
        explanation_hi="कार्बन डाइऑक्साइड पत्तियों के रंध्रों से अवशोषित होती है और पानी के साथ मिलकर ग्लूकोज बनाती है।",
        explanation_kn="ಇಂಗಾಲದ ಡೈಆಕ್ಸೈಡ್ (CO2) ಅನ್ನು ಪತ್ರರಂಧ್ರಗಳ ಮೂಲಕ ಹೀರಿಕೊಳ್ಳಲಾಗುತ್ತದೆ ಮತ್ತು ನೀರಿನೊಂದಿಗೆ ಸಂಯೋಜಿಸಿ ಗ್ಲೂಕೋಸ್ ತಯಾರಿಸಲಾಗುತ್ತದೆ.",
        targeted_concept="Stomata Gas Exchange",
        difficulty="Easy"
    ),
    QuizQuestion(
        id="q-2",
        question_en="What gives plants their green color and traps light energy for photosynthesis?",
        question_hi="पौधों को हरा रंग कौन सा वर्णक देता है और प्रकाश ऊर्जा को अवशोषित करता है?",
        question_kn="ಸಸ್ಯಗಳಿಗೆ ಹಸಿರು ಬಣ್ಣವನ್ನು ನೀಡುವ ಮತ್ತು ಬೆಳಕಿನ ಶಕ್ತಿಯನ್ನು ಹೀರಿಕೊಳ್ಳುವ ವರ್ಣದ್ರವ್ಯ ಯಾವುದು?",
        options_en=["Hemoglobin", "Chlorophyll", "Melanin", "Carotene"],
        options_hi=["हीमोग्लोबिन", "क्लोरोफिल (पर्णहरित)", "मेलेनिन", "कैरोटीन"],
        options_kn=["ಹಿಮೋಗ್ಲೋಬಿನ್", "ಕ್ಲೋರೋಫಿಲ್ (ಪತ್ರಹರಿತ್ತು)", "ಮೆಲನಿನ್", "ಕ್ಯಾರೋಟಿನ್"],
        correct_option_index=1,
        explanation_en="Chlorophyll located in chloroplasts absorbs blue and red wavelengths of light and reflects green light.",
        explanation_hi="क्लोरोप्लास्ट में मौजूद क्लोरोफिल प्रकाश संश्लेषण के लिए प्रकाश ऊर्जा को पकड़ता है।",
        explanation_kn="ಕ್ಲೋರೋಪ್ಲಾಸ್ಟ್‌ಗಳಲ್ಲಿರುವ ಕ್ಲೋರೋಫಿಲ್ ಸೌರ ಶಕ್ತಿಯನ್ನು ಹೀರಿಕೊಂಡು ಹಸಿರು ಬಣ್ಣವನ್ನು ಪ್ರತಿಫಲಿಸುತ್ತದೆ.",
        targeted_concept="Chloroplast Function",
        difficulty="Easy"
    ),
    QuizQuestion(
        id="q-3",
        question_en="Which plant vascular tissue is responsible for transporting water and minerals from roots upward to the leaves?",
        question_hi="जड़ों से पत्तियों तक पानी और खनिजों का परिवहन करने वाला संवहनी ऊतक कौन सा है?",
        question_kn="ಬೇರುಗಳಿಂದ ಎಲೆಗಳಿಗೆ ನೀರು ಮತ್ತು ಖನಿಜಗಳನ್ನು ಸಾಗಿಸುವ ಸಸ್ಯ ಅಂಗಾಂಶ ಯಾವುದು?",
        options_en=["Phloem", "Xylem", "Epidermis", "Cortex"],
        options_hi=["फ्लोएम", "जाइलम (Xylem)", "एपिडर्मिस", "कॉर्टेक्स"],
        options_kn=["ಫ್ಲೋಯಂ (Phloem)", "ಕ್ಸೈಲಂ (Xylem - ನೀರು ಸಾಗಣೆ)", "ಎಪಿಡರ್ಮಿಸ್", "ಕಾರ್ಟೆಕ್ಸ್"],
        correct_option_index=1,
        explanation_en="Xylem vessels act as continuous water pipes transporting water and dissolved soil minerals to photosynthetic mesophyll cells.",
        explanation_hi="जाइलम वाहिकाएं जड़ों से पत्तियों तक जल और खनिजों का एकदिशीय परिवहन करती हैं।",
        explanation_kn="ಕ್ಸೈಲಂ ಕೊಳವೆಗಳು ಬೇರುಗಳಿಂದ ದ್ಯುತಿಸಂಶ್ಲೇಷಕ ಜೀವಕೋಶಗಳಿಗೆ ನೀರನ್ನು ನಿರಂತರವಾಗಿ ಸಾಗಿಸುತ್ತವೆ.",
        targeted_concept="Water Transport Dynamics",
        difficulty="Easy"
    ),
    QuizQuestion(
        id="q-4",
        question_en="In what complex carbohydrate form do green plants primarily store excess synthesized glucose for later use?",
        question_hi="हरे पौधे अतिरिक्त ग्लूकोज को मुख्य रूप से किस जटिल कार्बोहाइड्रेट के रूप में संग्रहित करते हैं?",
        question_kn="ಹಸಿರು ಸಸ್ಯಗಳು ಹೆಚ್ಚುವರಿ ಗ್ಲೂಕೋಸ್ ಅನ್ನು ನಂತರದ ಬಳಕೆಗಾಗಿ ಯಾವ ರೂಪದಲ್ಲಿ ಸಂಗ್ರಹಿಸುತ್ತವೆ?",
        options_en=["Starch", "Glycogen", "Lactose", "Fructose"],
        options_hi=["स्टार्च (Starch / मंड)", "ग्लाइकोजन", "लैक्टोज", "फ्रुक्टोज"],
        options_kn=["ಪಿಷ್ಟ (Starch)", "ಗ್ಲೈಕೋಜನ್", "ಲ್ಯಾಕ್ಟೋಸ್", "ಫ್ರಕ್ಟೋಸ್"],
        correct_option_index=0,
        explanation_en="Plants polymerize soluble glucose into insoluble starch granules stored in amyloplasts.",
        explanation_hi="पौधे घुलनशील ग्लूकोज को अघुलनशील स्टार्च में बदलकर पत्तियों, तनों और जड़ों में संग्रहित करते हैं।",
        explanation_kn="ಸಸ್ಯಗಳು ಕರಗುವ ಗ್ಲೂಕೋಸ್ ಅನ್ನು ಪಿಷ್ಟದ (ಸ್ಟಾರ್ಚ್) ಕಣಗಳಾಗಿ ಪರಿವರ್ತಿಸಿ ಸಂಗ್ರಹಿಸುತ್ತವೆ.",
        targeted_concept="Starch Storage Mechanism",
        difficulty="Easy"
    ),
    QuizQuestion(
        id="q-5",
        question_en="What is the primary role of Chlorophyll in the leaf chloroplasts during the light-dependent phase?",
        question_hi="पत्ती के क्लोरोप्लास्ट में क्लोरोफिल (पर्णहरित) का मुख्य कार्य क्या है?",
        question_kn="ಎಲೆಯ ಕ್ಲೋರೋಪ್ಲಾಸ್ಟ್‌ಗಳಲ್ಲಿ ಕ್ಲೋರೋಫಿಲ್ (ಪತ್ರಹರಿತ್ತು) ನ ಪ್ರಮುಖ ಪಾತ್ರವೇನು?",
        options_en=[
            "To absorb water from the soil",
            "To trap solar photons and excite electrons",
            "To release carbon dioxide into the air",
            "To synthesize nitrogen compounds"
        ],
        options_hi=[
            "मिट्टी से पानी सोखना",
            "सौर ऊर्जा को अवशोषित कर इलेक्ट्रॉनों को उत्तेजित करना",
            "हवा में कार्बन डाइऑक्साइड छोड़ना",
            "नाइट्रोजन यौगिक बनाना"
        ],
        options_kn=[
            "ಮಣ್ಣಿನಿಂದ ನೀರನ್ನು ಹೀರಿಕೊಳ್ಳುವುದು",
            "ಸೌರ ಶಕ್ತಿಯನ್ನು ಹೀರಿಕೊಂಡು ಎಲೆಕ್ಟ್ರಾನ್‌ಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸುವುದು",
            "ಗಾಳಿಗೆ ಇಂಗಾಲದ ಡೈಆಕ್ಸೈಡ್ ಬಿಡುಗಡೆ ಮಾಡುವುದು",
            "ಸಾರಜನಕ ಸಂಯುಕ್ತಗಳನ್ನು ತಯಾರಿಸುವುದು"
        ],
        correct_option_index=1,
        explanation_en="Chlorophyll acts as a photochemical antenna, absorbing photon energy to drive ATP and NADPH synthesis.",
        explanation_hi="क्लोरोफिल एक सौर पैनल की तरह काम करता है, जो रासायनिक ऊर्जा उत्पन्न करने के लिए प्रकाश को पकड़ता है।",
        explanation_kn="ಕ್ಲೋರೋಫಿಲ್ ಸೌರ ಫಲಕದಂತೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ, ರಾಸಾಯನಿಕ ಶಕ್ತಿ ಉತ್ಪಾದನೆಗೆ ಬೆಳಕನ್ನು ಸೆರೆಹಿಡಿಯುತ್ತದೆ.",
        targeted_concept="Chloroplast Function",
        difficulty="Medium"
    ),
    QuizQuestion(
        id="q-6",
        question_en="How do guard cells mechanically open the stomatal aperture when water rushes into them?",
        question_hi="जब द्वार कोशिकाओं (Guard Cells) में जल प्रवेश करता है, तो रंध्र छिद्र कैसे खुलता है?",
        question_kn="ಕಾವಲು ಕೋಶಗಳಿಗೆ (Guard Cells) ನೀರು ಪ್ರವೇಶಿಸಿದಾಗ ಪತ್ರರಂಧ್ರವು ಹೇಗೆ ತೆರೆದುಕೊಳ್ಳುತ್ತದೆ?",
        options_en=[
            "Guard cells shrink and become flaccid",
            "Guard cells swell and curve outward due to thick inner walls",
            "Guard cells produce wax to seal the opening",
            "Guard cells divide into two new daughter cells"
        ],
        options_hi=[
            "द्वार कोशिकाएं सिकुड़ जाती हैं",
            "द्वार कोशिकाएं फूलकर बाहर की ओर मुड़ जाती हैं क्योंकि उनकी आंतरिक भित्ति मोटी होती है",
            "द्वार कोशिकाएं मोम का स्राव करती हैं",
            "द्वार कोशिकाएं विभाजित हो जाती हैं"
        ],
        options_kn=[
            "ಕಾವಲು ಕೋಶಗಳು ಕುಗ್ಗುತ್ತವೆ",
            "ದಪ್ಪವಾದ ಒಳಗಿನ ಗೋಡೆಗಳ ಕಾರಣ ಕಾವಲು ಕೋಶಗಳು ಉಬ್ಬಿ ಹೊರಮುಖವಾಗಿ ಬಾಗುತ್ತವೆ",
            "ಕಾವಲು ಕೋಶಗಳು ಮೇಣವನ್ನು ಉತ್ಪಾದಿಸುತ್ತವೆ",
            "ಕಾವಲು ಕೋಶಗಳು ವಿಭಜನೆಯಾಗುತ್ತವೆ"
        ],
        correct_option_index=1,
        explanation_en="When turgid with water, differential cell wall elasticity causes guard cells to bow outward, widening the central stomatal pore.",
        explanation_hi="जब द्वार कोशिकाओं में जल भरता है, तो वे फूलकर बाहर की ओर झुक जाती हैं, जिससे रंध्र खुल जाता है।",
        explanation_kn="ನೀರಿನ ಒತ್ತಡ ಹೆಚ್ಚಾದಾಗ ಕಾವಲು ಕೋಶಗಳು ಉಬ್ಬಿ ಹೊರಬಾಗುತ್ತವೆ, ಇದರಿಂದ ರಂಧ್ರ ತೆರೆದುಕೊಳ್ಳುತ್ತದೆ.",
        targeted_concept="Stomata Gas Exchange",
        difficulty="Medium"
    ),
    QuizQuestion(
        id="q-7",
        question_en="In the balanced photosynthesis equation: 6CO2 + 6H2O + Light -> ? + 6O2, what is the stoichiometric yield represented by '?'?",
        question_hi="संतुलित समीकरण (6CO2 + 6H2O + प्रकाश -> ? + 6O2) में '?' किस मुख्य उत्पाद को दर्शाता है?",
        question_kn="ಸಮತೋಲಿತ ಸಮೀಕರಣದಲ್ಲಿ (6CO2 + 6H2O + ಬೆಳಕು -> ? + 6O2), '?' ಗುರುತಿಸಲಾದ ಮುಖ್ಯ ಉತ್ಪನ್ನ ಯಾವುದು?",
        options_en=["Glucose (C6H12O6)", "Methane (CH4)", "Calcium Carbonate (CaCO3)", "Hydrochloric Acid (HCl)"],
        options_hi=["ग्लूकोज (C6H12O6)", "मीथेन (CH4)", "कैल्शियम कार्बोनेट (CaCO3)", "हाइड्रोक्लोरिक एसिड (HCl)"],
        options_kn=["ಗ್ಲೂಕೋಸ್ (Glucose - C6H12O6)", "ಮೀಥೇನ್ (Methane - CH4)", "ಕ್ಯಾಲ್ಸಿಯಂ ಕಾರ್ಬೋನೇಟ್ (CaCO3)", "ಹೈಡ್ರೋಕ್ಲೋರಿಕ್ ಆಮ್ಲ (HCl)"],
        correct_option_index=0,
        explanation_en="6 molecules of carbon dioxide and 6 molecules of water produce exactly 1 molecule of glucose and 6 oxygen molecules.",
        explanation_hi="6 कार्बन डाइऑक्साइड और 6 जल के अणु मिलकर 1 ग्लूकोज अणु और 6 ऑक्सीजन अणु बनाते हैं।",
        explanation_kn="6 ಇಂಗಾಲದ ಡೈಆಕ್ಸೈಡ್ ಮತ್ತು 6 ನೀರಿನ ಅಣುಗಳು ಸೇರಿ 1 ಗ್ಲೂಕೋಸ್ ಮತ್ತು 6 ಆಮ್ಲಜನಕದ ಅಣುಗಳನ್ನು ಉತ್ಪಾದಿಸುತ್ತವೆ.",
        targeted_concept="Balanced Stoichiometry",
        difficulty="Medium"
    ),
    QuizQuestion(
        id="q-8",
        question_en="Why does an iodine test turn a boiled, decolorized leaf blue-black after a 6-hour exposure to sunlight?",
        question_hi="धूप में रखी गई पत्ती को उबालने और आयोडीन डालने पर वह नीला-काला रंग क्यों प्रदर्शित करती है?",
        question_kn="ಸೂರ್ಯನ ಬೆಳಕಿನಲ್ಲಿರಿಸಿದ ಎಲೆಗೆ ಅಯೋಡಿನ್ ದ್ರಾವಣ ಹಾಕಿದಾಗ ಅದು ನೀಲಿ-ಕಪ್ಪು ಬಣ್ಣಕ್ಕೆ ತಿರುಗಲು ಕಾರಣವೇನು?",
        options_en=[
            "Iodine complexes with starch formed during photosynthesis",
            "Iodine reacts with chlorophyll pigment remaining in cell walls",
            "Iodine boils the water content of leaf veins",
            "Iodine oxidizes nitrogen into nitrates"
        ],
        options_hi=[
            "आयोडीन प्रकाश संश्लेषण में बने स्टार्च के साथ नीला-काला संकुल बनाता है",
            "आयोडीन क्लोरोफिल के साथ प्रतिक्रिया करता है",
            "आयोडीन पत्तियों के पानी को सुखा देता है",
            "आयोडीन नाइट्रोजन को नाइट्रेट में बदलता है"
        ],
        options_kn=[
            "ಅಯೋಡಿನ್ ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆಯಿಂದ ಉಂಟಾದ ಪಿಷ್ಟದೊಂದಿಗೆ (ಸ್ಟಾರ್ಚ್) ಸಂಯೋಜನೆಗೊಳ್ಳುತ್ತದೆ",
            "ಅಯೋಡಿನ್ ಕ್ಲೋರೋಫಿಲ್ ಜೊತೆ ವರ್ತಿಸುತ್ತದೆ",
            "ಅಯೋಡಿನ್ ಎಲೆಯ ನೀರನ್ನು ಕುದಿಸುತ್ತದೆ",
            "ಅಯೋಡಿನ್ ಸಾರಜನಕವನ್ನು ಆಕ್ಸಿಡೀಕರಿಸುತ್ತದೆ"
        ],
        correct_option_index=0,
        explanation_en="Triiodide ions slip into the amylose helix structure of starch, creating an intensely visible blue-black chromatic shift.",
        explanation_hi="आयोडीन स्टार्च की अमाइलोज श्रृंखला के साथ मिलकर गहरा नीला-काला रंग उत्पन्न करता है, जो प्रकाश संश्लेषण की पुष्टि करता है।",
        explanation_kn="ಅಯೋಡಿನ್ ಪಿಷ್ಟದೊಂದಿಗೆ ವರ್ತಿಸಿ ಗಾಢ ನೀಲಿ-ಕಪ್ಪು ಬಣ್ಣವನ್ನು ರೂಪಿಸುತ್ತದೆ, ಇದು ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆಯ ಸಾಬೀತುಪಡಿಸುವ ಪರೀಕ್ಷೆಯಾಗಿದೆ.",
        targeted_concept="Iodine Starch Test",
        difficulty="Medium"
    ),
    QuizQuestion(
        id="q-9",
        question_en="If a healthy green potted plant is placed in total darkness for 72 hours (destarched), what happens to its stored starch levels?",
        question_hi="यदि किसी पौधे को 72 घंटे तक अंधेरे में रखा जाए (Destarched), तो उसमें संचित स्टार्च का क्या होगा?",
        question_kn="ಒಂದು ಸಸ್ಯವನ್ನು 72 ಗಂಟೆಗಳ ಕಾಲ ಕತ್ತಲೆಯಲ್ಲಿಟ್ಟರೆ (Destarched), ಅದರೊಳಗಿನ ಸಂಗ್ರಹಿತ ಪಿಷ್ಟದ ಮಟ್ಟ ಏನಾಗುತ್ತದೆ?",
        options_en=[
            "Stored starch increases by 200%",
            "Stored starch is depleted as the plant consumes it for cellular respiration",
            "Starch is converted into chlorophyll crystals",
            "Starch turns into poisonous nitrates"
        ],
        options_hi=[
            "स्टार्च 200% बढ़ जाएगा",
            "संचित स्टार्च समाप्त हो जाएगा क्योंकि पौधा जीवित रहने के लिए श्वसन में उसका उपयोग कर लेता है",
            "स्टार्च क्लोरोफिल में बदल जाता है",
            "स्टार्च जहरीले नाइट्रेट में बदल जाता है"
        ],
        options_kn=[
            "ಪಿಷ್ಟವು 200% ಹೆಚ್ಚಾಗುತ್ತದೆ",
            "ಸಸ್ಯವು ಉಸಿರಾಟ ಮತ್ತು ಶಕ್ತಿಗಾಗಿ ಅದನ್ನು ಬಳಸಿಕೊಳ್ಳುವುದರಿಂದ ಪಿಷ್ಟವು ಖಾಲಿಯಾಗುತ್ತದೆ",
            "ಪಿಷ್ಟವು ಕ್ಲೋರೋಫಿಲ್ ಆಗಿ ಬದಲಾಗುತ್ತದೆ",
            "ಪಿಷ್ಟವು ವಿಷಕಾರಿ ನೈಟ್ರೇಟ್ ಆಗಿ ಬದಲಾಗುತ್ತದೆ"
        ],
        correct_option_index=1,
        explanation_en="Without sunlight, photosynthesis ceases and the plant hydrolyzes its stored starch into glucose for metabolic maintenance.",
        explanation_hi="सूर्य के प्रकाश के बिना प्रकाश संश्लेषण रुक जाता है और पौधा जीवित रहने के लिए अपने स्टार्च का उपयोग कर लेता है।",
        explanation_kn="ಬೆಳಕಿಲ್ಲದ ಕಾರಣ ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ನಿಲ್ಲುತ್ತದೆ ಮತ್ತು ಸಸ್ಯವು ತನ್ನ ಸಂಗ್ರಹಿತ ಪಿಷ್ಟವನ್ನು ಬಳಸಿಕೊಳ್ಳುತ್ತದೆ.",
        targeted_concept="Destarching & Respiration",
        difficulty="Medium"
    ),
    QuizQuestion(
        id="q-10",
        question_en="Analytical Inquiry: In an enclosed greenhouse, CO2 levels are tripled to 1200 ppm, but light intensity is zero (midnight). Will the net rate of glucose synthesis increase?",
        question_hi="विश्लेषणात्मक प्रश्न: एक ग्रीनहाउस में CO2 को तीन गुना (1200 ppm) कर दिया गया है, लेकिन प्रकाश शून्य (रात) है। क्या ग्लूकोज निर्माण की दर बढ़ेगी?",
        question_kn="ವಿಶ್ಲೇಷಣಾತ್ಮಕ ಪ್ರಶ್ನೆ: ಹಸಿರುಮನೆಯಲ್ಲಿ CO2 ಪ್ರಮಾಣವನ್ನು 3 ಪಟ್ಟು ಹೆಚ್ಚಿಸಲಾಗಿದೆ, ಆದರೆ ಬೆಳಕು ಶೂನ್ಯವಾಗಿದೆ. ಗ್ಲೂಕೋಸ್ ಉತ್ಪಾದನೆಯ ದರ ಹೆಚ್ಚಾಗುತ್ತದೆಯೇ?",
        options_en=[
            "Yes, because CO2 is the sole carbon source",
            "No, because light is the essential limiting reactant needed to photolyze water and generate ATP/NADPH",
            "Yes, starch synthesis can occur spontaneously in the dark without energy",
            "No, but oxygen production will quadruple"
        ],
        options_hi=[
            "हाँ, क्योंकि CO2 कार्बन का मुख्य स्रोत है",
            "नहीं, क्योंकि जल के प्रकाशीय अपघटन और ATP/NADPH ऊर्जा निर्माण के लिए प्रकाश अनिवार्य सीमांत कारक (Limiting Factor) है",
            "हाँ, अंधेरे में बिना ऊर्जा के स्टार्च बन सकता है",
            "नहीं, लेकिन ऑक्सीजन उत्पादन चार गुना बढ़ जाएगा"
        ],
        options_kn=[
            "ಹೌದು, ಏಕೆಂದರೆ CO2 ಮುಖ್ಯ ಇಂಗಾಲದ ಮೂಲವಾಗಿದೆ",
            "ಇಲ್ಲ, ಏಕೆಂದರೆ ನೀರಿನ ವಿಭಜನೆ ಮತ್ತು ATP/NADPH ಶಕ್ತಿ ಉತ್ಪಾದನೆಗೆ ಬೆಳಕು ಅತ್ಯಗತ್ಯ ಮಿತಿಯ ಅಂಶವಾಗಿದೆ (Limiting Factor)",
            "ಹೌದು, ಕತ್ತಲೆಯಲ್ಲಿ ಪಿಷ್ಟ ತಾನಾಗಿಯೇ ಉತ್ಪತ್ತಿಯಾಗುತ್ತದೆ",
            "ಇಲ್ಲ, ಆದರೆ ಆಮ್ಲಜನಕ ಉತ್ಪಾದನೆ ನಾಲ್ಕು ಪಟ್ಟು ಹೆಚ್ಚಾಗುತ್ತದೆ"
        ],
        correct_option_index=1,
        explanation_en="Blackman's Law of Limiting Factors dictates that even in abundant CO2, the photochemical light reaction cannot proceed without photon flux.",
        explanation_hi="ब्लैकमैन के सीमांत कारक नियम के अनुसार, प्रचुर CO2 होने पर भी प्रकाश के बिना जल का अपघटन और ऊर्जा निर्माण संभव नहीं है।",
        explanation_kn="ಬ್ಲ್ಯಾಕ್‌ಮ್ಯಾನ್ ನಿಯಮದಂತೆ, ಸಾಕಷ್ಟು CO2 ಇದ್ದರೂ ಬೆಳಕಿನ ಅನುಪಸ್ಥಿತಿಯಲ್ಲಿ ರಾಸಾಯನಿಕ ಶಕ್ತಿ ಉತ್ಪಾದನೆಯಾಗದೆ ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ನಡೆಯುವುದಿಲ್ಲ.",
        targeted_concept="Limiting Reactant Dynamics",
        difficulty="Hard"
    ),
    QuizQuestion(
        id="q-11",
        question_en="Advanced Inquiry: At the 'Light Compensation Point', what is the exact mathematical relationship between photosynthetic CO2 uptake and respiratory CO2 evolution?",
        question_hi="उन्नत प्रश्न: 'प्रकाश क्षतिपूर्ति बिंदु' (Light Compensation Point) पर प्रकाश संश्लेषण द्वारा ली गई CO2 और श्वसन द्वारा छोड़ी गई CO2 का संबंध क्या होता है?",
        question_kn="ಸುಧಾರಿತ ಪ್ರಶ್ನೆ: 'ಬೆಳಕಿನ ಸರಿದೂಗಿಸುವ ಹಂತದಲ್ಲಿ' (Light Compensation Point), ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆಯ CO2 ಹೀರಿಕೊಳ್ಳುವಿಕೆ ಮತ್ತು ಉಸಿರಾಟದ CO2 ಬಿಡುಗಡೆಯ ನಡುವಿನ ನಿಖರ ಸಂಬಂಧವೇನು?",
        options_en=[
            "Photosynthetic CO2 uptake exactly equals respiratory CO2 release (Net gas exchange = 0)",
            "Photosynthetic rate is 10 times higher than respiratory rate",
            "Cellular respiration completely ceases while photosynthesis operates at maximum velocity",
            "CO2 uptake drops to negative infinity"
        ],
        options_hi=[
            "प्रकाश संश्लेषण द्वारा CO2 अवशोषण = श्वसन द्वारा CO2 उत्सर्जन (शुद्ध गैस विनिमय शून्य होता है)",
            "प्रकाश संश्लेषण श्वसन से 10 गुना अधिक होता है",
            "श्वसन पूरी तरह बंद हो जाता है और प्रकाश संश्लेषण चरम पर होता है",
            "CO2 अवशोषण ऋणात्मक हो जाता है"
        ],
        options_kn=[
            "ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆಯ CO2 ಹೀರಿಕೊಳ್ಳುವಿಕೆ = ಉಸಿರಾಟದ CO2 ಬಿಡುಗಡೆ (ಶುದ್ಧ ಅನಿಲ ವಿನಿಮಯ = 0)",
            "ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆಯ ದರವು ಉಸಿರಾಟದ ದರಕ್ಕಿಂತ 10 ಪಟ್ಟು ಹೆಚ್ಚಾಗಿದೆ",
            "ಕೋಶೀಯ ಉಸಿರಾಟ ಸಂಪೂರ್ಣವಾಗಿ ನಿಲ್ಲುತ್ತದೆ",
            "CO2 ಹೀರಿಕೊಳ್ಳುವಿಕೆ ಋಣಾತ್ಮಕವಾಗುತ್ತದೆ"
        ],
        correct_option_index=0,
        explanation_en="At the light compensation point, the rate of CO2 consumption by photosynthesis matches the rate of CO2 generation by cellular respiration.",
        explanation_hi="प्रकाश क्षतिपूर्ति बिंदु पर पौधे द्वारा बनाई जाने वाली ऑक्सीजन और उपयोग की जाने वाली कार्बन डाइऑक्साइड श्वसन क्रिया के बिल्कुल बराबर होती है।",
        explanation_kn="ಈ ಹಂತದಲ್ಲಿ ಸಸ್ಯವು ಸೇವಿಸುವ ಮತ್ತು ಹೊರಸೂಸುವ ಅನಿಲಗಳ ಪ್ರಮಾಣ ಸಮಾನವಾಗಿರುತ್ತದೆ.",
        targeted_concept="Light Compensation Point",
        difficulty="Hard"
    )
]

MOCK_QUIZ = Quiz(
    id="quiz-photo-11",
    plan_id="plan-photo-40-init",
    topic="Photosynthesis: The Plant Food Factory",
    grade=7,
    total_marks=11,
    questions=ALL_11_QUESTIONS
)

class SubmitQuizRequest(BaseModel):
    student_id: str
    answers: Dict[int, int]  # question_index -> selected_option_index

class GenerateAdaptiveQuestionRequest(BaseModel):
    topic: Optional[str] = "Photosynthesis: The Plant Food Factory"
    difficulty: Optional[str] = "Easy"  # "Easy", "Medium", "Hard"
    concept: Optional[str] = "Stomata Gas Exchange"
    student_name: Optional[str] = "Rahul Sharma"
    target_language: Optional[str] = "English"

@router.get("/")
def get_all_quizzes():
    return {
        "count": 1,
        "quizzes": [MOCK_QUIZ.dict()]
    }

@router.get("/{quiz_id}")
def get_quiz(quiz_id: str = "quiz-photo-11"):
    return MOCK_QUIZ.dict()

@router.post("/generate-adaptive")
def generate_adaptive_question(req: GenerateAdaptiveQuestionRequest):
    """
    Uses Groq LPU Ultra-Fast Inference to create a new formative diagnostic question
    calibrated to student difficulty level and concept gaps.
    """
    prompt = f"""Generate a high-quality formative assessment question for NCERT Grade 7 Science.
Topic: {req.topic}
Concept: {req.concept}
Difficulty: {req.difficulty}
Target Learner: {req.student_name}

Respond ONLY with a JSON object adhering to this schema:
{{
  "id": "q-gen-{req.difficulty.lower()}",
  "question": "Crisp, unambiguous question text in English",
  "questionHindi": "Accurate Hindi translation of question",
  "questionKannada": "Accurate Kannada translation of question",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "optionsHindi": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
  "optionsKannada": ["ಆಯ್ಕೆ A", "ಆಯ್ಕೆ B", "ಆಯ್ಕೆ C", "ಆಯ್ಕೆ D"],
  "correctAnswerIndex": 0,
  "explanation": "Clear explanation of why the correct option is right with concept citation",
  "explanationHindi": "हिंदी में सरल स्पष्टीकरण",
  "explanationKannada": "ಕನ್ನಡದಲ್ಲಿ ಸರಳ ವಿವರಣೆ",
  "targetedConcept": "{req.concept}",
  "difficulty": "{req.difficulty}"
}}"""

    system_prompt = "You are a master NCERT Science item-writer and DKT adaptive testing engine. Return ONLY valid JSON."
    
    try:
        raw_resp = groq_service.chat(prompt, system_prompt)
        clean_json = raw_resp.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean_json)
        return {
            "status": "success",
            "provider": "Groq Cloud LPU (qwen/qwen3.8-27b)",
            "generated_question": parsed
        }
    except Exception as e:
        # Fallback question
        fallback_q = {
            "id": f"q-gen-{req.difficulty.lower()}-fb",
            "question": f"Adaptive Check ({req.difficulty}): How does sunlight intensity impact glucose synthesis rate in chloroplasts?",
            "questionHindi": f"अनुकूली जांच ({req.difficulty}): प्रकाश की तीव्रता क्लोरोप्लास्ट में ग्लूकोज निर्माण दर को कैसे प्रभावित करती है?",
            "questionKannada": f"ಹೊಂದಾಣಿಕೆಯ ಪ್ರಶ್ನೆ ({req.difficulty}): ಬೆಳಕಿನ ತೀವ್ರತೆಯು ಕ್ಲೋರೋಪ್ಲಾಸ್ಟ್‌ಗಳಲ್ಲಿ ಗ್ಲೂಕೋಸ್ ಉತ್ಪಾದನೆಯ ಮೇಲೆ ಹೇಗೆ ಪರಿಣಾಮ ಬೀರುತ್ತದೆ?",
            "options": [
                "Rate increases linearly up to saturation point",
                "Rate immediately drops to zero",
                "Rate causes chloroplasts to dissolve",
                "Rate is unaffected by light"
            ],
            "optionsHindi": [
                "संतृप्ति बिंदु तक दर रैखिक रूप से बढ़ती है",
                "दर तुरंत शून्य हो जाती है",
                "क्लोरोप्लास्ट नष्ट हो जाते हैं",
                "प्रकाश से कोई प्रभाव नहीं पड़ता"
            ],
            "optionsKannada": [
                "ಸ್ಯಾಚುರೇಶನ್ ಹಂತದವರೆಗೆ ದರವು ಹೆಚ್ಚಾಗುತ್ತದೆ",
                "ದರವು ಶೂನ್ಯಕ್ಕೆ ಇಳಿಯುತ್ತದೆ",
                "ಕ್ಲೋರೋಪ್ಲಾಸ್ಟ್‌ಗಳು ಕರಗುತ್ತವೆ",
                "ಬೆಳಕಿನಿಂದ ಯಾವುದೇ ಪರಿಣಾಮವಿಲ್ಲ"
            ],
            "correctAnswerIndex": 0,
            "explanation": "Increasing light intensity increases photon absorption until enzymatic capacity or CO2 becomes the limiting factor.",
            "explanationHindi": "प्रकाश की तीव्रता बढ़ने से प्रकाश संश्लेषण की दर संतृप्ति बिंदु तक बढ़ती है।",
            "explanationKannada": "ಬೆಳಕಿನ ತೀವ್ರತೆ ಹೆಚ್ಚಾದಾಗ ಗ್ಲೂಕೋಸ್ ಉತ್ಪಾದನಾ ದರವೂ ಹೆಚ್ಚಾಗುತ್ತದೆ.",
            "targetedConcept": req.concept,
            "difficulty": req.difficulty
        }
        return {
            "status": "fallback",
            "provider": "MINDMESH-NEXUS Fallback Generator",
            "generated_question": fallback_q
        }

@router.post("/{quiz_id}/submit")
def submit_quiz_attempt(quiz_id: str, body: SubmitQuizRequest):
    student = next((s for s in MOCK_STUDENTS if s.id == body.student_id), None)
    student_name = student.name if student else "Rahul Sharma"

    easy_q = [q for q in ALL_11_QUESTIONS if q.difficulty == "Easy"]
    med_q = [q for q in ALL_11_QUESTIONS if q.difficulty == "Medium"]
    hard_q = [q for q in ALL_11_QUESTIONS if q.difficulty == "Hard"]

    easy_correct = 0
    med_correct = 0
    hard_correct = 0
    detailed_feedback = []

    concept_stats: Dict[str, Dict[str, int]] = {}

    for idx, q in enumerate(ALL_11_QUESTIONS):
        chosen = body.answers.get(idx)
        is_correct = chosen == q.correct_option_index

        if q.targeted_concept not in concept_stats:
            concept_stats[q.targeted_concept] = {"correct": 0, "total": 0}
        concept_stats[q.targeted_concept]["total"] += 1

        if is_correct:
            if q.difficulty == "Easy":
                easy_correct += 1
            elif q.difficulty == "Medium":
                med_correct += 1
            elif q.difficulty == "Hard":
                hard_correct += 1
            concept_stats[q.targeted_concept]["correct"] += 1

        detailed_feedback.append({
            "question_index": idx,
            "difficulty": q.difficulty,
            "targeted_concept": q.targeted_concept,
            "is_correct": is_correct,
            "chosen_index": chosen,
            "correct_index": q.correct_option_index,
            "explanation_en": q.explanation_en,
            "explanation_hi": q.explanation_hi,
            "explanation_kn": q.explanation_kn
        })

    # Weighted Level calculation: Easy 1x, Medium 2x, Hard 3x
    weighted_score = (easy_correct * 1) + (med_correct * 2) + (hard_correct * 3)
    max_weighted = (len(easy_q) * 1) + (len(med_q) * 2) + (len(hard_q) * 3)
    level_of_understanding = round((weighted_score / max_weighted) * 100) if max_weighted > 0 else 0

    total_correct = easy_correct + med_correct + hard_correct
    raw_percentage = round((total_correct / len(ALL_11_QUESTIONS)) * 100)

    # Dynamic Topic Clarity Score & Concept Clarity Matrix
    concept_matrix = []
    for c_name, c_val in concept_stats.items():
        pct = round((c_val["correct"] / c_val["total"]) * 100) if c_val["total"] > 0 else 0
        concept_matrix.append({
            "concept": c_name,
            "mastery": pct,
            "correct": c_val["correct"],
            "total": c_val["total"],
            "status": "Mastered" if pct >= 75 else ("Developing" if pct >= 50 else "Needs Reinforcement")
        })

    # DKT Live Status
    risk_gap = max(-50, round(-45 + (level_of_understanding * 0.4)))
    clarity_score = max(10, round(level_of_understanding * 0.85))

    # AI Diagnostic Insight
    if level_of_understanding < 40:
        insight = f"Foundational gaps detected for {student_name} in Stomata Gas Exchange and Balanced Stoichiometry. Recommend reviewing the concrete solar kitchen analogy and glossary before proceeding."
        recommended_next = "LEVEL 1 (EASY)"
    elif level_of_understanding < 75:
        insight = f"Good foundational recall for {student_name}. Recommend practicing multi-step limiting reactant scenarios to strengthen analytical inquiry."
        recommended_next = "LEVEL 2 (MEDIUM)"
    else:
        insight = f"High mastery demonstrated by {student_name}. Ready for advanced analytical inquiry and light compensation problem sets."
        recommended_next = "LEVEL 3 (HARD)"

    # Update student in-memory telemetry
    if student:
        student.calculated_risk_score = max(10.0, 85.0 - (level_of_understanding * 0.8))
        student.risk_level = "low" if student.calculated_risk_score < 40 else ("medium" if student.calculated_risk_score < 70 else "high")

    attempt = QuizAttempt(
        id=f"att-11-{body.student_id}",
        quiz_id=quiz_id,
        student_id=body.student_id,
        student_name=student_name,
        answers=body.answers,
        score=total_correct,
        max_score=len(ALL_11_QUESTIONS),
        percentage=raw_percentage,
        timestamp="Just now",
        remediation_required=level_of_understanding < 50
    )

    return {
        "status": "GRADED",
        "attempt": attempt.dict(),
        "telemetry": {
            "level_of_understanding": level_of_understanding,
            "topic_clarity_score": clarity_score,
            "risk_gap": risk_gap,
            "difficulty_breakdown": {
                "easy": {
                    "label": "LEVEL 1 · EASY",
                    "sublabel": "Foundational Recall",
                    "correct": easy_correct,
                    "total": len(easy_q),
                    "percentage": round((easy_correct / len(easy_q)) * 100) if easy_q else 0
                },
                "medium": {
                    "label": "LEVEL 2 · MEDIUM",
                    "sublabel": "Conceptual Mechanism",
                    "correct": med_correct,
                    "total": len(med_q),
                    "percentage": round((med_correct / len(med_q)) * 100) if med_q else 0
                },
                "hard": {
                    "label": "LEVEL 3 · HARD",
                    "sublabel": "Analytical Inquiry",
                    "correct": hard_correct,
                    "total": len(hard_q),
                    "percentage": round((hard_correct / len(hard_q)) * 100) if hard_q else 0
                }
            },
            "concept_matrix": concept_matrix,
            "ai_diagnostic_insight": insight,
            "recommended_next": recommended_next
        },
        "detailed_feedback": detailed_feedback,
        "updated_student_risk_score": student.calculated_risk_score if student else None
    }
