/**
 * Idempotent DB bootstrap for production deploys (Render, etc.).
 * - Enables uuid-ossp
 * - Applies schema.sql on first run (empty database)
 * - Runs incremental migrations
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const db = require('../src/db');
const { runMigrations } = require('../migrate');

const SCHEMA_PATH = path.join(__dirname, '../../schema.sql');

async function ensureDb() {
  if (!process.env.DATABASE_URL) {
    console.error('[ensure-db] DATABASE_URL is not set. Skipping.');
    process.exit(1);
  }

  console.log('[ensure-db] Checking database...');

  await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await db.query('CREATE EXTENSION IF NOT EXISTS vector');

  const { rows } = await db.query(
    `SELECT EXISTS (
       SELECT FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'users'
     ) AS exists`
  );

  if (!rows[0].exists) {
    console.log('[ensure-db] Applying schema.sql (first deploy)...');
    const sql = fs.readFileSync(SCHEMA_PATH, 'utf8');
    await db.query(sql);
    console.log('[ensure-db] Schema applied.');
  } else {
    console.log('[ensure-db] Schema already present.');
  }

  await runMigrations();
  console.log('[ensure-db] Database ready.');
}

if (require.main === module) {
  ensureDb()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[ensure-db] Failed:', err);
      process.exit(1);
    });
}

module.exports = { ensureDb };
