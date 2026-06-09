const db = require('../db');
const {
  FRONTEND_URL,
  PASSWORD_RESET_TOKEN_EXPIRY_MINUTES,
} = require('../config/env');
const {
  generatePasswordResetToken,
  hashPasswordResetToken,
} = require('../utils/tokens');
const { sendPasswordResetEmail } = require('./mailService');

function buildResetUrl(rawToken) {
  const baseUrl = FRONTEND_URL.replace(/\/$/, '');
  return `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
}

async function cleanupResetTokens() {
  await db.query(`
    DELETE FROM reset_password_tokens
    WHERE expires_at < NOW()
       OR (used = true AND used_at < NOW() - INTERVAL '24 hours')
  `);
}

async function createAndSendResetToken(user) {
  await cleanupResetTokens();

  const rawToken = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(rawToken);
  const expiryMinutes = PASSWORD_RESET_TOKEN_EXPIRY_MINUTES;

  await db.query(
    `INSERT INTO reset_password_tokens (user_id, token_hash, expires_at, used)
     VALUES ($1, $2, NOW() + ($3 || ' minutes')::interval, false)`,
    [user.id, tokenHash, expiryMinutes]
  );

  await sendPasswordResetEmail({
    to: user.email,
    resetUrl: buildResetUrl(rawToken),
    expiryMinutes,
  });
}

module.exports = {
  cleanupResetTokens,
  createAndSendResetToken,
};
