const crypto = require('crypto');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../config/env');

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  hashRefreshToken,
};
