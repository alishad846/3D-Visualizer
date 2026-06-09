import logging
import json
import re
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger("scanvista.ai_client")

class AIClient:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        if self.api_key:
            logger.info("Initializing OpenAI AsyncOpenAI client...")
            self.client = AsyncOpenAI(api_key=self.api_key)
        else:
            logger.warning("OPENAI_API_KEY not configured. Product Intelligence Engine running in mock mode.")
            self.client = None

    async def ask_llm(self, system_prompt: str, user_prompt: str, json_mode: bool = False, temperature: float = 0.3, fallback_to_mock: bool = True) -> str:
        """Query LLM asynchronously, with robust context-aware mock fallback when keys are missing."""
        if self.client:
            try:
                response_format = {"type": "json_object"} if json_mode else None
                completion = await self.client.chat.completions.create(
                    model="gpt-4-turbo",  # standard stable model
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=temperature,
                    response_format=response_format,
                    timeout=15.0
                )
                return completion.choices[0].message.content.strip()
            except Exception as e:
                logger.error(f"Error querying OpenAI LLM: {e}.", exc_info=True)
                if not fallback_to_mock:
                    raise e
                logger.info("Falling back to mock engine.")

        # Context-aware deterministic mock engine
        return self._generate_mock_response(system_prompt, user_prompt, json_mode)

    async def generate_embedding_vector(self, text: str) -> list[float]:
        """Generate a 1536-dimensional embedding vector via OpenAI embeddings API or deterministic mock fallback."""
        if self.client:
            try:
                response = await self.client.embeddings.create(
                    model="text-embedding-ada-002",
                    input=[text]
                )
                return response.data[0].embedding
            except Exception as e:
                logger.error(f"Error generating OpenAI embeddings: {e}. Falling back to mock embeddings.", exc_info=True)

        # Return a deterministic mock vector of 1536 floats based on the text hash
        return self._generate_mock_embedding(text)

    def _generate_mock_response(self, system_prompt: str, user_prompt: str, json_mode: bool) -> str:
        """Internal context-aware generator yielding rich mocked details per intent."""
        # Extract target query
        query = user_prompt
        match = re.search(r"<user_query>(.*?)</user_query>", user_prompt, re.DOTALL)
        if match:
            query = match.group(1).strip()
        user_lower = query.lower()
        
        # Determine intent from query keywords
        intent = "explore"
        if "unknown" in user_lower:
            intent = "unknown"
        elif any(w in user_lower for w in ["how", "why", "explain", "spec", "feature", "battery", "warranty", "dimension"]):
            intent = "understand"
        elif any(w in user_lower for w in ["vs", "compare", "difference"]):
            intent = "compare"
        elif any(w in user_lower for w in ["recommend", "similar", "what else"]):
            intent = "recommend"
        elif any(w in user_lower for w in ["buy", "worth", "should i"]):
            intent = "buy_decide"

        # Check if this is the content generator
        is_content_generator = "content generator" in system_prompt.lower()
        if is_content_generator:
            prod_name_match = re.search(r"Product Name:\s*([^\n]+)", user_prompt, re.IGNORECASE)
            prod_name = prod_name_match.group(1).strip() if prod_name_match else "ScanVista Premium Item"
            if json_mode:
                return json.dumps({
                    "summary": f"The {prod_name} is an industry-leading product designed to elevate your spatial and interactive experiences. With high-fidelity engineering and a design tailored for reliability, it integrates seamlessly into modern workflows to provide optimized performance and maximum durability.\n\nCrafted using premium materials, it delivers robust utility and satisfies high standards of capability. Whether used in professional environments or personal settings, this product stands out as a highly versatile and dependable solution.",
                    "use_cases": [
                        f"Ideal for professional environments requiring {prod_name}.",
                        "Optimized for high-demand, daily usage operations.",
                        "Enables seamless integration and rapid deployment."
                    ]
                })
            return "Summary: Mocked summary. Use cases: Mocked use cases."

        # Check for spatial AR guide triggers
        is_ar_guide = "ar_guide" in system_prompt.lower() or "spatial" in system_prompt.lower()

        if is_ar_guide:
            # AR Guidance mock
            match = re.search(r"focused component ID:\s*([^\n,]+)", user_prompt, re.IGNORECASE)
            comp_id = match.group(1).strip() if match else "main_assembly"
            
            action_match = re.search(r"action:\s*([^\n,]+)", user_prompt, re.IGNORECASE)
            action = action_match.group(1).strip() if action_match else "view"
            
            clean_comp_name = comp_id.replace("_", " ").title()

            if json_mode:
                return json.dumps({
                    "componentName": clean_comp_name,
                    "microGuidance": f"The {clean_comp_name} is currently aligned. Select parts to analyze structural features.",
                    "highlightInstruction": f"glow:{comp_id}:#00F0FF" if comp_id != "main_assembly" else "glow:all",
                    "walkthroughStep": f"Step 2: Inspecting structural component {clean_comp_name}."
                })
            else:
                return f"Component: {clean_comp_name}. Guidance: The part is fully functional. Active highlighting is on."

        # Check if this is the comparison engine (Layer 3 dedicated comparison API endpoint)
        is_comparison_engine = "comparison engine" in system_prompt.lower()

        if is_comparison_engine:
            if json_mode:
                return json.dumps({
                    "comparisonMatrix": [
                        {"metric": "Category", "primary": "Current Product", "competitor": "Alternative A", "winner": "tie"},
                        {"metric": "Pricing", "primary": "Competitive", "competitor": "Standard", "winner": "primary"},
                        {"metric": "Feature Depth", "primary": "Advanced Smart Sync", "competitor": "Basic Bluetooth", "winner": "primary"}
                    ],
                    "similarities": ["They share primary category classifications and physical casing sizes."],
                    "differences": ["Current product has advanced spatial computing integrations and custom hardware components."],
                    "topRecommendId": "d1234567-89ab-cdef-0123-456789abcdef",
                    "rationale": "The primary product outperforms competitors on build quality and real-time response latency."
                })
            return "Comparison: The primary product offers a higher feature depth and superior integration compared to alternative options."

        # conversational prompts mocks
        # Extract product details from context if present
        prod_name_match = re.search(r"Product Name:\s*([^\n]+)", system_prompt, re.IGNORECASE)
        prod_name = prod_name_match.group(1).strip() if prod_name_match else "ScanVista Premium Item"

        # 1. EXPLORE INTENT
        if intent == "explore":
            if json_mode:
                return json.dumps({
                    "intent": "explore",
                    "confidence": "high",
                    "responseText": f"Welcome! This is {prod_name}. It represents top-tier engineering designed to give you an immersive spatial ownership experience.",
                    "speechPayload": f"Welcome! This is the {prod_name}. Experience premium design in full 3D.",
                    "usedProductFields": ["name", "features", "specs"],
                    "missingFields": [],
                    "suggestedActions": ["View Features", "Explore Internals", "Check Pricing"],
                    "recommendedProductIds": []
                })
            return f"Welcome! This is {prod_name}. It represents top-tier engineering designed to give you an immersive spatial ownership experience."

        # 2. UNDERSTAND INTENT
        elif intent == "understand":
            target_topic = "operation"
            if "battery" in user_lower: target_topic = "Battery Life"
            elif "water" in user_lower or "proof" in user_lower: target_topic = "Water Resistance"
            elif "size" in user_lower or "dimension" in user_lower: target_topic = "Dimensions"

            if json_mode:
                return json.dumps({
                    "intent": "understand",
                    "confidence": "high",
                    "responseText": f"Regarding {target_topic} for {prod_name}: This component operates at optimum efficiency with custom specs to maximize durability and response rates.",
                    "speechPayload": f"Here is the breakdown on {target_topic} for the {prod_name}. Engineered for maximum performance.",
                    "usedProductFields": ["specs", "description"],
                    "missingFields": [],
                    "suggestedActions": ["Compare Specs", "See AR Guide"],
                    "recommendedProductIds": []
                })
            return f"Regarding {target_topic} for {prod_name}: Engineered for optimal durability and premium specs."

        # 3. COMPARE INTENT
        elif intent == "compare":
            if json_mode:
                return json.dumps({
                    "intent": "compare",
                    "confidence": "medium",
                    "responseText": f"The primary {prod_name} outperforms competitors on build quality and real-time response latency.",
                    "speechPayload": f"The primary {prod_name} outperforms competitors on build quality.",
                    "usedProductFields": ["name", "features", "specs"],
                    "missingFields": [],
                    "suggestedActions": ["Compare Specs", "See Alternative details"],
                    "recommendedProductIds": ["d1234567-89ab-cdef-0123-456789abcdef"]
                })
            return f"Comparison: The primary {prod_name} outperforms competitors on build quality and real-time response latency."

        # 4. RECOMMEND INTENT
        elif intent == "recommend":
            if json_mode:
                return json.dumps({
                    "intent": "recommend",
                    "confidence": "high",
                    "responseText": f"Here are a couple of products similar to {prod_name} that you might find interesting based on premium tier categories.",
                    "speechPayload": f"I've selected some alternative premium items that match your interest.",
                    "usedProductFields": ["category", "brand"],
                    "missingFields": [],
                    "suggestedActions": ["View Recommendation 1", "Compare Options"],
                    "recommendedProductIds": ["d1234567-89ab-cdef-0123-456789abcdef"]
                })
            return f"We recommend looking at our adjacent premium catalog which features standard structural and price alignments."

        # 5. UNKNOWN INTENT
        elif intent == "unknown":
            if json_mode:
                return json.dumps({
                    "intent": "unknown",
                    "confidence": "low",
                    "responseText": "I don't have verified data for that in this product record.",
                    "speechPayload": "I don't have verified data for that request.",
                    "usedProductFields": [],
                    "missingFields": ["warranty"],
                    "suggestedActions": ["Explain key features", "Compare similar products"],
                    "recommendedProductIds": []
                })
            return "I don't have verified data for that in this product record."

        # 6. BUY_DECIDE INTENT
        else:  # buy_decide
            if json_mode:
                return json.dumps({
                    "intent": "buy_decide",
                    "confidence": "high",
                    "responseText": f"Decision summary for {prod_name}: Pros include industry-leading specifications and advanced 3D & AR interactivity. Cons include a premium pricing tier. Verdict: a highly recommended investment with a score of 92 out of 100.",
                    "speechPayload": f"The {prod_name} scored ninety two out of a hundred. Highly recommended for its advanced 3D AR capability and premium build.",
                    "usedProductFields": ["price", "specs", "features"],
                    "missingFields": [],
                    "suggestedActions": ["Buy Now", "Add to Favorites"],
                    "recommendedProductIds": []
                })
            return f"Verdict: The {prod_name} is highly recommended. Pros: leading specs, 3D interactivity. Cons: premium price. Final Score: 92/100."

    def _generate_mock_embedding(self, text: str) -> list[float]:
        """Generates a deterministic 1536-dimensional float vector using text hash."""
        vector = [0.0] * 1536
        # Generate simple hash value from text characters
        text_hash = sum(ord(c) * (i + 1) for i, c in enumerate(text))
        for i in range(1536):
            # Seed-based pseudo-random projection
            val = (text_hash * (i + 13)) % 1000000 / 1000000.0
            vector[i] = val * 2.0 - 1.0  # normalize between -1.0 and 1.0
        
        # Simple norm normalization
        norm = sum(x*x for x in vector) ** 0.5
        if norm > 0:
            vector = [x / norm for x in vector]
        return vector

# Singleton instance of AI Client
ai_client = AIClient()
