const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadCsv = require('../middleware/uploadCsv');
const { bulkUploadLimiter } = require('../middleware/rateLimiter');

// Protect all product routes with JWT auth
router.use(auth);

router.get('/', productController.getProducts);
// Static routes MUST come before /:id param routes
router.get('/trash', productController.getDeletedProducts);
router.post('/bulk-upload/:projectId', bulkUploadLimiter, uploadCsv.single('file'), productController.bulkUploadProducts);
router.post('/upload-asset', upload.single('file'), productController.uploadAsset);
router.get('/incomplete/:projectId', productController.getIncompleteProducts);
router.get('/favorites/me', productController.getFavorites);
router.get('/:id', productController.getProductById);
router.post('/:id/favorite', productController.toggleFavorite);
router.post('/', productController.createProduct);
router.patch('/:id/model', productController.attachProductModel);
router.put('/:id', productController.updateProduct);
router.post('/:id/publish', productController.publishProduct);
router.post('/:id/restore', productController.restoreProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;