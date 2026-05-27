require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

function requireEnv(name, fallback) {
  const value = process.env[name] || fallback || '';
  if (isProduction && !value) {
    console.error(`[env] Missing required variable: ${name}`);
    process.exit(1);
  }
  if (!isProduction && !value && fallback) {
    console.warn(`[env] Using development fallback for ${name}`);
  }
  return value;
}

const JWT_SECRET = requireEnv(
  'JWT_SECRET',
  isProduction ? '' : 'dev_scanvista_jwt_secret_change_me'
);
const JWT_REFRESH_SECRET = requireEnv(
  'JWT_REFRESH_SECRET',
  isProduction ? '' : 'dev_scanvista_refresh_secret_change_me'
);

module.exports = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || '',
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_KEY || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  isProduction,
};