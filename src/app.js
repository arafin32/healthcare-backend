const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const limiter = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const app = express();

// ✅ Security middleware
app.use(helmet());

// ✅ CORS (IMPORTANT for frontend-backend communication)
app.use(cors({
  origin: process.env.CORS_ORIGIN, // avoid '*' when using credentials
  credentials: true
}));

// ✅ Rate limiting (already correct path-based)
app.use('/api', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Static files (uploads)
app.use('/uploads', express.static('uploads'));

// Routes
app.use(routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
