-- Required for uuid_generate_v4() defaults (Render PostgreSQL, local, etc.)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE deletion_status AS ENUM ('active', 'deleted');

-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ NULL,
    preferred_language VARCHAR(10) DEFAULT 'en',
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);



-- REFRESH TOKENS
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSWORD RESET TOKENS
CREATE TABLE reset_password_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TWO-FACTOR CODES
CREATE TABLE two_factor_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS (workspace grouping)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    status deletion_status NOT NULL DEFAULT 'active',
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID REFERENCES users(id),
    purge_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    usdz_url TEXT DEFAULT NULL,
    model_generated BOOLEAN DEFAULT FALSE,  -- Phase 2: AI-generated flag
    gallery_urls JSONB DEFAULT '[]',        -- array of image URLs

    -- Structured content
    features JSONB DEFAULT '[]',            -- ["Waterproof", "12hr battery"]
    specs JSONB DEFAULT '[]',              -- [{"key":"Weight","value":"200g"}]

    -- Commerce
    price NUMERIC(12, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    buy_url TEXT,

    -- QR
    qr_label VARCHAR(100),

    -- AI assistant content (Phase 2 — null in Phase 1)
    ai_summary TEXT,
    ai_use_cases JSONB DEFAULT '[]',
    ai_comparisons JSONB DEFAULT '[]',
    ai_generation_status VARCHAR(50) DEFAULT 'never_generated',
    ai_generated_at TIMESTAMPTZ,

    -- State
    is_published BOOLEAN DEFAULT TRUE,
    slug VARCHAR(255) UNIQUE,
    status deletion_status NOT NULL DEFAULT 'active',
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID REFERENCES users(id),
    purge_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR PERSISTENCE CODES
CREATE TABLE qr_codes (
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

-- PRODUCT EMBEDDINGS (Phase 2 — recommendation engine)
CREATE TABLE product_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    embedding VECTOR(1536),  -- requires pgvector extension
    model_version VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR SCANS
CREATE TABLE qr_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    qr_code_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    device_type VARCHAR(20),
    device_os VARCHAR(50),
    browser VARCHAR(50),
    country_code VARCHAR(5),
    ip_hash VARCHAR(64),
    session_duration_seconds INTEGER,
    ar_used BOOLEAN DEFAULT FALSE,
    voice_used BOOLEAN DEFAULT FALSE,
    referrer_type VARCHAR(20) DEFAULT 'qr_scan'
);

-- USER INTERACTION HISTORY (Phase 3 — personalization)
CREATE TABLE user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50),  -- 'viewed', 'ar_used', 'voice_query', 'compared'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VOICE QUERIES LOG (Phase 2 — for Q&A improvement)
CREATE TABLE voice_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    query_text TEXT,
    response_text TEXT,
    language VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMPARISON SESSIONS (Phase 2)
CREATE TABLE comparison_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    product_ids JSONB NOT NULL,    -- array of product IDs being compared
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_project_id ON products(project_id);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_reset_password_tokens_user_id ON reset_password_tokens(user_id);
CREATE INDEX idx_reset_password_tokens_token_hash ON reset_password_tokens(token_hash);
CREATE INDEX idx_reset_password_tokens_expires_at ON reset_password_tokens(expires_at);
CREATE INDEX idx_reset_password_tokens_used ON reset_password_tokens(used);
CREATE INDEX idx_qr_codes_token ON qr_codes(qr_token);
CREATE INDEX idx_qr_codes_product_id ON qr_codes(product_id);
CREATE INDEX idx_qr_scans_product_id ON qr_scans(product_id);
CREATE INDEX idx_qr_scans_scanned_at ON qr_scans(scanned_at);
CREATE INDEX idx_qr_scans_qr_code_id ON qr_scans(qr_code_id);
CREATE INDEX idx_qr_scans_country_code ON qr_scans(country_code);
CREATE INDEX idx_qr_scans_device_type ON qr_scans(device_type);
CREATE INDEX idx_qr_scans_referrer_type ON qr_scans(referrer_type);
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_product_id ON user_interactions(product_id);
CREATE INDEX idx_products_usdz_url ON products(usdz_url) WHERE usdz_url IS NOT NULL;

-- AI ASSISTANT and recommendation engine indexes
CREATE INDEX idx_product_embeddings_vector ON product_embeddings USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_product_embeddings_product_id ON product_embeddings(product_id);
CREATE INDEX idx_user_interactions_product_type ON user_interactions(product_id, interaction_type);
CREATE INDEX idx_qr_scans_product_timestamp ON qr_scans(product_id, scanned_at DESC);
CREATE INDEX idx_two_factor_codes_user_id ON two_factor_codes(user_id);
CREATE INDEX idx_two_factor_codes_expires_at ON two_factor_codes(expires_at);
CREATE INDEX idx_two_factor_codes_used ON two_factor_codes(used);

-- UNIQUENESS: project name must be unique per user, case-insensitive for active projects
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_projects_user_name
    ON projects (user_id, LOWER(name)) WHERE status = 'active';

-- UNIQUENESS: product name must be unique per (user, project), case-insensitive for active products
-- Enforces the user->project->product uniqueness rule:
--   same product name in two different projects of the same user = OK
--   same product name in two different users' projects = OK
--   two products with the same name inside the same user's project = NOT allowed
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_products_user_project_name
    ON products (user_id, project_id, LOWER(name)) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_projects_purge_at ON projects(purge_at) WHERE purge_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_purge_at ON products(purge_at) WHERE purge_at IS NOT NULL;

