-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REFRESH TOKENS
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS (workspace grouping)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Core identity
    name VARCHAR(200) NOT NULL,
    tagline VARCHAR(300),
    description TEXT,
    category VARCHAR(100),
    brand VARCHAR(100),
    sku VARCHAR(100),

    -- Visual assets
    thumbnail_url TEXT,
    model_url TEXT,              -- GLB file on Supabase Storage
    model_generated BOOLEAN DEFAULT FALSE,  -- Phase 2: AI-generated flag
    gallery_urls JSONB DEFAULT '[]',        -- array of image URLs

    -- Structured content
    features JSONB DEFAULT '[]',            -- ["Waterproof", "12hr battery"]
    specs JSONB DEFAULT '[]',              -- [{"key":"Weight","value":"200g"}]

    -- Commerce
    price NUMERIC(12, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    buy_url TEXT,

    -- QR
    qr_label VARCHAR(100),

    -- AI assistant content (Phase 2 — null in Phase 1)
    ai_summary TEXT,
    ai_use_cases JSONB DEFAULT '[]',
    ai_comparisons JSONB DEFAULT '[]',

    -- State
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT EMBEDDINGS (Phase 2 — recommendation engine)
CREATE TABLE product_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    embedding VECTOR(1536),     -- pgvector extension
    model_version VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR SCANS (analytics)
CREATE TABLE qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    device_type VARCHAR(20),      -- mobile / tablet / desktop
    device_os VARCHAR(50),
    browser VARCHAR(50),
    country_code VARCHAR(5),
    ip_hash VARCHAR(64),          -- hashed, not raw IP
    session_duration_seconds INTEGER,  -- updated on session end
    ar_used BOOLEAN DEFAULT FALSE,
    voice_used BOOLEAN DEFAULT FALSE
);

-- USER INTERACTION HISTORY (Phase 3 — personalization)
CREATE TABLE user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50),  -- 'viewed', 'ar_used', 'voice_query', 'compared'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VOICE QUERIES LOG (Phase 2 — for Q&A improvement)
CREATE TABLE voice_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    query_text TEXT,
    response_text TEXT,
    language VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMPARISON SESSIONS (Phase 2)
CREATE TABLE comparison_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    product_ids JSONB NOT NULL,    -- array of product IDs being compared
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_project_id ON products(project_id);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_qr_scans_product_id ON qr_scans(product_id);
CREATE INDEX idx_qr_scans_scanned_at ON qr_scans(scanned_at);
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_product_id ON user_interactions(product_id);