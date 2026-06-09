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

function numberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const JWT_SECRET = requireEnv(
  'JWT_SECRET',
  isProduction ? '' : 'dev_scanvista_jwt_secret_change_me'
);
const JWT_REFRESH_SECRET = requireEnv(
  'JWT_REFRESH_SECRET',
  isProduction ? '' : 'dev_scanvista_refresh_secret_change_me'
);
const SMTP_EMAIL = requireEnv('SMTP_EMAIL', isProduction ? '' : '');
const SMTP_APP_PASSWORD = requireEnv('SMTP_APP_PASSWORD', isProduction ? '' : '');
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

module.exports = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || '',
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_KEY || '',
  CLIENT_URL,
  FRONTEND_URL: process.env.FRONTEND_URL || CLIENT_URL,
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  SMTP_EMAIL,
  SMTP_APP_PASSWORD,
  PASSWORD_RESET_TOKEN_EXPIRY_MINUTES: numberEnv('PASSWORD_RESET_TOKEN_EXPIRY_MINUTES', 5),
  MAX_LOGIN_ATTEMPTS: numberEnv('MAX_LOGIN_ATTEMPTS', 3),
  ACCOUNT_LOCK_MINUTES: numberEnv('ACCOUNT_LOCK_MINUTES', 5),
  isProduction,
};
