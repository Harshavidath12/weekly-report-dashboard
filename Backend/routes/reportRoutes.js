const express = require('express');
const router = express.Router();
const {
  createReport,
  updateReport,
  getMyReports,
  getReportById,
} = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').post(protect, createReport);
router.route('/me').get(protect, getMyReports);
router.route('/:id').put(protect, updateReport).get(protect, getReportById);

module.exports = router;
