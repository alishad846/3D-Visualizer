const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

// Protect all project routes
router.use(auth);

router.post('/', projectController.createProject);
router.get('/my', projectController.getMyProjects);

module.exports = router;