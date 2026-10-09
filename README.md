# HR2-OI-DA102E89
**HACKERING 2.0 Round 2 Project Repository for Team The Big O (Voice AI Track)**

---

# 🎙️ MINDMESH-NEXUS — Agentic Voice AI Teaching Co-Pilot

> **Track: AI-01 / HR26-AI-02 (Learning Experiences)**  
> **Team: The Big O**  
> An autonomous, voice-first AI teaching co-pilot and learning experience platform powered by **Digital India Bhashini (NLTM)** Indic Voice AI, **Agnes 3.0 Flash (512K Context)**, and **Graph Neural Networks (GNN)**.

---

## 🌟 Executive Summary & Impact

**MINDMESH-NEXUS** empowers educators and students to interact with curriculum and adaptive learning systems entirely through natural voice in **English**, **Hindi**, and **Kannada**.

A teacher or student simply speaks:
- *"Schedule a class for me in 10 min on Computer Networks TCP Flow Control"*
- *"My student Rahul Sharma is weak in Slow Start, schedule an intervention review and reassessment"*
- *"Edit marks for Aarav Sharma to 9 out of 10 in Slow Start"*
- *"I need a 40-minute Grade 7 science lesson on photosynthesis in English, Hindi, and Kannada. Three students need simpler explanations, and the exam is next week."*
- *"The class is behind; reduce this to 20 minutes."*
- *"What is photosynthesis and how do stomata regulate gas exchange?"*

The system orchestrates an end-to-end agentic workflow:
1. **Digital India Bhashini Indic Voice Engine**: Real-time noise-suppressed 16kHz audio capture with live waveform visualizer, Indic ASR (AI4Bharat Conformer), and natural IndicTTS synthesis.
2. **Whole-Curriculum Grounding (512K Context)**: Semantic pgvector search against uploaded textbook PDFs and curriculum guidelines.
3. **Source Conflict & Trust Resolution**: Detects outdated notes (e.g., archived 2021 notes with obsolete stoichiometry vs 2026 NCERT textbook), assigns trust scores (98% vs 42%), and transparently flags reasons for exclusion.
4. **Predictive Learner-Gap Risk Model (GNN / DKT)**: Identifies students at risk before exams (e.g., Aarav, Priya, Rohan) and inserts proactive "Plant Kitchen" scaffolds and bilingual glossaries.
5. **Differentiated Multi-Tier Lesson Plans**:
   - 🟢 **Beginner Scaffold** ("Plant Kitchen" analogy, visual cues, Hindi/Kannada glossary)
   - 🔵 **Standard 5-Phase Sequence** (Hook, Direct Instruction, Guided Practice, Formative Check, Wrap-up)
   - 🟣 **Advanced Inquiry** (Calvin Cycle & light spectrum experiment for high-mastery learners)
   - 🖼️ **Visual Scientific Diagrams** (High-resolution AI diagrams with interactive hotspots)
   - 🌐 **Multilingual (English, Hindi, Kannada)** side-by-side and toggled classroom delivery.
6. **Dynamic Real-Time Voice Replanning**: Teacher says *"The class is behind; reduce this to 20 minutes"* → Agent instantly compresses the timeline, preserves critical scaffolds, and explains modifications.
7. **Teacher Approval & Governance**: Human-in-the-loop state machine (`Draft` → `Reviewing` → `Approved` → `Delivered`) requiring explicit approval before publishing to learners.
8. **Interactive Student Delivery & Living Learning Twins**: Socratic multimodal workspace with voice chat, visual diagrams, and formative checkpoints with instant telemetry updates.

---

## 🚀 Architecture & Tech Stack

| Layer | Technology | Role |
|---|---|---|
| **Voice AI (Primary)** | Digital India Bhashini (NLTM / ULCA / AI4Bharat) | Indic ASR (Conformer), IndicTTS (FastSpeech2), IndicTrans2 translation |
| **Voice AI (Streaming)** | Web Speech API (SpeechRecognition + SpeechSynthesis) | Zero-latency interim transcript streaming & client speech synthesis |
| **Audio Capture** | MediaRecorder + Web Audio API AnalyserNode | 16kHz PCM audio buffer recording with real-time waveform visualizer |
| **Frontend** | React 18, Vite 6, TypeScript, Tailwind CSS, Lucide Icons | Teacher dashboard, learner portal, audio waveform visualizer, mobile dock |
| **Intelligence Brain** | Agnes 3.0 Flash (512K Context) + FastAPI | Whole-curriculum reasoning, multi-tier lesson generation, rate-limited gateway |
| **GNN / DKT Engine** | PyTorch, PyTorch Geometric, scikit-learn | Graph Neural Network and Deep Knowledge Tracing for learner risk prediction |
| **Governance & Delivery** | Interactive Approval State Machine | Teacher approval gate, student delivery simulator, cross-tab state sync |

---

## 🎯 How the 3 Mandatory Hackathon Objectives are Solved

| Mandatory Requirement | Implementation in MINDMESH-NEXUS |
|---|---|
| **1. Adapt to Learner Needs** | Student profiles with pace, language preferences (Hindi, Kannada, English, Bilingual), and 3-tier differentiated lesson plans (Beginner "Plant Kitchen", Standard Curriculum, Advanced Inquiry). |
| **2. Predict Future Gaps** | ML predictive risk scoring (0–100%) correlated with historical quiz telemetry, identifying 3 high-risk students (Aarav Sharma 86%, Rohan Verma 84%, Priya Patel 78%) before the upcoming exam with proactive remedial interventions. |
| **3. Resolve Source Conflicts** | Autonomous comparison of uploaded materials, assigning trust ratings (NCERT 2026: 98% vs Old 2021 Notes: 42%), citing exact pages (pp. 12–16), and explaining why conflicting notes are ignored. |

---

## 🛠️ Quick Start & Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Vite Dev Server
```bash
npm run dev
```
Open `http://localhost:3000/` in your browser.

### 3. Start Python FastAPI Backend Brain
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### 4. Build Production Bundle
```bash
npm run build
```
*(Verified: TypeScript 5 & Vite 6 compilation with 0 errors)*
