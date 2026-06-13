const express = require('express');
const router = express.Router();

const viewerController = require('../controllers/viewerController');

router.get('/showcase', viewerController.getPublicShowcase);
router.get('/analytics', viewerController.getPublicAnalytics);
router.get('/qr/:token', viewerController.getQrCodeByToken);
router.get('/compare', viewerController.getProductsForComparison);
router.get('/:productId/recommendations', viewerController.getRecommendedProducts);
router.get('/:productId', viewerController.getProductById);
router.post('/:productId/scan', viewerController.logScan);

module.exports = router;
