const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/assistant', aiLimiter, aiController.processAssistantQuery);

module.exports = router;
