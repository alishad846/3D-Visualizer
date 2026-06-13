const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-2fa', authController.verifyTwoFactor);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Security Settings Routes
const requireAuth = require('../middleware/auth');
router.post('/change-password', requireAuth, authController.changePassword);
router.post('/update-2fa', requireAuth, authController.updateTwoFactor);
router.get('/sessions', requireAuth, authController.getSessions);
router.post('/sessions/logout-all', requireAuth, authController.logoutAllSessions);
router.post('/sessions/:id/logout', requireAuth, authController.logoutSession);

module.exports = router;
