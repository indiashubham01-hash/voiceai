"""
MINDMESH-NEXUS: Autonomous Voice-First AI Teaching Co-Pilot Backend Brain
FastAPI Gateway with Epistemic Trust Engine, DKT Knowledge Tracing, and Agnes 3.0 Flash 512K Loop.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.voice import router as voice_router
from .routes.resources import router as resources_router
from .routes.learners import router as learners_router
from .routes.plans import router as plans_router
from .routes.quizzes import router as quizzes_router
from .routes.gnn_routes import router as gnn_router
from .routes.auth_routes import router as auth_router
from .routes.agnes_routes import router as agnes_router
from .routes.bhashini_routes import router as bhashini_router
from .routes.gemini_routes import router as gemini_router
from .routes.groq_routes import router as groq_router
from .routes.engineering_model_routes import router as engineering_router
from .services.agnes_client import AgnesService, token_queue

app = FastAPI(
    title="MINDMESH-NEXUS Backend Brain",
    description="Autonomous Voice-First AI Teaching Co-Pilot Backend with Groq Cloud LPU, Graph Neural Network (GNN), Google Gemini, Agnes 3.0 Flash, Digital India Bhashini Indic Voice AI, and EngineeringConcepts-Instruct-v1 Fine-Tuning Engine",
    version="2.5.0"
)

# Enable CORS for frontend dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All Routers
app.include_router(auth_router)
app.include_router(voice_router)
app.include_router(resources_router)
app.include_router(learners_router)
app.include_router(plans_router)
app.include_router(quizzes_router)
app.include_router(gnn_router)
app.include_router(agnes_router)
app.include_router(bhashini_router)
app.include_router(gemini_router)
app.include_router(groq_router)
app.include_router(engineering_router)

@app.get("/")
def root_info():
    return {
        "project": "MINDMESH-NEXUS",
        "description": "Voice-First AI Teaching Co-Pilot (The Brain)",
        "platform_url": "https://platform.agnes-ai.com",
        "api_base_url": "https://apihub.agnes-ai.com/v1",
        "primary_llm": "agnes-3.0-flash (512K Context, Tool Calling)",
        "visual_model": "agnes-image-2.5-flash (1024x1024)",
        "rate_limit": "10 RPM Token Bucket Queue (Free Plan Compliant)",
        "endpoints": [
            "POST /voice-request",
            "POST /resources/upload",
            "POST /plans/generate",
            "POST /plans/{plan_id}/revise",
            "POST /plans/{plan_id}/approve",
            "GET  /learners/{student_id}/profile",
            "GET  /class/{class_id}/risk-report",
            "POST /quizzes/{quiz_id}/submit"
        ],
        "governance_rule": "Never let the AI silently publish content. Requires explicit teacher approval."
    }

@app.get("/api/system/status")
def system_status():
    return {
        "project": "MINDMESH-NEXUS",
        "status": "OPERATIONAL",
        "rpm_limit": 10,
        "token_queue_interval_seconds": 6.0,
        "active_models": {
            "llm": "agnes-3.0-flash",
            "image": "agnes-image-2.5-flash",
            "video": "agnes-video-2.5",
            "nli": "cross-encoder/nli-deberta-v3-small",
            "dkt": "LSTM-Knowledge-State"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
