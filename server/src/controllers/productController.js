const db = require('../db');
const storageService = require('../services/storageService');
const recommendService = require('../services/recommendService');
const { isValidStoredUrl } = require('../utils/urls');
const XLSX = require('xlsx');
const crypto = require('crypto');
const qrcode = require('qrcode');
const { CLIENT_URL, SUPABASE_URL } = require('../config/env');

async function refreshEmbeddingAndAIContent(productOrId, forceRegenerateAI = false) {
  let product = null;

  if (typeof productOrId === 'object') {
    product = productOrId;
  } else {
    const result = await db.query(
      `SELECT id, name, tagline, description, category, brand, features, specs, ai_generation_status
       FROM products WHERE id = $1`,
      [productOrId]
    );
    if (result.rowCount > 0) {
      product = result.rows[0];
    }
  }

  if (!product) return;

  const status = product.ai_generation_status;
  const shouldGenAI = forceRegenerateAI || !status || status === 'never_generated' || status === 'failed';

  const tasks = [];

  // 1. Embedding task
  tasks.push(
    recommendService.refreshProductEmbedding(product).catch((error) => {
      console.warn('[ProductController] Embedding refresh failed:', error.message);
    })
  );

  // 2. AI Content generation task
  if (shouldGenAI) {
    // Update status to processing in DB
    await db.query(
      `UPDATE products SET ai_generation_status = 'processing', updated_at = NOW() WHERE id = $1`,
      [product.id]
    );

    tasks.push(
      recommendService.refreshProductAIContent(product).catch((error) => {
        console.warn('[ProductController] AI content generation failed in background:', error.message);
      })
    );
  }

  await Promise.all(tasks);
}

function refreshEmbeddingInBackground(productOrId, forceRegenerateAI = false) {
  refreshEmbeddingAndAIContent(productOrId, forceRegenerateAI).catch((error) => {
    console.warn('[ProductController] Background refresh worker failed:', error.message);
  });
}

function validateProductAssets({ modelUrl, usdzUrl, thumbnailUrl, galleryUrls }) {
  if (!isValidStoredUrl(modelUrl)) {
    return 'A valid 3D model URL is required. Upload the GLB file before saving.';
  }
  if (usdzUrl && !isValidStoredUrl(usdzUrl)) {
    return 'USDZ file must be uploaded to storage (required for iOS AR Quick Look).';
  }
  if (thumbnailUrl && !isValidStoredUrl(thumbnailUrl)) {
    return 'Thumbnail must be uploaded to storage (invalid or temporary URL).';
  }
  if (Array.isArray(galleryUrls)) {
    for (const url of galleryUrls) {
      if (url && !isValidStoredUrl(url)) {
        return 'Gallery images must use storage URLs only.';
      }
    }
  }
  return null;
}

function normalizeHeader(header) {
  if (typeof header !== 'string') return '';
  return header.trim().toLowerCase().replace(/\s+/g, '_');
}

function isValidHttpUrl(value) {
  if (!value || typeof value !== 'string') return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidSupabaseStorageUrl(value) {
  if (!isValidHttpUrl(value) || !SUPABASE_URL) return false;
  try {
    const parsed = new URL(value.trim());
    const storageOrigin = new URL(SUPABASE_URL).origin;
    return parsed.origin === storageOrigin && parsed.pathname.includes('/storage/v1/object/public/');
  } catch {
    return false;
  }
}

async function getUniqueSlug(baseSlug, usedSlugs) {
  let candidate = baseSlug || 'product';
  let attempts = 0;

  while (attempts < 20) {
    if (!usedSlugs.has(candidate)) {
      const slugCheck = await db.query('SELECT id FROM products WHERE slug = $1', [candidate]);
      if (slugCheck.rowCount === 0) {
        usedSlugs.add(candidate);
        return candidate;
      }
    }

    attempts += 1;
    candidate = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  usedSlugs.add(candidate);
  return candidate;
}

function normalizeValue(value) {
  if (typeof value !== 'string') return value;
  return value.trim() === '' ? null : value.trim();
}

function isCommentRow(rowCells) {
  if (!Array.isArray(rowCells) || rowCells.length === 0) return false;
  const firstCell = String(rowCells[0] ?? '').trim();
  return firstCell.startsWith('#') || /^note:/i.test(firstCell);
}

async function parseBulkUploadRows(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('The upload file must contain at least one worksheet.');
  }

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (!Array.isArray(rawRows) || rawRows.length < 2) {
    throw new Error('The upload file must include a header row and at least one product row.');
  }

  const headerRowIndex = rawRows.findIndex((row) => !isCommentRow(row));
  if (headerRowIndex === -1) {
    throw new Error('The upload file must include a header row and at least one product row.');
  }

  const headerRow = rawRows[headerRowIndex].map(normalizeHeader).filter(Boolean);
  const supportedHeaders = new Set([
    'name', 'category', 'brand', 'sku', 'tagline', 'description',
    'price', 'currency', 'buy_url', 'qr_label', 'usdz_url',
    'thumbnail_url', 'gallery_urls'
  ]);

  const validHeaderPairs = headerRow
    .map((header, index) => ({ header, index }))
    .filter(({ header }) => supportedHeaders.has(header));

  const requiredHeaders = ['name', 'category'];
  const missingHeaders = requiredHeaders.filter((header) => !headerRow.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required column(s): ${missingHeaders.join(', ')}`);
  }

  const warnings = [];
  const dataRows = rawRows
    .slice(headerRowIndex + 1)
    .map((rowCells, rowIndex) => ({ rowCells, rowNumber: headerRowIndex + 2 + rowIndex }))
    .filter(({ rowCells }) => !isCommentRow(rowCells))
    .map(({ rowCells, rowNumber }) => {
      const row = {};

      validHeaderPairs.forEach(({ header, index }) => {
        const rawValue = String(rowCells[index] ?? '');

        if (header === 'thumbnail_url') {
          const values = rawValue
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean);

          if (values.length > 1) {
            warnings.push({
              row: rowNumber,
              field: 'thumbnail_url',
              warning: 'Multiple URLs provided — only the first was used',
              solution: 'Provide a single storage URL in the thumbnail_url column',
            });
          }

          row.thumbnail_url = values.length > 0 ? values[0] : null;
          return;
        }

        if (header === 'gallery_urls') {
          const values = rawValue
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean);

          if (values.length > 5) {
            warnings.push({
              row: rowNumber,
              field: 'gallery_urls',
              warning: 'More than 5 URLs provided — only the first 5 were used',
              solution: 'Maximum gallery size is 5 images per product',
            });
          }

          row.gallery_urls = values.slice(0, 5);
          return;
        }

        row[header] = rawValue.trim();
      });

      row.__rowNumber = rowNumber;
      return row;
    })
    .filter((row) => Object.entries(row).some(([key, value]) => {
      if (key === '__rowNumber') return false;
      if (Array.isArray(value)) return value.length > 0;
      return String(value).trim() !== '';
    }));

  if (dataRows.length === 0) {
    throw new Error('No populated rows were found after parsing the file.');
  }

  if (dataRows.length > 100) {
    throw new Error('Bulk upload cannot contain more than 100 rows.');
  }

  return { rows: dataRows, warnings };
}

async function validateBulkUploadRows(rows, projectId) {
  const rowErrors = [];
  const seenNames = new Map();
  const seenSkus = new Map();
  const skuCandidates = [];

  const addRowError = (rowNumber, field, error, solution) => {
    rowErrors.push({ row: rowNumber, field, error, solution });
  };

  rows.forEach((row, index) => {
    const rowNumber = row.__rowNumber || index + 2;
    const name = String(row.name || '').trim();
    const category = String(row.category || '').trim();
    const sku = String(row.sku || '').trim();
    const buyUrl = String(row.buy_url || '').trim();
    const usdzUrl = String(row.usdz_url || '').trim();
    const thumbnailUrl = String(row.thumbnail_url || '').trim();
    const galleryUrls = Array.isArray(row.gallery_urls) ? row.gallery_urls : [];
    const price = String(row.price || '').trim();

    if (!name) {
      addRowError(
        rowNumber,
        'name',
        'Name is required',
        'Provide a non-empty product name in the name column'
      );
    }
    if (!category) {
      addRowError(
        rowNumber,
        'category',
        'Category is required',
        'Provide a valid category value in the category column'
      );
    }
    if (price && Number.isNaN(Number(price))) {
      addRowError(
        rowNumber,
        'price',
        'price must be a valid number',
        'Provide a numeric value in the price column'
      );
    }
    if (buyUrl && !isValidHttpUrl(buyUrl)) {
      addRowError(
        rowNumber,
        'buy_url',
        'buy_url must be a valid http(s) URL',
        'Provide a valid URL starting with http:// or https://'
      );
    }
    if (usdzUrl && !isValidSupabaseStorageUrl(usdzUrl)) {
      addRowError(
        rowNumber,
        'usdz_url',
        'usdz_url must be a valid Supabase storage URL',
        'Provide a pre-uploaded Supabase storage URL for usdz_url'
      );
    }
    if (thumbnailUrl && !isValidSupabaseStorageUrl(thumbnailUrl)) {
      addRowError(
        rowNumber,
        'thumbnail_url',
        'thumbnail_url must be a pre-uploaded Supabase storage URL',
        'External URLs and temporary preview URLs are not accepted. Upload the image first via the product form, then paste the resulting storage URL here.'
      );
    }
    if (galleryUrls.length > 0) {
      const invalidGallery = galleryUrls.some((url) => !isValidSupabaseStorageUrl(url));
      if (invalidGallery) {
        addRowError(
          rowNumber,
          'gallery_urls',
          'One or more gallery_urls entries are not valid Supabase storage URLs',
          'External URLs and temporary preview URLs are not accepted. Upload each image first via the product form, then paste the resulting storage URLs here.'
        );
      }
    }

    const normalizedName = name.toLowerCase();
    if (normalizedName && seenNames.has(normalizedName)) {
      addRowError(
        rowNumber,
        'name',
        'Duplicate product name in upload file',
        'Use unique product names within the bulk import file'
      );
    }
    if (normalizedName) {
      seenNames.set(normalizedName, rowNumber);
    }

    if (sku) {
      const normalizedSku = sku.toLowerCase();
      if (seenSkus.has(normalizedSku)) {
        addRowError(
          rowNumber,
          'sku',
          'Duplicate SKU in upload file',
          'Use a unique SKU for each product in the import file'
        );
      }
      seenSkus.set(normalizedSku, rowNumber);
      skuCandidates.push(sku);
    }
  });

  if (skuCandidates.length > 0) {
    const uniqueSkus = [...new Set(skuCandidates.map((sku) => sku.trim()))];
    const { rows: existingSkuRows } = await db.query(
      `SELECT sku FROM products WHERE project_id = $1 AND sku IS NOT NULL AND sku <> '' AND sku = ANY($2::text[])`,
      [projectId, uniqueSkus]
    );
    const existingSkus = new Set(existingSkuRows.map((row) => String(row.sku).trim().toLowerCase()));
    rows.forEach((row, index) => {
      const sku = String(row.sku || '').trim();
      if (sku && existingSkus.has(sku.toLowerCase())) {
        const rowNumber = index + 2;
        addRowError(
          rowNumber,
          'sku',
          'SKU already exists in this project',
          'Use a SKU that does not already exist in this project'
        );
      }
    });
  }

  return rowErrors;
}

async function transformBulkRows(rows, projectId, userId) {
  const usedSlugs = new Set();
  const transformed = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const rowNumber = row.__rowNumber || index + 2;
    const name = row.name.trim();
    const brand = normalizeValue(row.brand);
    const category = row.category.trim();
    const sku = normalizeValue(row.sku);
    const tagline = normalizeValue(row.tagline);
    const description = normalizeValue(row.description);
    const buyUrl = normalizeValue(row.buy_url);
    const qrLabel = normalizeValue(row.qr_label);
    const usdzUrl = normalizeValue(row.usdz_url);
    const thumbnailUrl = normalizeValue(row.thumbnail_url);
    const galleryUrls = Array.isArray(row.gallery_urls) ? row.gallery_urls : [];
    const currency = normalizeValue(row.currency) || 'INR';
    const price = row.price ? Number(row.price) : null;

    let baseSlug = `${brand || ''} ${name}`.trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    if (!baseSlug) baseSlug = 'product';

    const slug = await getUniqueSlug(baseSlug, usedSlugs);

    transformed.push({
      rowNumber,
      projectId,
      userId,
      name,
      tagline,
      description,
      category,
      brand,
      sku,
      thumbnailUrl: thumbnailUrl || null,
      modelUrl: null,
      usdzUrl,
      galleryUrls,
      features: [],
      specs: [],
      price,
      currency,
      buyUrl,
      qrLabel,
      slug,
    });
  }

  return transformed;
}

async function bulkUploadProductsToDb(products) {
  const insertedProducts = [];
  const skippedRows = [];

  const chunks = [];
  for (let i = 0; i < products.length; i += 10) {
    chunks.push(products.slice(i, i + 10));
  }

  for (const chunk of chunks) {
    await db.query('BEGIN');
    try {
      for (const product of chunk) {
        const result = await db.query(
          `INSERT INTO products (
            project_id, user_id, name, tagline, description, category, brand, sku,
            thumbnail_url, model_url, usdz_url, gallery_urls, features, specs,
            price, currency, buy_url, qr_label, is_published, slug
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14,
            $15, $16, $17, $18, false, $19
          ) RETURNING id, slug`,
          [
            product.projectId,
            product.userId,
            product.name,
            product.tagline,
            product.description,
            product.category,
            product.brand,
            product.sku,
            product.thumbnailUrl,
            product.modelUrl,
            product.usdzUrl,
            JSON.stringify(product.galleryUrls),
            JSON.stringify(product.features),
            JSON.stringify(product.specs),
            product.price,
            product.currency,
            product.buyUrl,
            product.qrLabel,
            product.slug,
          ]
        );

        const inserted = result.rows[0];
        const destinationUrl = `${CLIENT_URL}/p/${inserted.slug}`;
        const qrBuffer = await qrcode.toBuffer(destinationUrl, {
          width: 400,
          color: { dark: '#000000', light: '#ffffff' },
        });

        const uploadResult = await storageService.uploadFile(
          { originalname: 'qr.png', buffer: qrBuffer, mimetype: 'image/png' },
          'qr_codes'
        );

        const qrToken = crypto.randomBytes(16).toString('hex');

        await db.query(
          `INSERT INTO qr_codes (product_id, project_id, user_id, qr_token, destination_url, qr_image_url, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, true)`,
          [inserted.id, product.projectId, product.userId, qrToken, destinationUrl, uploadResult.publicUrl]
        );

        insertedProducts.push(product.rowNumber);
      }

      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Bulk upload chunk failed:', error.message);
      chunk.forEach((product) => {
        skippedRows.push({
          row: product.rowNumber,
          field: 'bulk_upload',
          error: 'Database error: ' + error.message,
          solution: 'Split the upload into smaller files or verify all rows contain valid supported column data.',
        });
      });
    }
  }

  return { insertedCount: insertedProducts.length, skippedRows };
}

// POST /api/products/upload-asset
exports.uploadAsset = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const folder = ['glb', 'gltf', 'usdz'].includes(ext) ? 'models' : 'images';
    
    const uploadResult = await storageService.uploadFile(req.file, folder);
    if (!uploadResult?.publicUrl) {
      return res.status(500).json({ error: 'Upload succeeded but no public URL was returned' });
    }
    return res.status(201).json({
      success: true,
      url: uploadResult.publicUrl,
      path: uploadResult.filePath,
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
  const assetError = validateProductAssets({ modelUrl, usdzUrl, thumbnailUrl, galleryUrls });
  if (assetError) {
    return res.status(400).json({ error: assetError });
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

    // Always trigger AI content generation for newly created products
    refreshEmbeddingInBackground(result.rows[0], true);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
};

// PUT /api/products/:id
exports.bulkUploadProducts = async (req, res, next) => {
  const { projectId } = req.params;
  const { userId } = req.user;

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required.' });
  }
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ error: 'No upload file provided.' });
  }
  if (req.file.buffer.length > 2 * 1024 * 1024) {
    return res.status(400).json({ error: 'Upload file must be 2MB or smaller.' });
  }

  try {
    const projectCheck = await db.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );
    if (projectCheck.rowCount === 0) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    const { rows, warnings } = await parseBulkUploadRows(req.file.buffer);
    const rowErrors = await validateBulkUploadRows(rows, projectId);
    if (rowErrors.length > 0) {
      return res.status(400).json({
        error: 'Bulk upload contains invalid rows.',
        skippedRows: rowErrors,
        warnings,
      });
    }

    const transformedProducts = await transformBulkRows(rows, projectId, userId);
    const { insertedCount, skippedRows } = await bulkUploadProductsToDb(transformedProducts);

    return res.status(insertedCount > 0 ? 201 : 200).json({ insertedCount, skippedRows, warnings });
  } catch (error) {
    console.error('Bulk upload failed:', error);
    return res.status(400).json({ error: error.message || 'Bulk upload failed.' });
  }
};

exports.getIncompleteProducts = async (req, res, next) => {
  const { userId } = req.user;
  const { projectId } = req.params;

  try {
    const projectCheck = await db.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );
    if (projectCheck.rowCount === 0) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }

    const result = await db.query(
      `SELECT id, project_id, name, tagline, category, brand, sku, thumbnail_url, created_at, updated_at
       FROM products
       WHERE project_id = $1 AND user_id = $2 AND is_published = false AND model_url IS NULL
       ORDER BY created_at ASC`,
      [projectId, userId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching incomplete products:', error);
    next(error);
  }
};

exports.attachProductModel = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { modelUrl } = req.body;

  if (!modelUrl || !isValidSupabaseStorageUrl(modelUrl)) {
    return res.status(400).json({ error: 'A valid Supabase storage URL is required for modelUrl.' });
  }

  try {
    const result = await db.query(
      `UPDATE products
       SET model_url = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3 AND is_published = false
       RETURNING *`,
      [modelUrl.trim(), id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Draft product not found or access denied.' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error attaching product model:', error);
    next(error);
  }
};

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
  const assetError = validateProductAssets({ modelUrl, usdzUrl, thumbnailUrl, galleryUrls });
  if (assetError) {
    return res.status(400).json({ error: assetError });
  }
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    return res.status(400).json({ error: 'Product slug is required' });
  }

  try {
    // Validate ownership and fetch existing values for change detection
    const productCheck = await db.query(
      `SELECT p.id, p.project_id, p.name, p.tagline, p.description, p.category, p.brand, p.features, p.specs, p.ai_generation_status,
              (SELECT COUNT(*) FROM product_embeddings WHERE product_id = p.id) as embedding_count
       FROM products p WHERE p.id = $1 AND p.user_id = $2`,
      [id, userId]
    );
    if (productCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }

    const oldProduct = productCheck.rows[0];

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

    // Change detection: only regenerate AI content when content fields changed or data is missing
    const hasContentChanged =
      (oldProduct.name || '') !== name.trim() ||
      (oldProduct.tagline || '') !== (tagline ? tagline.trim() : '') ||
      (oldProduct.description || '') !== (description ? description.trim() : '') ||
      (oldProduct.category || '') !== (category || '') ||
      (oldProduct.brand || '') !== (brand ? brand.trim() : '') ||
      JSON.stringify(oldProduct.features || []) !== JSON.stringify(features || []) ||
      JSON.stringify(oldProduct.specs || []) !== JSON.stringify(specs || []);

    const isMissingData =
      Number(oldProduct.embedding_count) === 0 ||
      !oldProduct.ai_generation_status ||
      oldProduct.ai_generation_status === 'never_generated' ||
      oldProduct.ai_generation_status === 'failed';

    const shouldRegenerate = hasContentChanged || isMissingData;
    refreshEmbeddingInBackground(result.rows[0], shouldRegenerate);

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

    refreshEmbeddingInBackground(product.id);

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
