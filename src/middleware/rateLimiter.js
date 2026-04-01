const rateLimit = require('express-rate-limit');

const windowMinutes = parseInt(process.env.RATE_LIMIT_WINDOW) || 15;
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

const limiter = rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max: maxRequests,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,

  // Optional: helpful for debugging
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later'
    });
  }
});

module.exports = limiter;
