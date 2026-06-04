from pydantic import BaseModel, Field
from typing import Optional

class ARGuideRequest(BaseModel):
    productId: str = Field(..., description="Target UUID of the product.")
    query: str = Field(..., description="Action description or voice trigger in AR.")
    stepNumber: Optional[int] = Field(1, description="Current walkthrough step index.")
    currentViewMode: Optional[str] = Field("normal", description="Current 3D viewer view state (normal, exploded, wires).")
    focusedComponentId: Optional[str] = Field(None, description="Currently selected sub-component or mesh node ID.")

class ARGuideResponse(BaseModel):
    componentName: str = Field(..., description="Clean name of active component.")
    microGuidance: str = Field(..., description="Concise, single-sentence spatial explanation.")
    highlightInstruction: str = Field(..., description="Highlight directive (e.g. glow:battery_connector:#00FFCC).")
    walkthroughStep: Optional[str] = Field(None, description="Narrative tour marker text.")
