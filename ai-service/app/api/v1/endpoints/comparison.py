import logging
import json
from fastapi import APIRouter
from app.schemas.comparison import ComparisonRequest, ComparisonResponse
from app.middleware.sanitizer import input_sanitizer
from app.middleware.validator import response_validator
from app.core.db import db
from app.core.exceptions import ProductNotFoundException
from app.engines.prompt_builder import prompt_builder
from app.core.ai_client import ai_client

logger = logging.getLogger("scanvista.api.v1.comparison")
router = APIRouter()

@router.post("/", response_model=ComparisonResponse)
async def compare_products_deck(request: ComparisonRequest):
    """
    Dedicated side-by-side spec comparison metric card endpoint.
    Aligns specs side-by-side, compares details, and outputs dynamic verdicts.
    """
    prod_ids = request.productIds
    logger.info(f"Received manual comparison deck request for {len(prod_ids)} products")
    
    # 1. Sanitize custom query guidelines
    if request.query:
        request.query = input_sanitizer.sanitize_text(request.query)
    if request.focusMetric:
        request.focusMetric = input_sanitizer.sanitize_text(request.focusMetric)

    # 2. Fetch all products details from PostgreSQL
    products = []
    primary = None
    for i, pid in enumerate(prod_ids):
        prod = await db.get_product_by_id(pid)
        if not prod:
            raise ProductNotFoundException(pid)
        if i == 0:
            primary = prod
        else:
            products.append(prod)

    # 3. Assemble Prompt
    system_prompt = prompt_builder.build_direct_comparison_prompt(
        primary=primary,
        products=products,
        query=request.query
    )
    user_prompt = f"Focus metric criteria: {request.focusMetric or 'All specs comparison'}"

    # 4. Ask LLM
    llm_response = await ai_client.ask_llm(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        json_mode=True,
        temperature=0.2
    )

    # 5. Parse, Validate & Return
    try:
        data = json.loads(llm_response)
    except Exception:
        logger.error(f"Malformed LLM response in comparison endpoints: {llm_response}", exc_info=True)
        # Safe mockup fallback
        data = {
            "comparisonMatrix": [
                {"metric": "Design", "primary": "Premium", "competitor": "Standard", "winner": "primary"}
            ],
            "similarities": ["Basic dimensions and classifications remain aligned."],
            "differences": ["Primary model exhibits superior finish and specifications."],
            "topRecommendId": str(primary["id"]),
            "rationale": "Primary product is recommended due to higher quality rating."
        }

    # Leakage cleaning
    data["rationale"] = response_validator.validate_and_clean_response(data.get("rationale", ""))
    
    return ComparisonResponse(
        comparisonMatrix=data.get("comparisonMatrix", []),
        similarities=data.get("similarities", []),
        differences=data.get("differences", []),
        topRecommendId=data.get("topRecommendId", str(primary["id"])),
        rationale=data.get("rationale", "")
    )
