const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  drawFanCards,
  saveReading,
  getRecentReading,
  getReadingById,
  getFashionAdvice
} = require('../controllers/tarotController');

router.get('/fan', drawFanCards);
router.get('/fashion-advice', getFashionAdvice);

// Protected routes
router.post('/save', protect, saveReading);
router.get('/recent', protect, getRecentReading);
router.get('/reading/:id', protect, getReadingById);

module.exports = router;