const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { submitFeedback, getFeedback } = require('../controllers/feedbackController');

const router = express.Router();
router.post('/submit', protect, submitFeedback);
router.get('/admin', protect, authorize('admin'), getFeedback);

module.exports = router;
