const db = require('../db');

const RANGE_MAP = {
  '7d': 7,
  '28d': 28,
  '90d': 90,
};

const SORT_MAP = {
  scans: 'total_scans',
  unique_visitors: 'unique_visitors',
  avg_session: 'avg_session_seconds',
  ar_rate: 'ar_rate',
  last_scanned: 'last_scanned',
};

function getRangeDays(range) {
  return RANGE_MAP[range] || 28;
}

function getInterval(days) {
  return `${days} days`;
}

function toISO(value) {
  return value instanceof Date ? value.toISOString() : value;
}

async function validateProductOwnership(productId, userId) {
  const result = await db.query(
    `SELECT p.id
     FROM products p
     INNER JOIN projects proj ON p.project_id = proj.id
     WHERE p.id = $1
     AND proj.user_id = $2`,
    [productId, userId]
  );

  return result.rows.length > 0;
}

async function validateProjectOwnership(projectId, userId) {
  const result = await db.query(
    `SELECT id
     FROM projects
     WHERE id = $1
     AND user_id = $2`,
    [projectId, userId]
  );

  return result.rows.length > 0;
}

exports.getProductOverview = async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.user;

  try {
    const result = await db.query(
      `SELECT
         COUNT(qs.id) AS total_scans,
         COUNT(DISTINCT qs.ip_hash) FILTER (WHERE qs.ip_hash IS NOT NULL) AS unique_visitors,
         ROUND(AVG(qs.session_duration_seconds)) FILTER (
           WHERE qs.session_duration_seconds IS NOT NULL
           AND qs.session_duration_seconds > 0
         ) AS avg_session_seconds,
         COUNT(qs.id) FILTER (
           WHERE qs.scanned_at >= NOW() - INTERVAL '28 days'
         ) AS total_28,
         COUNT(qs.id) FILTER (
           WHERE qs.scanned_at >= NOW() - INTERVAL '28 days'
           AND qs.ar_used = TRUE
         ) AS ar_count_28
       FROM products p
       INNER JOIN projects proj ON p.project_id = proj.id
       LEFT JOIN qr_scans qs ON qs.product_id = p.id
       WHERE p.id = $1
       AND proj.user_id = $2
       GROUP BY p.id`,
      [productId, userId]
    );

    if (!result.rows.length) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const row = result.rows[0];
    const totalScans = Number(row.total_scans || 0);
    const uniqueVisitors = Number(row.unique_visitors || 0);
    const avgSessionSeconds = row.avg_session_seconds !== null ? Number(row.avg_session_seconds) : 0;
    const total28 = Number(row.total_28 || 0);
    const arCount28 = Number(row.ar_count_28 || 0);
    const arRate = total28 > 0 ? Number(((arCount28 / total28) * 100).toFixed(1)) : 0;

    return res.json({ totalScans, uniqueVisitors, avgSessionSeconds, arRate });
  } catch (error) {
    console.error('[Analytics] getProductOverview error:', error.message);
    return res.status(500).json({ error: 'Analytics query failed' });
  }
};

exports.getProductRealtime = async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.user;

  try {
    const validation = await db.query(
      `SELECT p.id,
         COUNT(DISTINCT qs.ip_hash) FILTER (WHERE qs.ip_hash IS NOT NULL) AS active_now
       FROM products p
       INNER JOIN projects proj ON p.project_id = proj.id
       LEFT JOIN qr_scans qs ON qs.product_id = p.id
         AND qs.scanned_at >= NOW() - INTERVAL '30 minutes'
       WHERE p.id = $1
       AND proj.user_id = $2
       GROUP BY p.id`,
      [productId, userId]
    );

    if (!validation.rows.length) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const activeNow = Number(validation.rows[0].active_now || 0);

    const perMinuteResult = await db.query(
      `SELECT
         date_trunc('minute', qs.scanned_at) AS minute,
         COUNT(*) AS count
       FROM products p
       INNER JOIN projects proj ON p.project_id = proj.id
       INNER JOIN qr_scans qs ON qs.product_id = p.id
       WHERE p.id = $1
       AND proj.user_id = $2
       AND qs.scanned_at >= NOW() - INTERVAL '30 minutes'
       GROUP BY minute
       ORDER BY minute ASC`,
      [productId, userId]
    );

    const byCountryResult = await db.query(
      `SELECT
         qs.country_code,
         COUNT(DISTINCT qs.ip_hash) AS active_count
       FROM products p
       INNER JOIN projects proj ON p.project_id = proj.id
       INNER JOIN qr_scans qs ON qs.product_id = p.id
       WHERE p.id = $1
       AND proj.user_id = $2
       AND qs.scanned_at >= NOW() - INTERVAL '30 minutes'
       AND qs.country_code IS NOT NULL
       GROUP BY qs.country_code
       ORDER BY active_count DESC
       LIMIT 5`,
      [productId, userId]
    );

    const perMinute = perMinuteResult.rows.map((row) => ({
      minute: toISO(row.minute),
      count: Number(row.count || 0),
    }));

    const byCountry = byCountryResult.rows.map((row) => ({
      countryCode: row.country_code,
      activeCount: Number(row.active_count || 0),
    }));

    return res.json({ activeNow, perMinute, byCountry });
  } catch (error) {
    console.error('[Analytics] getProductRealtime error:', error.message);
    return res.status(500).json({ error: 'Analytics query failed' });
  }
};

exports.getProductTrend = async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.user;
  const days = getRangeDays(req.query.range);
  const interval = getInterval(days);
  const previousInterval = getInterval(days * 2);

  try {
    const validation = await db.query(
      `SELECT p.id
       FROM products p
       INNER JOIN projects proj ON p.project_id = proj.id
       WHERE p.id = $1
       AND proj.user_id = $2`,
      [productId, userId]
    );

    if (!validation.rows.length) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const currentResult = await db.query(
      `SELECT
         DATE(qs.scanned_at) AS day,
         COUNT(*) AS scans,
         COUNT(DISTINCT qs.ip_hash) AS unique_visitors,
         ROUND(AVG(qs.session_duration_seconds) FILTER (
           WHERE qs.session_duration_seconds IS NOT NULL
           AND qs.session_duration_seconds > 0
         )) AS avg_session,
         ROUND(
           COUNT(*) FILTER (WHERE qs.ar_used = TRUE) * 100.0 /
           NULLIF(COUNT(*), 0), 1
         ) AS ar_rate
       FROM products p
       INNER JOIN projects proj ON p.project_id = proj.id
       LEFT JOIN qr_scans qs ON qs.product_id = p.id
         AND qs.scanned_at >= NOW() - INTERVAL '${interval}'
       WHERE p.id = $1
       AND proj.user_id = $2
       GROUP BY day
       HAVING day IS NOT NULL
       ORDER BY day ASC`,
      [productId, userId]
    );

    const previousResult = await db.query(
      `SELECT
         DATE(qs.scanned_at) AS day,
         COUNT(*) AS scans
       FROM products p
       INNER JOIN projects proj ON p.project_id = proj.id
       LEFT JOIN qr_scans qs ON qs.product_id = p.id
         AND qs.scanned_at >= NOW() - INTERVAL '${previousInterval}'
         AND qs.scanned_at < NOW() - INTERVAL '${interval}'
       WHERE p.id = $1
       AND proj.user_id = $2
       GROUP BY day
       HAVING day IS NOT NULL
       ORDER BY day ASC`,
      [productId, userId]
    );

    const current = currentResult.rows.map((row) => ({
      day: row.day,
      scans: Number(row.scans || 0),
      uniqueVisitors: Number(row.unique_visitors || 0),
      avgSession: row.avg_session !== null ? Number(row.avg_session) : 0,
      arRate: row.ar_rate !== null ? Number(row.ar_rate) : 0,
    }));

    const previous = previousResult.rows.map((row) => ({
      day: row.day,
      scans: Number(row.scans || 0),
    }));

    return res.json({ current, previous });
  } catch (error) {
    console.error('[Analytics] getProductTrend error:', error.message);
    return res.status(500).json({ error: 'Analytics query failed' });
  }
};

exports.getProductGeo = async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.user;
  const days = getRangeDays(req.query.range);
  const interval = getInterval(days);

  try {
    const validation = await db.query(
      `SELECT p.id
       FROM products p
       INNER JOIN projects proj ON p.project_id = proj.id
       WHERE p.id = $1
       AND proj.user_id = $2`,
      [productId, userId]
    );

    if (!validation.rows.length) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      `SELECT
         qs.country_code,
         COUNT(*) AS scans,
         ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 1) AS percentage
       FROM products p
       INNER JOIN projects proj ON p.project_id = proj.id
       LEFT JOIN qr_scans qs ON qs.product_id = p.id
         AND qs.scanned_at >= NOW() - INTERVAL '${interval}'
       WHERE p.id = $1
       AND proj.user_id = $2
       AND qs.country_code IS NOT NULL
       GROUP BY qs.country_code
       ORDER BY scans DESC
       LIMIT 50`,
      [productId, userId]
    );

    const countries = result.rows.map((row) => ({
      countryCode: row.country_code,
      scans: Number(row.scans || 0),
      percentage: row.percentage !== null ? Number(row.percentage) : 0,
    }));

    return res.json({ countries });
  } catch (error) {
    console.error('[Analytics] getProductGeo error:', error.message);
    return res.status(500).json({ error: 'Analytics query failed' });
  }
};

exports.getProductDevices = async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.user;
  const days = getRangeDays(req.query.range);
  const interval = getInterval(days);

  try {
    const validation = await db.query(
      `SELECT p.id
       FROM products p
       INNER JOIN projects proj ON p.project_id = proj.id
       WHERE p.id = $1
       AND proj.user_id = $2`,
      [productId, userId]
    );

    if (!validation.rows.length) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [deviceTypeResult, operatingSystemsResult, browsersResult] = await Promise.all([
      db.query(
        `SELECT
           qs.device_type,
           COUNT(*) AS scans
         FROM products p
         INNER JOIN projects proj ON p.project_id = proj.id
         INNER JOIN qr_scans qs ON qs.product_id = p.id
         WHERE p.id = $1
         AND proj.user_id = $2
         AND qs.scanned_at >= NOW() - INTERVAL '${interval}'
         AND qs.device_type IS NOT NULL
         GROUP BY qs.device_type
         ORDER BY scans DESC`,
        [productId, userId]
      ),
      db.query(
        `SELECT
           qs.device_os,
           COUNT(*) AS scans
         FROM products p
         INNER JOIN projects proj ON p.project_id = proj.id
         INNER JOIN qr_scans qs ON qs.product_id = p.id
         WHERE p.id = $1
         AND proj.user_id = $2
         AND qs.scanned_at >= NOW() - INTERVAL '${interval}'
         AND qs.device_os IS NOT NULL
         GROUP BY qs.device_os
         ORDER BY scans DESC`,
        [productId, userId]
      ),
      db.query(
        `SELECT
           qs.browser,
           COUNT(*) AS scans
         FROM products p
         INNER JOIN projects proj ON p.project_id = proj.id
         INNER JOIN qr_scans qs ON qs.product_id = p.id
         WHERE p.id = $1
         AND proj.user_id = $2
         AND qs.scanned_at >= NOW() - INTERVAL '${interval}'
         AND qs.browser IS NOT NULL
         GROUP BY qs.browser
         ORDER BY scans DESC`,
        [productId, userId]
      ),
    ]);

    const deviceTypes = deviceTypeResult.rows.map((row) => ({
      deviceType: row.device_type,
      scans: Number(row.scans || 0),
    }));
    const operatingSystems = operatingSystemsResult.rows.map((row) => ({
      os: row.device_os,
      scans: Number(row.scans || 0),
    }));
    const browsers = browsersResult.rows.map((row) => ({
      browser: row.browser,
      scans: Number(row.scans || 0),
    }));

    return res.json({ deviceTypes, operatingSystems, browsers });
  } catch (error) {
    console.error('[Analytics] getProductDevices error:', error.message);
    return res.status(500).json({ error: 'Analytics query failed' });
  }
};

exports.getProductSources = async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.user;
  const days = getRangeDays(req.query.range);
  const interval = getInterval(days);
  const prevInterval = getInterval(days * 2);

  try {
    const validation = await db.query(
      `SELECT p.id
       FROM products p
       INNER JOIN projects proj ON p.project_id = proj.id
       WHERE p.id = $1
       AND proj.user_id = $2`,
      [productId, userId]
    );

    if (!validation.rows.length) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const currentResult = await db.query(
      `SELECT
         qs.referrer_type,
         COUNT(*) AS scans
       FROM products p
       INNER JOIN projects proj ON p.project_id = proj.id
       INNER JOIN qr_scans qs ON qs.product_id = p.id
       WHERE p.id = $1
       AND proj.user_id = $2
       AND qs.scanned_at >= NOW() - INTERVAL '${interval}'
       GROUP BY qs.referrer_type
       ORDER BY scans DESC`,
      [productId, userId]
    );

    const previousResult = await db.query(
      `SELECT
         qs.referrer_type,
         COUNT(*) AS scans
       FROM products p
       INNER JOIN projects proj ON p.project_id = proj.id
       INNER JOIN qr_scans qs ON qs.product_id = p.id
       WHERE p.id = $1
       AND proj.user_id = $2
       AND qs.scanned_at >= NOW() - INTERVAL '${prevInterval}'
       AND qs.scanned_at < NOW() - INTERVAL '${interval}'
       GROUP BY qs.referrer_type`,
      [productId, userId]
    );

    const previousMap = previousResult.rows.reduce((acc, row) => {
      acc[row.referrer_type] = Number(row.scans || 0);
      return acc;
    }, {});

    const totalCurrent = currentResult.rows.reduce((sum, row) => sum + Number(row.scans || 0), 0);

    const sources = currentResult.rows.map((row) => {
      const currentScans = Number(row.scans || 0);
      const previousScans = previousMap[row.referrer_type] || 0;
      return {
        referrerType: row.referrer_type,
        scans: currentScans,
        percentage: totalCurrent > 0 ? Number(((currentScans * 100.0) / totalCurrent).toFixed(1)) : 0,
        trend: previousScans > 0 ? Number((((currentScans - previousScans) / previousScans) * 100).toFixed(1)) : null,
      };
    });

    return res.json({ sources });
  } catch (error) {
    console.error('[Analytics] getProductSources error:', error.message);
    return res.status(500).json({ error: 'Analytics query failed' });
  }
};

exports.getProductSessions = async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.user;
  const days = getRangeDays(req.query.range);
  const interval = getInterval(days);

  try {
    const validation = await db.query(
      `SELECT p.id
       FROM products p
       INNER JOIN projects proj ON p.project_id = proj.id
       WHERE p.id = $1
       AND proj.user_id = $2`,
      [productId, userId]
    );

    if (!validation.rows.length) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      `SELECT
         COUNT(*) FILTER (
           WHERE qs.session_duration_seconds >= 0
           AND qs.session_duration_seconds < 10
         ) AS bucket_0_10,
         COUNT(*) FILTER (
           WHERE qs.session_duration_seconds >= 10
           AND qs.session_duration_seconds < 30
         ) AS bucket_10_30,
         COUNT(*) FILTER (
           WHERE qs.session_duration_seconds >= 30
           AND qs.session_duration_seconds < 60
         ) AS bucket_30_60,
         COUNT(*) FILTER (
           WHERE qs.session_duration_seconds >= 60
         ) AS bucket_60_plus,
         COUNT(*) FILTER (
           WHERE qs.session_duration_seconds IS NOT NULL
         ) AS total_with_duration,
         ROUND(AVG(qs.session_duration_seconds)) FILTER (
           WHERE qs.session_duration_seconds IS NOT NULL
           AND qs.session_duration_seconds > 0
         ) AS avg_session_seconds
       FROM products p
       INNER JOIN projects proj ON p.project_id = proj.id
       LEFT JOIN qr_scans qs ON qs.product_id = p.id
         AND qs.scanned_at >= NOW() - INTERVAL '${interval}'
       WHERE p.id = $1
       AND proj.user_id = $2`,
      [productId, userId]
    );

    const row = result.rows[0] || {};
    const totalWithDuration = Number(row.total_with_duration || 0);

    const buckets = [
      { label: '0-10s', count: Number(row.bucket_0_10 || 0) },
      { label: '10-30s', count: Number(row.bucket_10_30 || 0) },
      { label: '30-60s', count: Number(row.bucket_30_60 || 0) },
      { label: '60s+', count: Number(row.bucket_60_plus || 0) },
    ].map((bucket) => ({
      ...bucket,
      percentage: totalWithDuration > 0 ? Number(((bucket.count * 100.0) / totalWithDuration).toFixed(1)) : 0,
    }));

    const avgSessionSeconds = row.avg_session_seconds !== null ? Number(row.avg_session_seconds) : 0;

    return res.json({ buckets, avgSessionSeconds });
  } catch (error) {
    console.error('[Analytics] getProductSessions error:', error.message);
    return res.status(500).json({ error: 'Analytics query failed' });
  }
};

exports.getProjectOverview = async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.user;

  try {
    const validation = await validateProjectOwnership(projectId, userId);
    if (!validation) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      `SELECT
         COUNT(qs.id) AS total_scans,
         COUNT(DISTINCT qs.ip_hash) FILTER (WHERE qs.ip_hash IS NOT NULL) AS unique_visitors,
         ROUND(AVG(qs.session_duration_seconds)) FILTER (
           WHERE qs.session_duration_seconds IS NOT NULL
           AND qs.session_duration_seconds > 0
         ) AS avg_session_seconds,
         COUNT(qs.id) FILTER (
           WHERE qs.scanned_at >= NOW() - INTERVAL '28 days'
         ) AS total_28,
         COUNT(qs.id) FILTER (
           WHERE qs.scanned_at >= NOW() - INTERVAL '28 days'
           AND qs.ar_used = TRUE
         ) AS ar_count_28
       FROM projects proj
       LEFT JOIN products p ON p.project_id = proj.id
       LEFT JOIN qr_scans qs ON qs.product_id = p.id
       WHERE proj.id = $1
       AND proj.user_id = $2`,
      [projectId, userId]
    );

    const row = result.rows[0] || {};
    const totalScans = Number(row.total_scans || 0);
    const uniqueVisitors = Number(row.unique_visitors || 0);
    const avgSessionSeconds = row.avg_session_seconds !== null ? Number(row.avg_session_seconds) : 0;
    const total28 = Number(row.total_28 || 0);
    const arCount28 = Number(row.ar_count_28 || 0);
    const arRate = total28 > 0 ? Number(((arCount28 / total28) * 100).toFixed(1)) : 0;

    return res.json({ totalScans, uniqueVisitors, avgSessionSeconds, arRate });
  } catch (error) {
    console.error('[Analytics] getProjectOverview error:', error.message);
    return res.status(500).json({ error: 'Analytics query failed' });
  }
};

exports.getProjectRealtime = async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.user;

  try {
    const validation = await validateProjectOwnership(projectId, userId);
    if (!validation) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const activeNowResult = await db.query(
      `SELECT
         COUNT(DISTINCT qs.ip_hash) FILTER (WHERE qs.ip_hash IS NOT NULL) AS active_now
       FROM projects proj
       LEFT JOIN products p ON p.project_id = proj.id
       LEFT JOIN qr_scans qs ON qs.product_id = p.id
         AND qs.scanned_at >= NOW() - INTERVAL '30 minutes'
       WHERE proj.id = $1
       AND proj.user_id = $2`,
      [projectId, userId]
    );

    const activeNow = Number(activeNowResult.rows[0]?.active_now || 0);

    const perMinuteResult = await db.query(
      `SELECT
         date_trunc('minute', qs.scanned_at) AS minute,
         COUNT(*) AS count
       FROM projects proj
       LEFT JOIN products p ON p.project_id = proj.id
       INNER JOIN qr_scans qs ON qs.product_id = p.id
       WHERE proj.id = $1
       AND proj.user_id = $2
       AND qs.scanned_at >= NOW() - INTERVAL '30 minutes'
       GROUP BY minute
       ORDER BY minute ASC`,
      [projectId, userId]
    );

    const byCountryResult = await db.query(
      `SELECT
         qs.country_code,
         COUNT(DISTINCT qs.ip_hash) AS active_count
       FROM projects proj
       LEFT JOIN products p ON p.project_id = proj.id
       INNER JOIN qr_scans qs ON qs.product_id = p.id
       WHERE proj.id = $1
       AND proj.user_id = $2
       AND qs.scanned_at >= NOW() - INTERVAL '30 minutes'
       AND qs.country_code IS NOT NULL
       GROUP BY qs.country_code
       ORDER BY active_count DESC
       LIMIT 5`,
      [projectId, userId]
    );

    const perMinute = perMinuteResult.rows.map((row) => ({
      minute: toISO(row.minute),
      count: Number(row.count || 0),
    }));

    const byCountry = byCountryResult.rows.map((row) => ({
      countryCode: row.country_code,
      activeCount: Number(row.active_count || 0),
    }));

    return res.json({ activeNow, perMinute, byCountry });
  } catch (error) {
    console.error('[Analytics] getProjectRealtime error:', error.message);
    return res.status(500).json({ error: 'Analytics query failed' });
  }
};

exports.getProjectTrend = async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.user;
  const days = getRangeDays(req.query.range);
  const interval = getInterval(days);
  const previousInterval = getInterval(days * 2);

  try {
    const validation = await validateProjectOwnership(projectId, userId);
    if (!validation) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const currentResult = await db.query(
      `SELECT
         DATE(qs.scanned_at) AS day,
         COUNT(*) AS scans,
         COUNT(DISTINCT qs.ip_hash) AS unique_visitors,
         ROUND(AVG(qs.session_duration_seconds) FILTER (
           WHERE qs.session_duration_seconds IS NOT NULL
           AND qs.session_duration_seconds > 0
         )) AS avg_session,
         ROUND(
           COUNT(*) FILTER (WHERE qs.ar_used = TRUE) * 100.0 /
           NULLIF(COUNT(*), 0), 1
         ) AS ar_rate
       FROM projects proj
       LEFT JOIN products p ON p.project_id = proj.id
       LEFT JOIN qr_scans qs ON qs.product_id = p.id
         AND qs.scanned_at >= NOW() - INTERVAL '${interval}'
       WHERE proj.id = $1
       AND proj.user_id = $2
       GROUP BY day
       HAVING day IS NOT NULL
       ORDER BY day ASC`,
      [projectId, userId]
    );

    const previousResult = await db.query(
      `SELECT
         DATE(qs.scanned_at) AS day,
         COUNT(*) AS scans
       FROM projects proj
       LEFT JOIN products p ON p.project_id = proj.id
       LEFT JOIN qr_scans qs ON qs.product_id = p.id
         AND qs.scanned_at >= NOW() - INTERVAL '${previousInterval}'
         AND qs.scanned_at < NOW() - INTERVAL '${interval}'
       WHERE proj.id = $1
       AND proj.user_id = $2
       GROUP BY day
       HAVING day IS NOT NULL
       ORDER BY day ASC`,
      [projectId, userId]
    );

    const current = currentResult.rows.map((row) => ({
      day: row.day,
      scans: Number(row.scans || 0),
      uniqueVisitors: Number(row.unique_visitors || 0),
      avgSession: row.avg_session !== null ? Number(row.avg_session) : 0,
      arRate: row.ar_rate !== null ? Number(row.ar_rate) : 0,
    }));

    const previous = previousResult.rows.map((row) => ({
      day: row.day,
      scans: Number(row.scans || 0),
    }));

    return res.json({ current, previous });
  } catch (error) {
    console.error('[Analytics] getProjectTrend error:', error.message);
    return res.status(500).json({ error: 'Analytics query failed' });
  }
};

exports.getProjectGeo = async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.user;
  const days = getRangeDays(req.query.range);
  const interval = getInterval(days);

  try {
    const validation = await validateProjectOwnership(projectId, userId);
    if (!validation) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      `SELECT
         qs.country_code,
         COUNT(*) AS scans,
         ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 1) AS percentage
       FROM projects proj
       LEFT JOIN products p ON p.project_id = proj.id
       LEFT JOIN qr_scans qs ON qs.product_id = p.id
         AND qs.scanned_at >= NOW() - INTERVAL '${interval}'
       WHERE proj.id = $1
       AND proj.user_id = $2
       AND qs.country_code IS NOT NULL
       GROUP BY qs.country_code
       ORDER BY scans DESC
       LIMIT 50`,
      [projectId, userId]
    );

    const countries = result.rows.map((row) => ({
      countryCode: row.country_code,
      scans: Number(row.scans || 0),
      percentage: row.percentage !== null ? Number(row.percentage) : 0,
    }));

    return res.json({ countries });
  } catch (error) {
    console.error('[Analytics] getProjectGeo error:', error.message);
    return res.status(500).json({ error: 'Analytics query failed' });
  }
};

exports.getProjectDevices = async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.user;
  const days = getRangeDays(req.query.range);
  const interval = getInterval(days);

  try {
    const validation = await validateProjectOwnership(projectId, userId);
    if (!validation) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [deviceTypeResult, operatingSystemsResult, browsersResult] = await Promise.all([
      db.query(
        `SELECT
           qs.device_type,
           COUNT(*) AS scans
         FROM projects proj
         LEFT JOIN products p ON p.project_id = proj.id
         INNER JOIN qr_scans qs ON qs.product_id = p.id
         WHERE proj.id = $1
         AND proj.user_id = $2
         AND qs.scanned_at >= NOW() - INTERVAL '${interval}'
         AND qs.device_type IS NOT NULL
         GROUP BY qs.device_type
         ORDER BY scans DESC`,
        [projectId, userId]
      ),
      db.query(
        `SELECT
           qs.device_os,
           COUNT(*) AS scans
         FROM projects proj
         LEFT JOIN products p ON p.project_id = proj.id
         INNER JOIN qr_scans qs ON qs.product_id = p.id
         WHERE proj.id = $1
         AND proj.user_id = $2
         AND qs.scanned_at >= NOW() - INTERVAL '${interval}'
         AND qs.device_os IS NOT NULL
         GROUP BY qs.device_os
         ORDER BY scans DESC`,
        [projectId, userId]
      ),
      db.query(
        `SELECT
           qs.browser,
           COUNT(*) AS scans
         FROM projects proj
         LEFT JOIN products p ON p.project_id = proj.id
         INNER JOIN qr_scans qs ON qs.product_id = p.id
         WHERE proj.id = $1
         AND proj.user_id = $2
         AND qs.scanned_at >= NOW() - INTERVAL '${interval}'
         AND qs.browser IS NOT NULL
         GROUP BY qs.browser
         ORDER BY scans DESC`,
        [projectId, userId]
      ),
    ]);

    const deviceTypes = deviceTypeResult.rows.map((row) => ({
      deviceType: row.device_type,
      scans: Number(row.scans || 0),
    }));
    const operatingSystems = operatingSystemsResult.rows.map((row) => ({
      os: row.device_os,
      scans: Number(row.scans || 0),
    }));
    const browsers = browsersResult.rows.map((row) => ({
      browser: row.browser,
      scans: Number(row.scans || 0),
    }));

    return res.json({ deviceTypes, operatingSystems, browsers });
  } catch (error) {
    console.error('[Analytics] getProjectDevices error:', error.message);
    return res.status(500).json({ error: 'Analytics query failed' });
  }
};

exports.getProjectSources = async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.user;
  const days = getRangeDays(req.query.range);
  const interval = getInterval(days);
  const prevInterval = getInterval(days * 2);

  try {
    const validation = await validateProjectOwnership(projectId, userId);
    if (!validation) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const currentResult = await db.query(
      `SELECT
         qs.referrer_type,
         COUNT(*) AS scans
       FROM projects proj
       LEFT JOIN products p ON p.project_id = proj.id
       INNER JOIN qr_scans qs ON qs.product_id = p.id
       WHERE proj.id = $1
       AND proj.user_id = $2
       AND qs.scanned_at >= NOW() - INTERVAL '${interval}'
       GROUP BY qs.referrer_type
       ORDER BY scans DESC`,
      [projectId, userId]
    );

    const previousResult = await db.query(
      `SELECT
         qs.referrer_type,
         COUNT(*) AS scans
       FROM projects proj
       LEFT JOIN products p ON p.project_id = proj.id
       INNER JOIN qr_scans qs ON qs.product_id = p.id
       WHERE proj.id = $1
       AND proj.user_id = $2
       AND qs.scanned_at >= NOW() - INTERVAL '${prevInterval}'
       AND qs.scanned_at < NOW() - INTERVAL '${interval}'
       GROUP BY qs.referrer_type`,
      [projectId, userId]
    );

    const previousMap = previousResult.rows.reduce((acc, row) => {
      acc[row.referrer_type] = Number(row.scans || 0);
      return acc;
    }, {});

    const totalCurrent = currentResult.rows.reduce((sum, row) => sum + Number(row.scans || 0), 0);

    const sources = currentResult.rows.map((row) => {
      const currentScans = Number(row.scans || 0);
      const previousScans = previousMap[row.referrer_type] || 0;
      return {
        referrerType: row.referrer_type,
        scans: currentScans,
        percentage: totalCurrent > 0 ? Number(((currentScans * 100.0) / totalCurrent).toFixed(1)) : 0,
        trend: previousScans > 0 ? Number((((currentScans - previousScans) / previousScans) * 100).toFixed(1)) : null,
      };
    });

    return res.json({ sources });
  } catch (error) {
    console.error('[Analytics] getProjectSources error:', error.message);
    return res.status(500).json({ error: 'Analytics query failed' });
  }
};

exports.getProjectProducts = async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.user;
  const rangeDays = getRangeDays(req.query.range);
  const rangeInterval = getInterval(rangeDays);
  const sortKey = req.query.sort;
  const orderBy = SORT_MAP[sortKey] || SORT_MAP.scans;

  try {
    const validation = await validateProjectOwnership(projectId, userId);
    if (!validation) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const productsResult = await db.query(
      `SELECT
         p.id,
         p.name,
         p.thumbnail_url,
         p.slug,
         COUNT(qs.id) AS total_scans,
         COUNT(DISTINCT qs.ip_hash) AS unique_visitors,
         ROUND(AVG(qs.session_duration_seconds) FILTER (
           WHERE qs.session_duration_seconds IS NOT NULL
           AND qs.session_duration_seconds > 0
         )) AS avg_session_seconds,
         ROUND(
           COUNT(qs.id) FILTER (WHERE qs.ar_used = TRUE) * 100.0 /
           NULLIF(COUNT(qs.id), 0), 1
         ) AS ar_rate,
         MAX(qs.scanned_at) AS last_scanned,
         COUNT(qs.id) FILTER (
           WHERE qs.scanned_at >= NOW() - INTERVAL '30 days'
         ) AS scans_last_30_days
       FROM products p
       LEFT JOIN qr_scans qs ON qs.product_id = p.id
         AND qs.scanned_at >= NOW() - INTERVAL '${rangeInterval}'
       WHERE p.project_id = $1
       AND p.user_id = $2
       GROUP BY p.id, p.name, p.thumbnail_url, p.slug
       ORDER BY ${orderBy} DESC`,
      [projectId, userId]
    );

    const sparklineResult = await db.query(
      `SELECT
         p.id AS product_id,
         DATE(qs.scanned_at) AS day,
         COUNT(qs.id) AS scans
       FROM products p
       LEFT JOIN qr_scans qs ON qs.product_id = p.id
         AND qs.scanned_at >= NOW() - INTERVAL '7 days'
       WHERE p.project_id = $1
       AND p.user_id = $2
       GROUP BY p.id, day
       ORDER BY p.id, day ASC`,
      [projectId, userId]
    );

    const sparklineMap = sparklineResult.rows.reduce((acc, row) => {
      if (!row.day) return acc;
      if (!acc[row.product_id]) acc[row.product_id] = [];
      acc[row.product_id].push({ day: row.day, scans: Number(row.scans || 0) });
      return acc;
    }, {});

    const products = productsResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      thumbnailUrl: row.thumbnail_url,
      slug: row.slug,
      totalScans: Number(row.total_scans || 0),
      uniqueVisitors: Number(row.unique_visitors || 0),
      avgSessionSeconds: row.avg_session_seconds !== null ? Number(row.avg_session_seconds) : 0,
      arRate: row.ar_rate !== null ? Number(row.ar_rate) : 0,
      lastScanned: row.last_scanned ? toISO(row.last_scanned) : null,
      isDead: Number(row.scans_last_30_days || 0) === 0,
      sparkline: sparklineMap[row.id] || [],
    }));

    return res.json({ products });
  } catch (error) {
    console.error('[Analytics] getProjectProducts error:', error.message);
    return res.status(500).json({ error: 'Analytics query failed' });
  }
};
