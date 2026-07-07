const express = require('express');
const router = express.Router();
const {
  createReport,
  updateReport,
  getMyReports,
  getReportById,
  getAllReports,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/').post(protect, createReport).get(protect, authorize('Manager'), getAllReports);
router.route('/me').get(protect, getMyReports);
router.route('/:id').put(protect, updateReport).get(protect, getReportById);

module.exports = router;
