const rateLimit = require('express-rate-limit');

// Strict limiter for auth endpoints (prevents brute-force)
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP[cite: 10]
  message: { success: false, message: 'Too many attempts. Please try again after 5 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter[cite: 10]
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { success: false, message: 'Too many API requests, please slow down.' },
});

module.exports = { authLimiter, apiLimiter };