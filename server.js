require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/database');
const logger = require('./src/utils/logger');
const fs = require('fs');

const PORT = process.env.PORT || 5000;

// Ensure required directories exist
const ensureDirectories = () => {
  const dirs = [
    'uploads',
    'uploads/medical-images',
    'uploads/lab-results',
    'uploads/documents',
    'uploads/profiles',
    'logs'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Database connection and server startup
const startServer = async () => {
  try {
    // Ensure directories exist
    ensureDirectories();
    
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync database (use { force: true } to drop and recreate tables - ONLY in development)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('Database synchronized');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();