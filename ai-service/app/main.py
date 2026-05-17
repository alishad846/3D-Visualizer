from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import voice, model_gen, recognition, recommendations
from app.config import settings

app = FastAPI(
    title="ScanVista AI Service",
    description="Python FastAPI service powering ScanVista's 3D AI and Voice capabilities.",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(voice.router, prefix="/api/ai/voice", tags=["Voice Assistant"])
app.include_router(model_gen.router, prefix="/api/ai/generate", tags=["3D Generation"])
app.include_router(recognition.router, prefix="/api/ai/recognition", tags=["Object Recognition"])
app.include_router(recommendations.router, prefix="/api/ai/recommend", tags=["Recommendations"])

@app.get("/health")
def health_check():
    return {"status": "OK", "service": "ScanVista AI Service (FastAPI)"}