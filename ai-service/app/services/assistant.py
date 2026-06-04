import logging
import json
import asyncio
from app.core.db import db
from app.core.ai_client import ai_client
from app.engines.intent_classifier import intent_classifier
from app.engines.prompt_builder import prompt_builder
from app.schemas.assistant import VoiceAssistantRequest, VoiceAssistantResponse

logger = logging.getLogger("scanvista.services.assistant")

class AssistantService:
    def _contains_sensitive_admin_triggers(self, text: str) -> bool:
        """
        Scans queries and generated text for high-impact admin command triggers.
        These require secondary security gates.
        """
        triggers = {
            "rollback", "roll back", "disable product", "disable published", 
            "regenerate qr", "invalidate qr", "rebuild cache", "invalidate cache",
            "flush database", "reprocess analytics", "db edit", "modify metadata"
        }
        text_lower = text.lower()
        return any(trigger in text_lower for trigger in triggers)

    async def process_voice_query(self, request: VoiceAssistantRequest) -> VoiceAssistantResponse:
        """
        Stateless entrypoint: product data and competitors are pre-fetched by Node.js and
        passed in the request body. Python owns only: intent classification, prompt assembly,
        LLM orchestration, safety gating, and output validation.
        """
        # Product and competitors come directly from Node.js — no DB access here
        product = request.product
        competitors = request.competitors
        query = request.query
        session_id = request.sessionId or "default_session"
        language = request.language or "en"
        product_id = str(product.get("id", ""))

        logger.info(f"Processing assistant query for product '{product.get('name', product_id)}'")

        # 1. Run NLP intent classification
        intent = await intent_classifier.classify(query)

        # 2. Assemble system prompt from pre-supplied context
        system_prompt = prompt_builder.build_assistant_system_prompt(product, intent, query, competitors)
        user_prompt = f"<user_query>\n{query}\n</user_query>"

        # 5. Query LLM asynchronously
        llm_response = await ai_client.ask_llm(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            json_mode=True,
            temperature=0.3
        )

        # 6. Parse and Validate Pydantic Output Structs
        try:
            response_data = json.loads(llm_response)
        except Exception:
            logger.error(f"Malformed JSON returned by LLM: {llm_response}. Healing response.", exc_info=True)
            response_data = {
                "intent": intent,
                "confidence": "low",
                "responseText": "I processed your request, but the underlying system generated a malformed response format. Please ask me again.",
                "speechPayload": "Sorry, I encountered a temporary format issue.",
                "usedProductFields": [],
                "missingFields": [],
                "suggestedActions": ["Try again"],
                "recommendedProductIds": []
            }

        # Ensure schema structure defaults
        intent_val = response_data.get("intent", intent)
        confidence_val = response_data.get("confidence", "medium")
        response_text = response_data.get("responseText", "")
        speech_payload = response_data.get("speechPayload", "")
        used_product_fields = response_data.get("usedProductFields", [])
        missing_fields = response_data.get("missingFields", [])
        suggested_actions = response_data.get("suggestedActions", [])
        
        # Populate recommendation candidate IDs dynamically if Compare/Recommend
        rec_ids = response_data.get("recommendedProductIds", [])
        if not rec_ids and intent in {"compare", "recommend"} and competitors:
            rec_ids = [str(c["id"]) for c in competitors]

        # 7. SENSITIVE OPERATIONS VERIFICATION GATE
        # "If any query requested rarely by the AI, it first validated by backend and only executed if same otherwise AI answer in some other way"
        if self._contains_sensitive_admin_triggers(query) or self._contains_sensitive_admin_triggers(response_text):
            logger.warning(f"Privileged admin operation trigger blocked in query: '{query[:50]}'")
            
            # The AI attempted a sensitive action or user requested it - modify response text gracefully
            response_text = (
                "### 🔐 Privileged Action Blocked\n\n"
                "I detected a request for an administrative operation (e.g., product rollback, status modification, "
                "or cache rebuild).\n\n"
                "These high-impact control mutations are **heavily protected** and cannot be triggered through the public AI "
                "voice assistant. They must first flow through secure, authenticated multi-person workflows via the "
                "**ScanVista God Mode Admin System**.\n\n"
                "Please log into the Admin Console if you possess appropriate `super_admin` permissions."
            )
            speech_payload = "Privileged action blocked. Administrative operations are restricted to the God Mode console."
            suggested_actions = ["Return to Dashboard", "View Security Specs"]

        # Create validated output
        result = VoiceAssistantResponse(
            intent=intent_val,
            confidence=confidence_val,
            responseText=response_text,
            speechPayload=speech_payload,
            usedProductFields=used_product_fields,
            missingFields=missing_fields,
            suggestedActions=suggested_actions,
            recommendedProductIds=rec_ids
        )

        # 3. Asynchronously log conversation history to database (optional — no-ops when pool absent)
        # Decoupled background task; does not block API response latency
        if product_id and db.pool:
            asyncio.create_task(db.log_voice_query(
                product_id=product_id,
                session_id=session_id,
                query_text=query,
                response_text=result.responseText,
                language=language
            ))

        return result

assistant_service = AssistantService()
