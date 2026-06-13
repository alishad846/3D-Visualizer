const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

// Protect all project routes
router.use(auth);

router.post('/', projectController.createProject);
router.get('/my', projectController.getMyProjects);
router.get('/trash', projectController.getDeletedProjects);
router.get('/:id/restore-preflight', projectController.getRestorePreflight);
router.post('/:id/restore', projectController.restoreProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
