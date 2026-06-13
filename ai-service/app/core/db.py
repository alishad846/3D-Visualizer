import logging
import json
import asyncpg
from app.config import settings

logger = logging.getLogger("scanvista.db")

class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        """Initialize the asyncpg connection pool."""
        if self.pool:
            return

        db_url = settings.DATABASE_URL
        if not db_url:
            logger.warning("DATABASE_URL is not set. Database integration will run in mock mode.")
            return

        try:
            logger.info("Initializing asyncpg connection pool...")
            self.pool = await asyncpg.create_pool(
                dsn=db_url,
                min_size=1,
                max_size=10,
                max_queries=50000,
                max_inactive_connection_lifetime=300.0,
            )
            logger.info("Database connection pool established successfully.")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}", exc_info=True)
            self.pool = None

    async def disconnect(self):
        """Close the database pool."""
        if self.pool:
            logger.info("Closing database connection pool...")
            await self.pool.close()
            self.pool = None
            logger.info("Database pool closed.")

    async def fetch_one(self, query: str, *args):
        """Fetch a single row from database."""
        if not self.pool:
            return None
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(query, *args)

    async def fetch_all(self, query: str, *args):
        """Fetch multiple rows from database."""
        if not self.pool:
            return []
        async with self.pool.acquire() as conn:
            return await conn.fetch(query, *args)

    async def execute(self, query: str, *args):
        """Execute a query (INSERT, UPDATE, DELETE)."""
        if not self.pool:
            return None
        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)

    async def get_product_by_id(self, product_id: str):
        """Fetch product details by ID from PostgreSQL."""
        query = """
            SELECT id, name, tagline, description, category, brand, sku, 
                   features, specs, price, currency, model_url, is_published
            FROM products
            WHERE id = $1::UUID AND status = 'active'
        """
        row = await self.fetch_one(query, product_id)
        if not row:
            return None
        
        # Format JSONB fields cleanly
        product = dict(row)
        if isinstance(product.get("features"), str):
            product["features"] = json.loads(product["features"])
        if isinstance(product.get("specs"), str):
            product["specs"] = json.loads(product["specs"])
        return product

    async def get_all_products(self):
        """Fetch all published products."""
        query = """
            SELECT id, name, tagline, description, category, brand, sku, 
                   features, specs, price, currency, model_url, is_published
            FROM products
            WHERE is_published = TRUE AND status = 'active'
        """
        rows = await self.fetch_all(query)
        products = []
        for row in rows:
            product = dict(row)
            if isinstance(product.get("features"), str):
                product["features"] = json.loads(product["features"])
            if isinstance(product.get("specs"), str):
                product["specs"] = json.loads(product["specs"])
            products.append(product)
        return products

    async def get_embeddings(self, product_id: str):
        """Fetch float embedding vector for a product."""
        query = """
            SELECT embedding
            FROM product_embeddings
            WHERE product_id = $1::UUID
            ORDER BY created_at DESC
            LIMIT 1
        """
        row = await self.fetch_one(query, product_id)
        return row["embedding"] if row else None

    async def get_all_embeddings(self):
        """Fetch all product embeddings mapped to product IDs."""
        query = """
            SELECT pe.product_id, pe.embedding
            FROM product_embeddings pe
            JOIN products p ON pe.product_id = p.id AND p.status = 'active'
        """
        rows = await self.fetch_all(query)
        return {str(row["product_id"]): row["embedding"] for row in rows}

    async def log_voice_query(self, product_id: str, session_id: str, query_text: str, response_text: str, language: str):
        """Log voice query interaction into voice_queries table."""
        query = """
            INSERT INTO voice_queries (product_id, session_id, query_text, response_text, language, created_at)
            VALUES ($1::UUID, $2, $3, $4, $5, NOW())
            RETURNING id
        """
        try:
            return await self.fetch_one(query, product_id, session_id, query_text, response_text, language)
        except Exception as e:
            logger.error(f"Error logging voice query: {e}", exc_info=True)
            return None

# Singleton instance of database pool manager
db = Database()
