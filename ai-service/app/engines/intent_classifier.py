import logging
import json
from app.core.ai_client import ai_client

logger = logging.getLogger("scanvista.engines.intent_classifier")

CLASSIFICATION_SYSTEM_PROMPT = """You are the NLP router for ScanVista's Product Intelligence Engine.
Your sole job is to classify the user's incoming query about a product into exactly ONE of the following 5 intents:

1. 'explore': Triggers when the user asks general, open-ended questions like "what is this?", "tell me about this", "show details", or upon first scanning the QR code.
2. 'understand': Triggers when the user asks about a specific feature, how a part works, manual instructions, technical specifications, or warranty details (e.g. "how long does the battery last?", "is it waterproof?").
3. 'compare': Triggers when the user asks to compare with another brand, model, competitor, or general alternatives (e.g. "compare with brand X", "is this better than others?", "vs").
4. 'recommend': Triggers when the user asks for other suggestions, adjacent models, similar items, or upsell recommendations (e.g. "what else do you have?", "similar products").
5. 'buy_decide': Triggers when the user is trying to make a final purchase decision, asking for reviews, pros/cons, rating, value-for-money, or purchase advice (e.g. "should I buy this?", "is it worth it?", "what is the verdict?").

You MUST return a JSON object in this exact format:
{
  "intent": "explore" | "understand" | "compare" | "recommend" | "buy_decide",
  "confidence": 0.0 to 1.0,
  "reasoning": "A brief explanation of why this classification was chosen"
}
"""

class IntentClassifier:
    async def classify(self, query: str) -> str:
        """
        Classifies incoming conversational queries using LLM with JSON mode,
        defaulting to 'explore' on failures.
        """
        if not query or not query.strip():
            return "explore"

        user_prompt = f"Query to classify: \"{query}\""
        
        try:
            response_json = await ai_client.ask_llm(
                system_prompt=CLASSIFICATION_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                json_mode=True,
                temperature=0.0 # strict classification
            )
            
            data = json.loads(response_json)
            intent = data.get("intent", "explore").strip().lower()
            
            valid_intents = {"explore", "understand", "compare", "recommend", "buy_decide"}
            if intent in valid_intents:
                logger.info(f"Classified query '{query[:30]}...' as '{intent}' (confidence: {data.get('confidence')})")
                return intent
                
        except Exception as e:
            logger.error(f"Failed to classify query intent: {e}", exc_info=True)

        # Simple rule-based heuristics fallback
        return self._fallback_classify(query)

    def _fallback_classify(self, query: str) -> str:
        """Robust heuristics fallback for zero-downtime offline execution."""
        q = query.lower()
        if any(w in q for w in ["compare", "vs", "versus", "difference", "different", "alternative"]):
            return "compare"
        if any(w in q for w in ["recommend", "similar", "other", "suggest", "like this", "what else"]):
            return "recommend"
        if any(w in q for w in ["buy", "purchase", "worth", "should i", "verdict", "score", "reviews"]):
            return "buy_decide"
        if any(w in q for w in ["how", "why", "what is", "explain", "spec", "waterproof", "battery", "warranty", "dimension", "weight"]):
            return "understand"
        return "explore"

intent_classifier = IntentClassifier()
