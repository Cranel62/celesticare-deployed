const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  drawFanCards,
  saveReading,
  getRecentReading,
  getReadingById,
  getSelectedSingleCard,
  saveSelectedSingleCard,
  getFashionAdvice
} = require('../controllers/tarotController');

router.get('/fan', drawFanCards);
router.get('/fashion-advice', getFashionAdvice);

// Protected routes
router.post('/save', protect, saveReading);
router.get('/recent', protect, getRecentReading);
router.get('/reading/:id', protect, getReadingById);
router.get('/single-card', protect, getSelectedSingleCard);
router.put('/single-card', protect, saveSelectedSingleCard);

module.exports = router;
