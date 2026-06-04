const db = require('./src/db');

async function runMigrations() {
  console.log('Starting database migrations...');

  await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  console.log('Created or verified uuid-ossp extension.');

  await db.query('CREATE EXTENSION IF NOT EXISTS vector');
  console.log('Created or verified vector extension.');

  // 1. Add slug column to products if not exists
  await db.query(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
  `);
  console.log('Added slug column to products.');

  // 2. Generate slugs for any existing products that don't have one
  const { rows: products } = await db.query(`SELECT id, name FROM products WHERE slug IS NULL`);
  for (const prod of products) {
    let baseSlug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!baseSlug) baseSlug = 'product';
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    await db.query(`UPDATE products SET slug = $1 WHERE id = $2`, [uniqueSlug, prod.id]);
  }
  console.log(`Generated slugs for ${products.length} existing products.`);

  // 3. Add UNIQUE constraint if not exists
  try {
    await db.query(`
      ALTER TABLE products ADD CONSTRAINT products_slug_unique UNIQUE (slug);
    `);
    console.log('Added unique constraint to product slugs.');
  } catch (err) {
    if (err.code === '42710' || err.message.includes('already exists')) {
      console.log('Slug unique constraint already exists.');
    } else {
      throw err;
    }
  }

  // 4. Create qr_codes table if not exists
  await db.query(`
    CREATE TABLE IF NOT EXISTS qr_codes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        qr_token VARCHAR(255) UNIQUE NOT NULL,
        destination_url TEXT NOT NULL,
        qr_image_url TEXT,
        scan_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('Created or verified qr_codes table.');

  // 5. Add indexes
  await db.query(`CREATE INDEX IF NOT EXISTS idx_qr_codes_token ON qr_codes(qr_token);`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_qr_codes_product_id ON qr_codes(product_id);`);

  // 6. Recommendation embeddings table + vector indexes
  await db.query(`
    CREATE TABLE IF NOT EXISTS product_embeddings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      embedding VECTOR(1536),
      model_version VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_product_embeddings_vector
    ON product_embeddings USING hnsw (embedding vector_cosine_ops);
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_product_embeddings_product_id
    ON product_embeddings(product_id);
  `);

  console.log('Created or verified indexes.');

  console.log('Migrations completed successfully!');
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations };
