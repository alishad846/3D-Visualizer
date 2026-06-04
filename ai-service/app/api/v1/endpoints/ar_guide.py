import logging
from fastapi import APIRouter
from app.schemas.ar_guide import ARGuideRequest, ARGuideResponse
from app.middleware.sanitizer import input_sanitizer
from app.middleware.validator import response_validator
from app.services.ar_guide import ar_guide_service

logger = logging.getLogger("scanvista.api.v1.ar_guide")
router = APIRouter()

@router.post("/", response_model=ARGuideResponse)
async def ar_guide_query(request: ARGuideRequest):
    """
    Spatial AR narrator micro-guidance endpoint (Layer 2).
    Generates single-sentence guides, glow anchors, and walkthrough step highlights.
    """
    logger.info(f"Received AR guidance request for product '{request.productId}' on mesh '{request.focusedComponentId}'")
    
    # 1. Input Sanitization
    request.query = input_sanitizer.sanitize_text(request.query)
    if request.focusedComponentId:
        request.focusedComponentId = input_sanitizer.sanitize_text(request.focusedComponentId)
        
    # 2. Process spatial logic
    response = await ar_guide_service.process_ar_guidance(request)
    
    # 3. Response leakage audit
    response.microGuidance = response_validator.validate_and_clean_response(response.microGuidance)
    if response.walkthroughStep:
        response.walkthroughStep = response_validator.validate_and_clean_response(response.walkthroughStep)
        
    return response
