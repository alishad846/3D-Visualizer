const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { maskPII } = require('../utils/pii');

// Helper to validate email format
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
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
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'super_secret_scanvista_jwt_refresh_key_67890',
      { expiresIn: '7d' }
    );

    // 6. Hash refresh token and save to DB
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refreshTokenHash, expiresAt]
    );

    // 7. Set Refresh Token HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

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
      `SELECT id, name, email, password_hash, preferred_language
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (userResult.rowCount === 0) {
      // Return generic 401 error
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // Return generic 401 error (identical message)
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 3. Revoke all existing refresh tokens for this user before issuing new ones (Clean Sessions)
    await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [user.id]);

    // 4. Generate Tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'super_secret_scanvista_jwt_refresh_key_67890',
      { expiresIn: '7d' }
    );

    // 5. Store hashed refresh token in database
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refreshTokenHash, expiresAt]
    );

    // 6. Set HTTP-only Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

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

// POST /api/auth/refresh
exports.refresh = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token is required' });
  }

  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'super_secret_scanvista_jwt_refresh_key_67890'
    );
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

    // 2. Perform bcrypt compare to find matching row
    let matchedTokenRow = null;
    for (const row of dbTokens.rows) {
      const isMatch = await bcrypt.compare(refreshToken, row.token_hash);
      if (isMatch) {
        matchedTokenRow = row;
        break;
      }
    }

    // 3. Security measure: if no matching row found (compromised or reused token)
    if (!matchedTokenRow) {
      console.warn(`SECURITY ALERT: Token reuse anomaly detected for user ${userId}. Revoking all sessions.`);
      // Wipe ALL refresh tokens for this user
      await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'Session compromised. Please log in again.' });
    }

    // 4. Expiration check
    if (new Date(matchedTokenRow.expires_at) < new Date()) {
      // Delete specific expired token row
      await db.query('DELETE FROM refresh_tokens WHERE id = $1', [matchedTokenRow.id]);
      res.clearCookie('refreshToken');
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
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'User no longer exists' });
    }
    const user = userResult.rows[0];

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'super_secret_scanvista_jwt_refresh_key_67890',
      { expiresIn: '7d' }
    );

    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, newRefreshTokenHash, expiresAt]
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

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
    res.clearCookie('refreshToken');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'super_secret_scanvista_jwt_refresh_key_67890'
      );
    } catch (err) {
      res.clearCookie('refreshToken');
      return res.status(200).json({ success: true, message: 'Logged out successfully' });
    }

    const { userId } = decoded;

    // Fetch tokens, find match, and delete it from DB
    const dbTokens = await db.query(
      'SELECT id, token_hash FROM refresh_tokens WHERE user_id = $1',
      [userId]
    );

    for (const row of dbTokens.rows) {
      const isMatch = await bcrypt.compare(refreshToken, row.token_hash);
      if (isMatch) {
        await db.query('DELETE FROM refresh_tokens WHERE id = $1', [row.id]);
        break;
      }
    }

    res.clearCookie('refreshToken');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};