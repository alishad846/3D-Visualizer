const db = require('../db');
const { AI_SERVICE_URL } = require('../config/env');

const PUBLIC_PRODUCT_FIELDS = `
  p.id, p.name, p.tagline, p.description, p.category, p.brand, p.sku,
  p.thumbnail_url, p.model_url, p.usdz_url, p.features, p.specs,
  p.price, p.currency, p.buy_url, p.qr_label, p.ai_summary, p.ai_use_cases,
  p.ai_generation_status, p.ai_generated_at, p.is_published, p.slug
`;

const PRODUCT_FIELDS_FOR_EMBEDDING = `
  id, name, tagline, description, category, brand, features, specs, ai_generation_status, ai_generated_at
`;

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

function normalizeJsonField(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeProduct(product) {
  if (!product) return product;
  const {
    recommendation_distance: _recommendationDistance,
    recommendation_score: _recommendationScore,
    ...publicProduct
  } = product;

  return {
    ...publicProduct,
    features: normalizeJsonField(publicProduct.features, []),
    specs: normalizeJsonField(publicProduct.specs, []),
    ai_use_cases: normalizeJsonField(publicProduct.ai_use_cases, []),
    gallery_urls: normalizeJsonField(publicProduct.gallery_urls, []),
  };
}

function vectorLiteral(vector) {
  return `[${vector.map((value) => Number(value) || 0).join(',')}]`;
}

class RecommendService {
  async resolveProductId(productIdOrSlug) {
    if (!productIdOrSlug) return null;
    if (isUuid(productIdOrSlug)) return productIdOrSlug;

    const result = await db.query(
      'SELECT id FROM products WHERE slug = $1 AND is_published = true AND status = \'active\'',
      [productIdOrSlug]
    );

    return result.rows[0]?.id || null;
  }

  async getProductForAssistant(productIdOrSlug) {
    const productId = await this.resolveProductId(productIdOrSlug);
    if (!productId) return null;

    const result = await db.query(
      `SELECT id, name, tagline, description, category, brand, features, specs, price, currency,
              thumbnail_url, gallery_urls, buy_url
       FROM products
       WHERE id = $1 AND is_published = true AND status = 'active'`,
      [productId]
    );

    return normalizeProduct(result.rows[0] || null);
  }

  async getEmbeddingSource(productId) {
    const result = await db.query(
      `SELECT embedding
       FROM product_embeddings
       WHERE product_id = $1
       AND embedding IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [productId]
    );

    return result.rows[0]?.embedding || null;
  }

  async getSimilarProducts(productIdOrSlug, limit = 8) {
    const productId = await this.resolveProductId(productIdOrSlug);
    if (!productId) {
      return {
        productId: null,
        products: [],
        recommendationSource: 'none',
      };
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 8, 1), 12);
    const vectorResult = await db.query(
      `WITH target AS (
         SELECT embedding
         FROM product_embeddings
         WHERE product_id = $1
         AND embedding IS NOT NULL
         ORDER BY created_at DESC
         LIMIT 1
       )
       SELECT ${PUBLIC_PRODUCT_FIELDS},
              (pe.embedding <=> target.embedding) AS recommendation_distance
       FROM target
       JOIN product_embeddings pe ON pe.embedding IS NOT NULL
       JOIN products p ON p.id = pe.product_id AND p.status = 'active'
       WHERE p.id <> $1
       AND p.is_published = true
       ORDER BY pe.embedding <=> target.embedding
       LIMIT $2`,
      [productId, safeLimit]
    );

    if (vectorResult.rowCount > 0) {
      return {
        productId,
        products: vectorResult.rows.map(normalizeProduct),
        recommendationSource: 'embedding',
      };
    }

    return this.getFallbackProducts(productId, safeLimit);
  }

  async getFallbackProducts(productId, limit = 8) {
    const currentResult = await db.query(
      `SELECT id, category, brand, price
       FROM products
       WHERE id = $1
       AND is_published = true
       AND status = 'active'`,
      [productId]
    );

    if (currentResult.rowCount === 0) {
      return {
        productId,
        products: [],
        recommendationSource: 'none',
      };
    }

    const current = currentResult.rows[0];
    const fallbackResult = await db.query(
      `SELECT ${PUBLIC_PRODUCT_FIELDS},
        (
          CASE WHEN LOWER(COALESCE(p.category, '')) = LOWER(COALESCE($2, '')) THEN 4 ELSE 0 END +
          CASE WHEN LOWER(COALESCE(p.brand, '')) = LOWER(COALESCE($3, '')) THEN 2 ELSE 0 END +
          CASE
            WHEN p.price IS NOT NULL AND $4::numeric IS NOT NULL
            THEN GREATEST(0, 1 - (ABS(p.price - $4::numeric) / GREATEST(p.price, $4::numeric, 1)))
            ELSE 0
          END
        ) AS recommendation_score
       FROM products p
       WHERE p.id <> $1
       AND p.is_published = true
       AND p.status = 'active'
       ORDER BY recommendation_score DESC, p.updated_at DESC
       LIMIT $5`,
      [current.id, current.category, current.brand, current.price, limit]
    );

    return {
      productId,
      products: fallbackResult.rows.map(normalizeProduct),
      recommendationSource: 'fallback',
    };
  }

  async refreshProductEmbeddingById(productId) {
    const result = await db.query(
      `SELECT ${PRODUCT_FIELDS_FOR_EMBEDDING}
       FROM products
       WHERE id = $1 AND status = 'active'`,
      [productId]
    );

    if (result.rowCount === 0) return null;
    return this.refreshProductEmbedding(result.rows[0]);
  }

  async refreshProductEmbedding(product) {
    const normalized = normalizeProduct(product);
    if (!normalized?.id) return null;

    const response = await fetch(`${AI_SERVICE_URL}/api/ai/embeddings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: normalized.id,
        name: normalized.name,
        tagline: normalized.tagline,
        description: normalized.description,
        category: normalized.category,
        brand: normalized.brand,
        features: normalized.features || [],
        specs: normalized.specs || [],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Embedding generation failed');
    }

    const data = await response.json();
    if (!Array.isArray(data.embedding) || data.embedding.length === 0) {
      throw new Error('Embedding service returned an empty vector');
    }

    await db.query('BEGIN');
    try {
      await db.query('DELETE FROM product_embeddings WHERE product_id = $1', [normalized.id]);
      await db.query(
        `INSERT INTO product_embeddings (product_id, embedding, model_version, created_at)
         VALUES ($1, $2::vector, $3, NOW())`,
        [
          normalized.id,
          vectorLiteral(data.embedding),
          data.model_version || 'text-embedding-ada-002',
        ]
      );
      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

    return {
      productId: normalized.id,
      modelVersion: data.model_version || 'text-embedding-ada-002',
    };
  }

  async refreshProductAIContent(product) {
    const normalized = normalizeProduct(product);
    if (!normalized?.id) return null;

    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/ai/content/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: normalized.id,
          name: normalized.name,
          tagline: normalized.tagline,
          description: normalized.description,
          category: normalized.category,
          brand: normalized.brand,
          features: normalized.features || [],
          specs: normalized.specs || [],
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'AI content generation failed');
      }

      const data = await response.json();
      if (!data.summary || !Array.isArray(data.use_cases)) {
        throw new Error('AI content service returned malformed response');
      }

      // Update product with generated content, status, and generated_at timestamp
      await db.query(
        `UPDATE products SET
           ai_summary = $1,
           ai_use_cases = $2,
           ai_generation_status = 'completed',
           ai_generated_at = NOW(),
           updated_at = NOW()
         WHERE id = $3`,
        [data.summary, JSON.stringify(data.use_cases), normalized.id]
      );

      return {
        productId: normalized.id,
        summary: data.summary,
        useCases: data.use_cases,
      };
    } catch (error) {
      console.warn(`[RecommendService] AI content generation failed for product ${normalized.id}:`, error.message);
      
      // On failure: Log failure, update status to 'failed', but DO NOT clear/overwrite ai_summary & ai_use_cases
      await db.query(
        `UPDATE products SET
           ai_generation_status = 'failed',
           updated_at = NOW()
         WHERE id = $1`,
        [normalized.id]
      );

      throw error;
    }
  }
}

module.exports = new RecommendService();
