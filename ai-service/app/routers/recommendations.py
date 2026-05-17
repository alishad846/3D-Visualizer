from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_recommendations():
    return {"status": "active", "module": "ai_router_recommendations"}