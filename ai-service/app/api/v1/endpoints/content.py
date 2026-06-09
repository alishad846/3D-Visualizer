import logging
from fastapi import APIRouter, HTTPException
from app.schemas.content import ContentGenerationRequest, ContentGenerationResponse
from app.engines.content import content_engine

logger = logging.getLogger("scanvista.api.v1.content")
router = APIRouter()

@router.post("/generate", response_model=ContentGenerationResponse)
async def generate_product_content(request: ContentGenerationRequest):
    """
    Generate product AI summary and suggested use cases using OpenAI.
    Bypasses mock fallback if API key is present but fails, so that Node.js
    can catch the failure and preserve previously generated database values.
    """
    logger.info(f"Received content generation request for product '{request.productId}'")
    try:
        product_dict = request.model_dump()
        result = await content_engine.generate_content(product_dict)
        return ContentGenerationResponse(
            productId=request.productId,
            summary=result["summary"],
            use_cases=result["use_cases"]
        )
    except Exception as e:
        logger.error(f"Error in generate_product_content: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Content generation failed: {str(e)}"
        )
