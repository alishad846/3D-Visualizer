const db = require('../db');

exports.getNotifications = async (req, res, next) => {
  const userId = req.user.userId;
  try {
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    return res.json({ notifications: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  const userId = req.user.userId;
  try {
    await db.query(
      'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
      [userId]
    );
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.clearNotifications = async (req, res, next) => {
  const userId = req.user.userId;
  try {
    await db.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Add a dummy welcome notification if none exist (for new users)
exports.ensureWelcomeNotification = async (userId) => {
  try {
    const existing = await db.query('SELECT id FROM notifications WHERE user_id = $1 LIMIT 1', [userId]);
    if (existing.rowCount === 0) {
      await db.query(
        'INSERT INTO notifications (user_id, text) VALUES ($1, $2)',
        [userId, 'Welcome to ScanVista Creator Pro! Your workspace is ready.']
      );
    }
  } catch (error) {
    console.error('Failed to create welcome notification:', error);
  }
};
