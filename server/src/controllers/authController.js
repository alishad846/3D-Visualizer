const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const {
  MAX_LOGIN_ATTEMPTS,
  ACCOUNT_LOCK_MINUTES,
} = require('../config/env');
const {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  hashRefreshToken,
  hashPasswordResetToken,
} = require('../utils/tokens');
const {
  refreshCookieOptions,
  clearRefreshCookieOptions,
} = require('../utils/cookies');
const {
  createAndSendResetToken,
  cleanupResetTokens,
} = require('../services/passwordResetService');

// Helper to validate email format
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const getDeviceInfo = (req) => {
  const ua = req.headers['user-agent'] || '';
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';

  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'MacOS';
  else if (ua.includes('X11') || ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Android')) os = 'Android';

  const type = (os === 'iOS' || os === 'Android') ? 'phone' : 'desktop';
  return { name: os, browser, type };
};

const isStrongPassword = (password) =>
  typeof password === 'string'
  && password.length >= 8
  && /[A-Z]/.test(password)
  && /[a-z]/.test(password)
  && /[0-9]/.test(password);

const forgotPasswordSuccess = {
  message: 'If an account exists for this email, a password reset link has been sent.',
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  // 1. Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  try {
    // 2. Check duplicate email
    const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rowCount > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // 3. Hash password with bcryptjs
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Insert user (name stored as-is; maskPII is for logs only)
    const insertResult = await db.query(
      `INSERT INTO users (name, email, password_hash, preferred_language)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, preferred_language`,
      [name.trim(), email, passwordHash, 'en']
    );
    const user = insertResult.rows[0];

    // 5. Generate Tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const deviceInfo = getDeviceInfo(req);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, device_info, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, refreshTokenHash, expiresAt, deviceInfo, ipAddress]
    );

    // // 7. Set Refresh Token HTTP-only cookie
    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production', // true in production
    //   sameSite: 'strict',
    //   maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    // });

    res.cookie('refreshToken', refreshToken, refreshCookieOptions());

    // 8. Return Access Token & User info (never password_hash)
    return res.status(201).json({
      accessToken,
      user
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // 1. Fetch user
    const userResult = await db.query(
      `SELECT id, name, email, password_hash, preferred_language, failed_login_attempts, locked_until, two_factor_enabled
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (userResult.rowCount === 0) {
      // Return generic 401 error
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const millisecondsRemaining = new Date(user.locked_until).getTime() - Date.now();
      return res.status(423).json({
        error: 'Account temporarily locked.',
        minutesRemaining: Math.max(1, Math.ceil(millisecondsRemaining / 60000)),
      });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const nextAttempts = Number(user.failed_login_attempts || 0) + 1;

      if (nextAttempts >= MAX_LOGIN_ATTEMPTS) {
        await db.query(
          `UPDATE users
           SET failed_login_attempts = 0,
               locked_until = NOW() + ($2 || ' minutes')::interval,
               updated_at = NOW()
           WHERE id = $1`,
          [user.id, ACCOUNT_LOCK_MINUTES]
        );

        return res.status(423).json({
          error: `Account locked for ${ACCOUNT_LOCK_MINUTES} minutes.`,
        });
      }

      await db.query(
        `UPDATE users
         SET failed_login_attempts = $2,
             updated_at = NOW()
         WHERE id = $1`,
        [user.id, nextAttempts]
      );

      return res.status(401).json({
        error: 'Incorrect password.',
        attemptsRemaining: Math.max(MAX_LOGIN_ATTEMPTS - nextAttempts, 0),
      });
    }

    await db.query(
      `UPDATE users
       SET failed_login_attempts = 0,
           locked_until = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [user.id]
    );

    // 3. Revoke all existing refresh tokens for this user before issuing new ones (Clean Sessions)
    await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [user.id]);

    // 4. Generate Tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const deviceInfo = getDeviceInfo(req);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, device_info, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, refreshTokenHash, expiresAt, deviceInfo, ipAddress]
    );

    res.cookie('refreshToken', refreshToken, refreshCookieOptions());

    // 7. Return Access Token & User details (omitting password_hash)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      preferred_language: user.preferred_language
    };

    return res.json({
      accessToken,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email || !isValidEmail(email)) {
      return res.json(forgotPasswordSuccess);
    }

    const userResult = await db.query(
      `SELECT id, email FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rowCount > 0) {
      try {
        await createAndSendResetToken(userResult.rows[0]);
      } catch (mailError) {
        console.error('Password reset email failed:', mailError.message);
      }
    } else {
      await cleanupResetTokens();
    }

    return res.json(forgotPasswordSuccess);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({
      error: 'Invalid or expired password reset token.',
    });
  }
  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters and include uppercase, lowercase, and a number.',
    });
  }

  const tokenHash = hashPasswordResetToken(token);
  let transactionStarted = false;

  try {
    await cleanupResetTokens();

    await db.query('BEGIN');
    transactionStarted = true;

    const tokenResult = await db.query(
      `SELECT rpt.id, rpt.user_id
       FROM reset_password_tokens rpt
       JOIN users u ON u.id = rpt.user_id
       WHERE rpt.token_hash = $1
         AND rpt.used = false
         AND rpt.expires_at > NOW()
       FOR UPDATE OF rpt`,
      [tokenHash]
    );

    if (tokenResult.rowCount === 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({
        error: 'Invalid or expired password reset token.',
      });
    }

    const resetToken = tokenResult.rows[0];
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await db.query(
      `UPDATE users
       SET password_hash = $1,
           failed_login_attempts = 0,
           locked_until = NULL,
           updated_at = NOW()
       WHERE id = $2`,
      [passwordHash, resetToken.user_id]
    );

    await db.query(
      `UPDATE reset_password_tokens
       SET used = true,
           used_at = NOW()
       WHERE id = $1`,
      [resetToken.id]
    );

    await db.query(
      `DELETE FROM refresh_tokens WHERE user_id = $1`,
      [resetToken.user_id]
    );

    await db.query('COMMIT');

    return res.json({
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (error) {
    if (transactionStarted) {
      await db.query('ROLLBACK');
    }
    next(error);
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token is required' });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch (err) {
    console.error('Refresh token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  const { userId } = decoded;

  try {
    // 1. Fetch all active refresh token rows for this user
    const dbTokens = await db.query(
      'SELECT id, token_hash, expires_at FROM refresh_tokens WHERE user_id = $1',
      [userId]
    );

    const refreshHash = hashRefreshToken(refreshToken);
    const matchedTokenRow = dbTokens.rows.find((row) => row.token_hash === refreshHash) || null;

    // 3. Security measure: if no matching row found (compromised or reused token)
    if (!matchedTokenRow) {
      console.warn(`SECURITY ALERT: Token reuse anomaly detected for user ${userId}. Revoking all sessions.`);
      // Wipe ALL refresh tokens for this user
      await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
      res.clearCookie('refreshToken', clearRefreshCookieOptions());
      return res.status(401).json({ error: 'Session compromised. Please log in again.' });
    }

    // 4. Expiration check
    if (new Date(matchedTokenRow.expires_at) < new Date()) {
      // Delete specific expired token row
      await db.query('DELETE FROM refresh_tokens WHERE id = $1', [matchedTokenRow.id]);
      res.clearCookie('refreshToken', clearRefreshCookieOptions());
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    // 5. Token Rotation: Delete old row, issue new rotated tokens
    await db.query('DELETE FROM refresh_tokens WHERE id = $1', [matchedTokenRow.id]);

    // Fetch user details for access token payload and return block
    const userResult = await db.query(
      'SELECT id, name, email, preferred_language FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rowCount === 0) {
      res.clearCookie('refreshToken', clearRefreshCookieOptions());
      return res.status(401).json({ error: 'User no longer exists' });
    }
    const user = userResult.rows[0];

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const deviceInfo = getDeviceInfo(req);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, device_info, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, newRefreshTokenHash, expiresAt, deviceInfo, ipAddress]
    );

    res.cookie('refreshToken', newRefreshToken, refreshCookieOptions());

    return res.json({
      accessToken: newAccessToken,
      user
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    res.clearCookie('refreshToken', clearRefreshCookieOptions());
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      res.clearCookie('refreshToken', clearRefreshCookieOptions());
      return res.status(200).json({ success: true, message: 'Logged out successfully' });
    }

    const { userId } = decoded;

    // Fetch tokens, find match, and delete it from DB
    const dbTokens = await db.query(
      'SELECT id, token_hash FROM refresh_tokens WHERE user_id = $1',
      [userId]
    );

    const logoutHash = hashRefreshToken(refreshToken);
    const matched = dbTokens.rows.find((row) => row.token_hash === logoutHash);
    if (matched) {
      await db.query('DELETE FROM refresh_tokens WHERE id = $1', [matched.id]);
    }

    res.clearCookie('refreshToken', clearRefreshCookieOptions());
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required' });
  }
  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number.' });
  }

  try {
    const userResult = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userResult.rowCount === 0) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/update-2fa
exports.updateTwoFactor = async (req, res, next) => {
  const { enabled } = req.body;
  const userId = req.user.userId;

  try {
    await db.query('UPDATE users SET two_factor_enabled = $1 WHERE id = $2', [enabled, userId]);
    return res.json({ success: true, two_factor_enabled: enabled });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/sessions
exports.getSessions = async (req, res, next) => {
  const userId = req.user.userId;
  const { refreshToken } = req.cookies;
  const currentHash = refreshToken ? hashRefreshToken(refreshToken) : null;

  try {
    const sessions = await db.query(
      'SELECT id, token_hash, expires_at, created_at, device_info, ip_address FROM refresh_tokens WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const formattedSessions = sessions.rows.map(s => {
      const isCurrent = s.token_hash === currentHash;
      const device = s.device_info || {};
      return {
        id: s.id,
        type: device.type || 'desktop',
        name: device.name || 'Unknown Device',
        browser: device.browser || 'Unknown Browser',
        ip_address: s.ip_address,
        created_at: s.created_at,
        active: isCurrent
      };
    });

    return res.json({ sessions: formattedSessions });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/sessions/logout-all
exports.logoutAllSessions = async (req, res, next) => {
  const userId = req.user.userId;
  const { refreshToken } = req.cookies;
  const currentHash = refreshToken ? hashRefreshToken(refreshToken) : null;

  try {
    if (currentHash) {
      await db.query('DELETE FROM refresh_tokens WHERE user_id = $1 AND token_hash != $2', [userId, currentHash]);
    } else {
      await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    }
    return res.json({ success: true, message: 'All other sessions logged out' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/sessions/:id/logout
exports.logoutSession = async (req, res, next) => {
  const userId = req.user.userId;
  const sessionId = req.params.id;

  try {
    await db.query('DELETE FROM refresh_tokens WHERE id = $1 AND user_id = $2', [sessionId, userId]);
    return res.json({ success: true, message: 'Session logged out' });
  } catch (error) {
    next(error);
  }
};

