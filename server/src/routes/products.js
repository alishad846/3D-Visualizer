const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protect all product routes with JWT auth
router.use(auth);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.post('/:id/publish', productController.publishProduct);
router.post('/upload-asset', upload.single('file'), productController.uploadAsset);

module.exports = router;