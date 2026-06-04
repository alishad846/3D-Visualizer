import logging
from app.core.ai_client import ai_client

logger = logging.getLogger("scanvista.engines.embedding")

class EmbeddingEngine:
    async def generate(self, text: str) -> list[float]:
        """Generate float vector embedding representation of the given text."""
        if not text or not text.strip():
            logger.warning("Empty text passed for embedding generation.")
            return [0.0] * 1536
            
        logger.info(f"Generating semantic embedding for text (length: {len(text)})...")
        return await ai_client.generate_embedding_vector(text)

embedding_engine = EmbeddingEngine()
