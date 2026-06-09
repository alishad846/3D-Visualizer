from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


class VoiceAssistantRequest(BaseModel):
    """
    Stateless request schema — Node.js fetches and filters product data
    before forwarding to this service. No productId lookup happens here.
    """
    product: Dict[str, Any] = Field(..., description="User-facing product data pre-fetched and filtered by Node.js.")
    query: str = Field(..., max_length=5000, description="The spoken transcript or text query.")
    competitors: List[Dict[str, Any]] = Field(default_factory=list, description="Up to 3 pre-fetched user-facing competitor products for compare/recommend intents.")
    sessionId: Optional[str] = Field(None, description="Optional session correlation identifier.")
    language: Optional[str] = Field("en", description="User preferred locale string.")


class VoiceAssistantResponse(BaseModel):
    intent: str = Field(..., description="Detected intent: explore, understand, compare, recommend, buy_decide, unknown.")
    confidence: str = Field("medium", description="Confidence level: high, medium, low.")
    responseText: str = Field(..., description="Plain text response suitable for the UI.")
    speechPayload: str = Field(..., description="Clean, simplified text optimal for Speech Synthesis engines.")
    usedProductFields: List[str] = Field(default_factory=list, description="List of product fields used in response.")
    missingFields: List[str] = Field(default_factory=list, description="List of requested fields missing from data.")
    suggestedActions: List[str] = Field(default_factory=list, description="Context-aware quick action options.")
    recommendedProductIds: List[str] = Field(default_factory=list, description="UUIDs of matching items for discovery.")
