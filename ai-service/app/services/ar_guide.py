import logging
import json
from app.core.db import db
from app.core.ai_client import ai_client
from app.core.exceptions import ProductNotFoundException
from app.engines.prompt_builder import prompt_builder
from app.schemas.ar_guide import ARGuideRequest, ARGuideResponse

logger = logging.getLogger("scanvista.services.ar_guide")

class ARGuideService:
    async def process_ar_guidance(self, request: ARGuideRequest) -> ARGuideResponse:
        """
        Orchestrates Layer 2 spatial guidance: fetches product, constructs
        spatial parameters, calls AI narrator, and formats response.
        """
        product_id = request.productId
        query = request.query
        step_number = request.stepNumber or 1
        view_state = request.currentViewMode or "normal"
        comp_id = request.focusedComponentId or "main_assembly"

        # 1. Fetch product
        product = await db.get_product_by_id(product_id)
        if not product:
            logger.error(f"ARGuideRequest failed: product '{product_id}' not found.")
            raise ProductNotFoundException(product_id)

        # 2. Build Layer 2 Prompt
        system_prompt = prompt_builder.build_ar_guide_system_prompt(
            product=product,
            current_view_state=view_state,
            focused_component_id=comp_id
        )
        
        user_prompt = f"Active Tour Step: {step_number}\nUser Spatial Action: {query}"

        # 3. Query LLM
        llm_response = await ai_client.ask_llm(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            json_mode=True,
            temperature=0.2  # low temperature for precise guide instructions
        )

        # 4. Parse & Validate response
        try:
            data = json.loads(llm_response)
        except Exception:
            logger.error(f"Malformed JSON returned by LLM in AR guide: {llm_response}", exc_info=True)
            # Safe recovery block
            comp_name = comp_id.replace("_", " ").title()
            data = {
                "componentName": comp_name,
                "microGuidance": f"Inspecting component {comp_name}. Please rotate or zoom to view interior details.",
                "highlightInstruction": f"glow:{comp_id}:#00F0FF",
                "walkthroughStep": f"Step {step_number}: Visualizing active mesh component."
            }

        return ARGuideResponse(
            componentName=data.get("componentName", comp_id.replace("_", " ").title()),
            microGuidance=data.get("microGuidance", "Component active in standard orientation."),
            highlightInstruction=data.get("highlightInstruction", f"glow:{comp_id}:#00FFCC"),
            walkthroughStep=data.get("walkthroughStep")
        )

ar_guide_service = ARGuideService()
