from fastapi import APIRouter
from app.api.v1.endpoints import assistant, ar_guide, comparison, embeddings, content

api_router = APIRouter()

# Register all endpoints cleanly under versioned router
api_router.include_router(assistant.router, prefix="/assistant", tags=["Layer 1 Conversational Assistant"])
api_router.include_router(ar_guide.router, prefix="/ar-guide", tags=["Layer 2 Spatial AR Guide"])
api_router.include_router(comparison.router, prefix="/comparison", tags=["Layer 3 Side-by-Side Comparisons"])
api_router.include_router(embeddings.router, prefix="/embeddings", tags=["Product Embedding Webhook"])
api_router.include_router(content.router, prefix="/content", tags=["Product AI Content Generation"])
