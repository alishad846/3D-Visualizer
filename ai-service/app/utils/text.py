import json

def flatten_product_to_text(product: dict) -> str:
    """
    Flattens a product dict (containing name, brand, category, tagline, description,
    features JSONB, and specs JSONB) into a unified formatted text string.
    This string represents the full semantic context used to generate embeddings.
    """
    parts = []

    # Basic identity
    name = product.get("name") or ""
    brand = product.get("brand") or ""
    category = product.get("category") or ""
    tagline = product.get("tagline") or ""
    description = product.get("description") or ""

    if name:
        parts.append(f"Product Name: {name}")
    if brand:
        parts.append(f"Brand: {brand}")
    if category:
        parts.append(f"Category: {category}")
    if tagline:
        parts.append(f"Tagline: {tagline}")
    if description:
        parts.append(f"Description: {description}")

    # Core Features
    features = product.get("features") or []
    if isinstance(features, str):
        try:
            features = json.loads(features)
        except Exception:
            features = []
    
    if features and isinstance(features, list):
        features_str = ", ".join([str(f) for f in features])
        parts.append(f"Key Features: {features_str}")

    # Core Specs
    specs = product.get("specs") or []
    if isinstance(specs, str):
        try:
            specs = json.loads(specs)
        except Exception:
            specs = []

    if specs and isinstance(specs, list):
        spec_lines = []
        for s in specs:
            if isinstance(s, dict):
                key = s.get("key")
                val = s.get("value")
                if key and val:
                    spec_lines.append(f"{key}: {val}")
        if spec_lines:
            parts.append("Specifications:\n" + "\n".join(spec_lines))

    # Compile with clean line-break separation
    return "\n\n".join(parts).strip()
