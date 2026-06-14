const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

router.get('/', notificationController.getNotifications);
router.post('/read', notificationController.markAllAsRead);
router.delete('/', notificationController.clearNotifications);

module.exports = router;
