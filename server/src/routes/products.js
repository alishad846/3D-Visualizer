const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadCsv = require('../middleware/uploadCsv');

const bulkUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many bulk upload attempts, please try again later.',
});

// Protect all product routes with JWT auth
router.use(auth);

router.get('/', productController.getProducts);
router.post('/bulk-upload/:projectId', bulkUploadLimiter, uploadCsv.single('file'), productController.bulkUploadProducts);
router.post('/upload-asset', upload.single('file'), productController.uploadAsset);
router.get('/incomplete/:projectId', productController.getIncompleteProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.patch('/:id/model', productController.attachProductModel);
router.put('/:id', productController.updateProduct);
router.post('/:id/publish', productController.publishProduct);

module.exports = router;