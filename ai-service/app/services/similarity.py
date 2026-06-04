import logging
from app.core.db import db

logger = logging.getLogger("scanvista.services.similarity")

class SimilarityService:
    def _cosine_similarity(self, v1: list[float], v2: list[float]) -> float:
        """Calculate pure Python cosine similarity between two float vectors."""
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
            
        dot_product = sum(x * y for x, y in zip(v1, v2))
        norm_v1 = sum(x * x for x in v1) ** 0.5
        norm_v2 = sum(x * x for x in v2) ** 0.5
        
        if norm_v1 * norm_v2 == 0:
            return 0.0
            
        return dot_product / (norm_v1 * norm_v2)

    def _calculate_tag_match(self, p1: dict, p2: dict) -> float:
        """
        Calculate tag matches based on brand, category, and price proximity.
        Returns a score between 0.0 and 1.0.
        """
        brand1 = (p1.get("brand") or "").strip().lower()
        brand2 = (p2.get("brand") or "").strip().lower()
        brand_score = 1.0 if brand1 and brand1 == brand2 else 0.0

        cat1 = (p1.get("category") or "").strip().lower()
        cat2 = (p2.get("category") or "").strip().lower()
        cat_score = 1.0 if cat1 and cat1 == cat2 else 0.0

        # Price range proximity (normalized diff)
        price1 = float(p1.get("price") or 0)
        price2 = float(p2.get("price") or 0)
        
        if price1 > 0 and price2 > 0:
            price_score = 1.0 - min(1.0, abs(price1 - price2) / max(price1, price2))
        else:
            price_score = 0.5  # Neutral fallback

        # Weighted combination: 33% brand, 33% category, 34% price
        return (0.33 * brand_score) + (0.33 * cat_score) + (0.34 * price_score)

    def _calculate_spec_overlap(self, p1: dict, p2: dict) -> float:
        """
        Calculate technical specification key overlaps.
        Returns the Jaccard similarity of spec keys.
        """
        specs1 = p1.get("specs") or []
        specs2 = p2.get("specs") or []

        keys1 = {s.get("key").strip().lower() for s in specs1 if isinstance(s, dict) and s.get("key")}
        keys2 = {s.get("key").strip().lower() for s in specs2 if isinstance(s, dict) and s.get("key")}

        if not keys1 or not keys2:
            return 0.0

        intersection = keys1.intersection(keys2)
        union = keys1.union(keys2)

        return len(intersection) / len(union)

    async def get_similar_products(self, product_id: str, max_candidates: int = 4) -> list[dict]:
        """
        Retrieves candidate comparison/recommendation products from database
        using our hybrid scoring formula.
        """
        primary = await db.get_product_by_id(product_id)
        if not primary:
            logger.warning(f"Primary product '{product_id}' not found for similarity matches.")
            return []

        primary_emb = await db.get_embeddings(product_id)
        all_products = await db.get_all_products()
        all_embeddings = await db.get_all_embeddings()

        scored_candidates = []
        
        for prod in all_products:
            prod_id_str = str(prod["id"])
            if prod_id_str == str(product_id):
                continue  # skip self comparison
            
            # 1. Cosine similarity of embeddings (50%)
            prod_emb = all_embeddings.get(prod_id_str)
            if primary_emb and prod_emb:
                emb_score = self._cosine_similarity(primary_emb, prod_emb)
            else:
                emb_score = 0.5  # Neutral fallback

            # 2. Tag match (30%)
            tag_score = self._calculate_tag_match(primary, prod)

            # 3. Spec key overlap (20%)
            spec_score = self._calculate_spec_overlap(primary, prod)

            # Unified formula
            final_score = (0.5 * emb_score) + (0.3 * tag_score) + (0.2 * spec_score)
            
            scored_candidates.append({
                "product": prod,
                "score": final_score
            })

        # Sort by hybrid score descending
        scored_candidates.sort(key=lambda x: x["score"], reverse=True)
        
        # Extract top candidates
        top_candidates = [item["product"] for item in scored_candidates[:max_candidates]]
        logger.info(f"Identified {len(top_candidates)} similarity candidates for product '{product_id}'")
        return top_candidates

similarity_service = SimilarityService()
