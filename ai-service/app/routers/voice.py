from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_voice():
    return {"status": "active", "module": "ai_router_voice"}