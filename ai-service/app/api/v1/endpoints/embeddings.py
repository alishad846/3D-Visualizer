import logging
from fastapi import APIRouter
from app.schemas.embeddings import EmbeddingGenerationRequest, EmbeddingGenerationResponse
from app.utils.text import flatten_product_to_text
from app.engines.embedding import embedding_engine

logger = logging.getLogger("scanvista.api.v1.embeddings")
router = APIRouter()

@router.post("/", response_model=EmbeddingGenerationResponse)
async def generate_product_embeddings(request: EmbeddingGenerationRequest):
    """
    Product creation webhook. Flattens brand, tagline, description, features,
    and specifications JSONB, generating a 1536 float embedding vector.
    """
    logger.info(f"Received embedding generation request for product '{request.productId}'")
    
    # 1. Convert complex product specs dict to flat text
    product_dict = request.model_dump()
    flat_text = flatten_product_to_text(product_dict)
    
    # 2. Call embedding engine
    vector = await embedding_engine.generate(flat_text)
    
    return EmbeddingGenerationResponse(
        productId=request.productId,
        embedding=vector,
        model_version="text-embedding-ada-002"
    )
