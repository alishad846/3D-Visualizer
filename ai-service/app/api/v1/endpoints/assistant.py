import logging
from fastapi import APIRouter
from app.schemas.assistant import VoiceAssistantRequest, VoiceAssistantResponse
from app.middleware.sanitizer import input_sanitizer
from app.middleware.validator import response_validator
from app.services.assistant import assistant_service

logger = logging.getLogger("scanvista.api.v1.assistant")
router = APIRouter()

@router.post("/", response_model=VoiceAssistantResponse)
async def voice_assistant_query(request: VoiceAssistantRequest):
    """
    Stateless conversational assistant entry point.
    Product data and competitors are pre-fetched by Node.js and injected in the request body.
    Python owns: input sanitization, intent classification, prompt assembly, LLM call, output validation.
    """
    product_name = request.product.get("name", str(request.product.get("id", "unknown")))
    logger.info(f"Received conversational query for product '{product_name}'")
    # 1. Boundary Input Sanitization
    request.query = input_sanitizer.sanitize_text(request.query)
    
    # 2. Process query via conversational logic service
    response = await assistant_service.process_voice_query(request)
    
    # 3. Post-AI response leakage cleaning
    response.responseText = response_validator.validate_and_clean_response(response.responseText)
    response.speechPayload = response_validator.validate_and_clean_response(response.speechPayload)
    
    return response
