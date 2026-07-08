const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/aiController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/chat', protect, authorize('Manager'), chatWithAI);

module.exports = router;
