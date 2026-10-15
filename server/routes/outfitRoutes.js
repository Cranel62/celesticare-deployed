const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { saveOutfit, getLatestOutfit, deleteOutfit } = require('../controllers/outfitController');

router.post('/save', protect, saveOutfit);
router.get('/latest', protect, getLatestOutfit);
router.delete('/latest', protect, deleteOutfit);

module.exports = router;