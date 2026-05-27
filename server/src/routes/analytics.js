const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

router.use(auth);

router.get('/product/:productId/overview', analyticsController.getProductOverview);
router.get('/product/:productId/realtime', analyticsController.getProductRealtime);
router.get('/product/:productId/trend', analyticsController.getProductTrend);
router.get('/product/:productId/geo', analyticsController.getProductGeo);
router.get('/product/:productId/devices', analyticsController.getProductDevices);
router.get('/product/:productId/sources', analyticsController.getProductSources);
router.get('/product/:productId/sessions', analyticsController.getProductSessions);

router.get('/project/:projectId/overview', analyticsController.getProjectOverview);
router.get('/project/:projectId/realtime', analyticsController.getProjectRealtime);
router.get('/project/:projectId/trend', analyticsController.getProjectTrend);
router.get('/project/:projectId/geo', analyticsController.getProjectGeo);
router.get('/project/:projectId/devices', analyticsController.getProjectDevices);
router.get('/project/:projectId/sources', analyticsController.getProjectSources);
router.get('/project/:projectId/products', analyticsController.getProjectProducts);

module.exports = router;