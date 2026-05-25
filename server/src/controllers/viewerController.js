const crypto = require('crypto');
const db = require('../db');

exports.getProductById = async (req, res, next) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID or slug is required' });
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    let result;

    if (isUuid) {
      result = await db.query(
        `SELECT id, name, tagline, description, category, brand, sku, thumbnail_url, model_url, usdz_url, features, specs, price, currency, buy_url, qr_label, ai_summary, is_published
         FROM products
         WHERE id = $1`,
        [productId]
      );
    } else {
      result = await db.query(
        `SELECT id, name, tagline, description, category, brand, sku, thumbnail_url, model_url, usdz_url, features, specs, price, currency, buy_url, qr_label, ai_summary, is_published
         FROM products
         WHERE slug = $1 AND is_published = true`,
        [productId]
      );
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.getQrCodeByToken = async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const result = await db.query(
      `SELECT q.*, p.slug, p.is_published 
       FROM qr_codes q
       JOIN products p ON q.product_id = p.id
       WHERE q.qr_token = $1 AND q.is_active = true`,
      [token]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Active QR Code not found' });
    }

    const qrCode = result.rows[0];

    // Atomically increment scan count
    await db.query(
      'UPDATE qr_codes SET scan_count = scan_count + 1, updated_at = NOW() WHERE id = $1',
      [qrCode.id]
    );

    // Log analytics scan entry
    const userAgent = req.headers['user-agent'] || '';
    const deviceType = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent) ? 'mobile' : 'desktop';
    const deviceOsMatch = userAgent.match(/Android|iPhone|iPad|iPod|Windows|Macintosh|Linux|CrOS/i);
    const browserMatch = userAgent.match(/Chrome|Safari|Firefox|Edg|Opera|SamsungBrowser|CriOS|FxiOS/i);

    const deviceOs = deviceOsMatch ? deviceOsMatch[0] : 'unknown';
    const browser = browserMatch ? browserMatch[0] : 'unknown';
    const countryCode = req.headers['cf-ipcountry'] || req.headers['x-country-code'] || null;
    const ip = req.ip || req.connection?.remoteAddress || '';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    await db.query(
      `INSERT INTO qr_scans (product_id, device_type, device_os, browser, country_code, ip_hash, session_duration_seconds, ar_used, voice_used)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [qrCode.product_id, deviceType, deviceOs, browser, countryCode, ipHash, 0, false, false]
    );

    return res.json({
      success: true,
      product_id: qrCode.product_id,
      slug: qrCode.slug,
      destination_url: qrCode.destination_url
    });
  } catch (error) {
    next(error);
  }
};

exports.logScan = async (req, res, next) => {
  const { productId } = req.params;
  const { ar_used = false, voice_used = false, session_duration_seconds = 0 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    let resolvedProductId = productId;

    // If slug is provided instead of ID, resolve ID
    if (!isUuid) {
      const slugRes = await db.query('SELECT id FROM products WHERE slug = $1', [productId]);
      if (slugRes.rowCount === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      resolvedProductId = slugRes.rows[0].id;
    }

    const userAgent = req.headers['user-agent'] || '';
    const deviceType = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent) ? 'mobile' : 'desktop';
    const deviceOsMatch = userAgent.match(/Android|iPhone|iPad|iPod|Windows|Macintosh|Linux|CrOS/i);
    const browserMatch = userAgent.match(/Chrome|Safari|Firefox|Edg|Opera|SamsungBrowser|CriOS|FxiOS/i);

    const deviceOs = deviceOsMatch ? deviceOsMatch[0] : 'unknown';
    const browser = browserMatch ? browserMatch[0] : 'unknown';
    const countryCode = req.headers['cf-ipcountry'] || req.headers['x-country-code'] || null;
    const ip = req.ip || req.connection?.remoteAddress || '';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    await db.query(
      `INSERT INTO qr_scans (product_id, device_type, device_os, browser, country_code, ip_hash, session_duration_seconds, ar_used, voice_used)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [resolvedProductId, deviceType, deviceOs, browser, countryCode, ipHash, session_duration_seconds, ar_used, voice_used]
    );

    return res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};