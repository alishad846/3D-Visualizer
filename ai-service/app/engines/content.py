import logging
import json
from app.core.ai_client import ai_client

logger = logging.getLogger("scanvista.engines.content")

CONTENT_GENERATION_SYSTEM_PROMPT = """You are the AI Content Generator for ScanVista.
Your task is to generate premium, engaging, and professional customer-facing content for a product based STRICTLY on the provided product details.

Instructions:
1. Generate an 'summary':
   - Must be 2-4 concise paragraphs.
   - Use customer-friendly, professional, and clear language.
   - Based strictly on the provided product details (name, brand, category, tagline, description, features, specs).
   - Do NOT invent claims, compatibility details, or hallucinate any facts.
2. Generate 'use_cases':
   - An array of practical, customer-facing use cases.
   - Derived only from the provided product details.
   - Return a maximum of 5 items.
   - Each item must be a short, clear, and practical sentence.

You MUST format your response as a strict JSON object conforming precisely to the following structure:
{
  "summary": "The generated 2-4 paragraph customer-facing summary.",
  "use_cases": [
    "Use case 1 description",
    "Use case 2 description",
    "Use case 3 description"
  ]
}
"""

class ContentEngine:
    async def generate_content(self, product: dict) -> dict:
        """
        Generates product summary and use cases using LLM in JSON mode.
        """
        name = product.get("name", "Product")
        brand = product.get("brand", "Unknown")
        category = product.get("category", "General")
        description = product.get("description", "")
        tagline = product.get("tagline", "")
        features = product.get("features", [])
        specs = product.get("specs", [])

        features_str = ", ".join(features) if isinstance(features, list) else str(features)
        specs_str = "\n".join([f"- {s.get('key')}: {s.get('value')}" for s in specs if isinstance(s, dict)])

        product_context = f"""Product Name: {name}
Brand: {brand}
Category: {category}
Tagline: {tagline}
Description: {description}
Key Features: {features_str}
Specifications:
{specs_str}"""

        user_prompt = f"""Generate summary and use cases for the following product details:
<product_details>
{product_context}
</product_details>"""

        logger.info(f"Generating AI summary & use cases for product '{name}' (ID: {product.get('productId')})...")

        # We query the LLM. If self.client is configured, we set fallback_to_mock=False 
        # so that errors bubble up to Node.js, preserving existing DB content.
        response_json = await ai_client.ask_llm(
            system_prompt=CONTENT_GENERATION_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            json_mode=True,
            temperature=0.3,
            fallback_to_mock=False
        )

        try:
            data = json.loads(response_json)
            summary = data.get("summary", "").strip()
            use_cases = data.get("use_cases", [])
            
            if not summary:
                raise ValueError("LLM returned empty summary")
            if not isinstance(use_cases, list):
                use_cases = []
            
            # Limit use cases to maximum 5 items
            use_cases = [str(uc).strip() for uc in use_cases if uc][:5]
            
            return {
                "summary": summary,
                "use_cases": use_cases
            }
        except Exception as e:
            logger.error(f"Failed to generate and parse AI content: {e}. Raw response: {response_json}", exc_info=True)
            raise e

content_engine = ContentEngine()
