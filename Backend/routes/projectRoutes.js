const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('Manager'), createProject);

router.route('/:id')
  .put(protect, authorize('Manager'), updateProject)
  .delete(protect, authorize('Manager'), deleteProject);

module.exports = router;
