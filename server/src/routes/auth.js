const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/verify-2fa', otpLimiter, authController.verifyTwoFactor);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Security Settings Routes
const requireAuth = require('../middleware/auth');
router.post('/change-password', requireAuth, authController.changePassword);
router.post('/update-2fa', requireAuth, authController.updateTwoFactor);
router.get('/sessions', requireAuth, authController.getSessions);
router.post('/sessions/logout-all', requireAuth, authController.logoutAllSessions);
router.post('/sessions/:id/logout', requireAuth, authController.logoutSession);

router.get('/me', requireAuth, authController.getMe);
router.put('/profile', requireAuth, authController.updateProfile);
router.put('/preferences', requireAuth, authController.updatePreferences);
module.exports = router;
