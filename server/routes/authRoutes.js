const express = require('express');
const router = express.Router();
const { register, verifyEmail, login, getCurrentUser, updateProfile, updateAesthetic, updateUndertone, setupSecurity, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // <-- This is the missing import
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.get('/verify', verifyEmail);
router.get('/verify/:token', verifyEmail);
router.post('/login', authLimiter, login); 
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);
router.post('/update-aesthetic', protect, updateAesthetic);
router.put('/update-undertone', protect, updateUndertone);
router.post('/security', protect, setupSecurity);
router.post('/delete-account', protect, deleteAccount);

module.exports = router;
