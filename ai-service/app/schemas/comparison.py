from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class ComparisonRequest(BaseModel):
    productIds: List[str] = Field(..., min_length=2, max_length=5, description="List of product UUIDs to compare.")
    query: Optional[str] = Field(None, description="Optional custom guidance to focus comparisons.")
    focusMetric: Optional[str] = Field(None, description="Optional key specification metric to evaluate.")

class ComparisonResponse(BaseModel):
    comparisonMatrix: List[Dict] = Field(..., description="Grid comparison of specification and metric parameters.")
    similarities: List[str] = Field(..., description="List of core similarities identified.")
    differences: List[str] = Field(..., description="List of primary functional or design variations.")
    topRecommendId: Optional[str] = Field(None, description="UUID of the recommended product.")
    rationale: str = Field(..., description="Detailed explanation of the winner recommendations.")
