from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_recognition():
    return {"status": "active", "module": "ai_router_recognition"}