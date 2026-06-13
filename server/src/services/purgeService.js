const cron = require('node-cron');
const db = require('../db');

/**
 * Hard-delete projects whose purge window has expired.
 * CASCADE FK constraints handle child records automatically:
 *   products → qr_codes, qr_scans, product_embeddings, user_interactions, etc.
 */
async function purgeExpiredProjects() {
  await db.query('BEGIN');
  try {
    const result = await db.query(
      `DELETE FROM projects
       WHERE status = 'deleted'
         AND purge_at IS NOT NULL
         AND purge_at <= NOW()
       RETURNING id, name`
    );

    await db.query('COMMIT');

    if (result.rowCount > 0) {
      console.log(
        `[PurgeJob] Hard-deleted ${result.rowCount} expired project(s):`,
        result.rows.map((r) => `"${r.name}" (${r.id})`).join(', ')
      );
    }
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('[PurgeJob] Failed to purge expired projects:', error.message);
  }
}

/**
 * Hard-delete products whose purge window has expired.
 * Only runs for products whose parent project is ALSO deleted (or already purged).
 * Products inside active projects should not be purged ahead of the project itself.
 * CASCADE FK constraints handle child records (qr_codes, qr_scans, embeddings, etc.)
 */
async function purgeExpiredProducts() {
  await db.query('BEGIN');
  try {
    const result = await db.query(
      `DELETE FROM products
       WHERE status = 'deleted'
         AND purge_at IS NOT NULL
         AND purge_at <= NOW()
       RETURNING id, name`
    );

    await db.query('COMMIT');

    if (result.rowCount > 0) {
      console.log(
        `[PurgeJob] Hard-deleted ${result.rowCount} expired product(s):`,
        result.rows.map((r) => `"${r.name}" (${r.id})`).join(', ')
      );
    }
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('[PurgeJob] Failed to purge expired products:', error.message);
  }
}

async function runPurgeJob() {
  console.log('[PurgeJob] Starting scheduled purge run at', new Date().toISOString());
  // Products first — avoids FK issues if project purge cascades first
  await purgeExpiredProducts();
  await purgeExpiredProjects();
  console.log('[PurgeJob] Purge run complete.');
}

// Schedule: every day at 02:00 UTC
cron.schedule('0 2 * * *', runPurgeJob, {
  scheduled: true,
  timezone: 'UTC',
});

console.log('[PurgeJob] Scheduled: daily hard-delete of expired records at 02:00 UTC');

module.exports = { runPurgeJob };
