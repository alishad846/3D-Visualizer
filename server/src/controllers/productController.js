const db = require('../db');
const storageService = require('../services/storageService');

// POST /api/products/upload-asset
exports.uploadAsset = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const folder = ['glb', 'gltf'].includes(ext) ? 'models' : 'images';
    
    const uploadResult = await storageService.uploadFile(req.file, folder);
    return res.status(201).json({
      success: true,
      url: uploadResult.publicUrl
    });
  } catch (error) {
    console.error('Asset upload controller error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload asset' });
  }
};

// GET /api/products
exports.getProducts = async (req, res, next) => {
  const { userId } = req.user;
  const { projectId } = req.query;

  try {
    let result;
    if (projectId) {
      // Ensure project ownership
      const projectCheck = await db.query(
        'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
        [projectId, userId]
      );
      if (projectCheck.rowCount === 0) {
        return res.status(403).json({ error: 'Access denied to this project' });
      }

      result = await db.query(
        `SELECT * FROM products WHERE project_id = $1 AND user_id = $2 ORDER BY created_at DESC`,
        [projectId, userId]
      );
    } else {
      result = await db.query(
        `SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
    }

    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    next(error);
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const result = await db.query(
      `SELECT * FROM products WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    next(error);
  }
};

// POST /api/products
exports.createProduct = async (req, res, next) => {
  const { userId } = req.user;
  const {
    projectId,
    name,
    tagline = null,
    description = null,
    category,
    brand = null,
    sku = null,
    thumbnailUrl = null,
    modelUrl,
    usdzUrl = null,
    galleryUrls = [],
    features = [],
    specs = [],
    price = null,
    currency = 'INR',
    buyUrl = null,
    qrLabel = null
  } = req.body;

  // Strict Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Product name is required' });
  }
  if (!projectId) {
    return res.status(400).json({ error: 'Project selection is required' });
  }
  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }
  if (!modelUrl) {
    return res.status(400).json({ error: '3D GLB Model upload is required' });
  }

  try {
    // Validate project ownership
    const projectCheck = await db.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );
    if (projectCheck.rowCount === 0) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    // Generate readable unique slug
    let baseSlug = `${brand ? brand : ''} ${name}`.trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!baseSlug) baseSlug = 'product';

    let uniqueSlug = baseSlug;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const slugCheck = await db.query(
        'SELECT id FROM products WHERE slug = $1',
        [uniqueSlug]
      );
      if (slugCheck.rowCount === 0) {
        isUnique = true;
      } else {
        attempts++;
        uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
      }
    }

    // Insert Product as DRAFT (is_published = false)
    const result = await db.query(
      `INSERT INTO products (
        project_id, user_id, name, tagline, description, category, brand, sku, 
        thumbnail_url, model_url, usdz_url, gallery_urls, features, specs, 
        price, currency, buy_url, qr_label, is_published, slug
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, false, $19
      ) RETURNING *`,
      [
        projectId,
        userId,
        name.trim(),
        tagline ? tagline.trim() : null,
        description ? description.trim() : null,
        category,
        brand ? brand.trim() : null,
        sku ? sku.trim() : null,
        thumbnailUrl,
        modelUrl,
        usdzUrl,
        JSON.stringify(galleryUrls),
        JSON.stringify(features),
        JSON.stringify(specs),
        price,
        currency,
        buyUrl,
        qrLabel,
        uniqueSlug
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;
  const {
    projectId,
    name,
    tagline = null,
    description = null,
    category,
    brand = null,
    sku = null,
    thumbnailUrl = null,
    modelUrl,
    usdzUrl = null,
    galleryUrls = [],
    features = [],
    specs = [],
    price = null,
    currency = 'INR',
    buyUrl = null,
    qrLabel = null,
    slug,
  } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Product name is required' });
  }
  if (!projectId) {
    return res.status(400).json({ error: 'Project selection is required' });
  }
  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }
  if (!modelUrl) {
    return res.status(400).json({ error: '3D GLB Model upload is required' });
  }
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    return res.status(400).json({ error: 'Product slug is required' });
  }

  try {
    // Validate ownership
    const productCheck = await db.query(
      'SELECT id, project_id FROM products WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (productCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }

    const projectCheck = await db.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );
    if (projectCheck.rowCount === 0) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    const slugCheck = await db.query(
      'SELECT id FROM products WHERE slug = $1 AND id <> $2',
      [slug.trim(), id]
    );
    if (slugCheck.rowCount > 0) {
      return res.status(400).json({ error: 'Slug is already in use' });
    }

    const result = await db.query(
      `UPDATE products SET
        project_id = $1,
        name = $2,
        tagline = $3,
        description = $4,
        category = $5,
        brand = $6,
        sku = $7,
        thumbnail_url = $8,
        model_url = $9,
        usdz_url = $10,
        gallery_urls = $11,
        features = $12,
        specs = $13,
        price = $14,
        currency = $15,
        buy_url = $16,
        qr_label = $17,
        slug = $18,
        updated_at = NOW()
       WHERE id = $19 AND user_id = $20
       RETURNING *`,
      [
        projectId,
        name.trim(),
        tagline ? tagline.trim() : null,
        description ? description.trim() : null,
        category,
        brand ? brand.trim() : null,
        sku ? sku.trim() : null,
        thumbnailUrl,
        modelUrl,
        usdzUrl,
        JSON.stringify(galleryUrls),
        JSON.stringify(features),
        JSON.stringify(specs),
        price,
        currency,
        buyUrl,
        qrLabel,
        slug.trim(),
        id,
        userId,
      ]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    next(error);
  }
};

// POST /api/products/:id/publish
exports.publishProduct = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;
  const crypto = require('crypto');

  try {
    // Validate product ownership
    const productCheck = await db.query(
      'SELECT id, name, slug, project_id, is_published FROM products WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (productCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }

    const product = productCheck.rows[0];

    // Generate unique secure token
    const qrToken = crypto.randomBytes(16).toString('hex');
    
    // Generate public URLs using env-based host OR fallback
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    
    // Public product landing URL uses the product slug
    const destinationUrl = `${frontendUrl}/p/${product.slug}`;

    // Generate QR Image data url using 'qrcode' package
    const qr = require('qrcode');
    const qrImageUrl = await qr.toDataURL(destinationUrl, {
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      width: 400
    });

    // Begin transaction
    await db.query('BEGIN');

    // Set is_published = true
    await db.query(
      'UPDATE products SET is_published = true, updated_at = NOW() WHERE id = $1',
      [product.id]
    );

    // Save QR in database
    const qrExistCheck = await db.query(
      'SELECT id FROM qr_codes WHERE product_id = $1',
      [product.id]
    );

    let qrResult;
    if (qrExistCheck.rowCount > 0) {
      qrResult = await db.query(
        `UPDATE qr_codes 
         SET qr_token = $1, destination_url = $2, qr_image_url = $3, is_active = true, updated_at = NOW()
         WHERE product_id = $4
         RETURNING *`,
        [qrToken, destinationUrl, qrImageUrl, product.id]
      );
    } else {
      qrResult = await db.query(
        `INSERT INTO qr_codes (product_id, project_id, user_id, qr_token, destination_url, qr_image_url, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         RETURNING *`,
        [product.id, product.project_id, userId, qrToken, destinationUrl, qrImageUrl]
      );
    }

    await db.query('COMMIT');

    return res.json({
      success: true,
      product: { ...product, is_published: true },
      qrCode: qrResult.rows[0]
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error publishing product and generating QR:', error);
    next(error);
  }
};