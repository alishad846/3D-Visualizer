const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommendController');

router.get('/:productId', recommendController.getRecommendations);

module.exports = router;
