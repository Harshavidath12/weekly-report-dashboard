const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  joinProject,
  leaveProject,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('Manager'), createProject);

router.route('/:id')
  .put(protect, authorize('Manager'), updateProject)
  .delete(protect, authorize('Manager'), deleteProject);

router.post('/:id/join', protect, joinProject);
router.post('/:id/leave', protect, leaveProject);

module.exports = router;
