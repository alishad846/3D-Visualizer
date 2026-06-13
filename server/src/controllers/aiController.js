const db = require('../db');
const { AI_SERVICE_URL } = require('../config/env');
const recommendService = require('../services/recommendService');

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

exports.processAssistantQuery = async (req, res, next) => {
  const { productId, query, sessionId, language = 'en' } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID or slug is required' });
  }

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    let resolvedProductId = productId;

    // 1. Resolve slug to UUID if necessary
    if (!isUuid(productId)) {
      const slugRes = await db.query(
        'SELECT id FROM products WHERE slug = $1 AND is_published = true AND status = \'active\'',
        [productId]
      );
      if (slugRes.rowCount === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      resolvedProductId = slugRes.rows[0].id;
    }

    // 2. Fetch primary product - strictly user-facing fields
    const product = await recommendService.getProductForAssistant(resolvedProductId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 3. Fetch competitor candidates from centralized recommendation service.
    const recommendationResult = await recommendService.getSimilarProducts(product.id, 3);
    const competitors = recommendationResult.products.map((comp) => ({
      id: comp.id,
      name: comp.name,
      tagline: comp.tagline,
      description: comp.description,
      category: comp.category,
      brand: comp.brand,
      features: comp.features,
      specs: comp.specs,
      price: comp.price,
      currency: comp.currency,
    }));

    // 4. Forward clean payload to Python AI Service
    const pythonEndpoint = `${AI_SERVICE_URL}/api/ai/assistant/`;
    
    try {
      const response = await fetch(pythonEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product,
          query,
          competitors,
          sessionId,
          language,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[AI Service Error]:', errText);
        throw new Error(errText || 'AI Service returned non-200 status');
      }

      const responseData = await response.json();
      return res.json(responseData);
    } catch (fetchErr) {
      console.error('[AI Service Forwarding Failed]:', fetchErr.message);
      
      // Return a structured schema-compliant fallback response
      return res.json({
        intent: 'explore',
        confidence: 'low',
        responseText: 'I processed your request, but the underlying system generated a malformed response format. Please ask me again.',
        speechPayload: 'Sorry, I encountered a temporary format issue.',
        usedProductFields: [],
        missingFields: [],
        suggestedActions: ['Try again'],
        recommendedProductIds: [],
      });
    }
  } catch (error) {
    next(error);
  }
};
