from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class ContentGenerationRequest(BaseModel):
    productId: str = Field(..., description="The unique identifier of the product.")
    name: str = Field(..., description="Product display name.")
    tagline: Optional[str] = Field(None, description="Short brand tagline.")
    description: Optional[str] = Field(None, description="Detailed product description.")
    category: Optional[str] = Field(None, description="Product grouping category.")
    brand: Optional[str] = Field(None, description="Brand name.")
    features: Optional[List[str]] = Field(default_factory=list, description="Array of core product features.")
    specs: Optional[List[Dict]] = Field(default_factory=list, description="Key-value specifications list.")

class ContentGenerationResponse(BaseModel):
    productId: str = Field(..., description="ID of the processed product.")
    summary: str = Field(..., description="Generated product summary.")
    use_cases: List[str] = Field(..., description="Generated list of product use cases.")

    model_config = {"protected_namespaces": ()}
