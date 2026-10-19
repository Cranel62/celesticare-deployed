const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { saveBirthDetails, generateChart, saveChart, enhanceChart } = require('../controllers/astroController');

router.post('/save-birth-details', protect, saveBirthDetails);
router.post('/generate-chart', protect, generateChart);
router.put('/chart', protect, saveChart);
router.post('/enhance-chart', protect, enhanceChart);

module.exports = router;
