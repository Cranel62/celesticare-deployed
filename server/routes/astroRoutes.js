const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { saveBirthDetails, generateChart, enhanceChart } = require('../controllers/astroController');

router.post('/save-birth-details', protect, saveBirthDetails);
router.post('/generate-chart', protect, generateChart);
router.post('/enhance-chart', protect, enhanceChart);

module.exports = router;