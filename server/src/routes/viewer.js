const express = require('express');
const router = express.Router();

const viewerController = require('../controllers/viewerController');

router.get('/qr/:token', viewerController.getQrCodeByToken);
router.get('/:productId', viewerController.getProductById);
router.post('/:productId/scan', viewerController.logScan);

module.exports = router;