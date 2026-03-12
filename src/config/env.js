/**
 * Environment Configuration File
 * 
 * This file centralizes all environment variable access and provides
 * validation to ensure required variables are set before the application starts.
 */

require('dotenv').config();

/**
 * Validates that required environment variables are set
 * @param {string[]} requiredVars - Array of required environment variable names
 * @throws {Error} If any required variable is missing
 */
const validateEnvVars = (requiredVars) => {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};

// Required environment variables
const requiredVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET'
];

// Validate on module load
validateEnvVars(requiredVars);

/**
 * Environment configuration object
 * Centralizes all environment variable access with default values
 */
const env = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  
  // Database
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 5,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000
    }
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '7d',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d'
  },
  
  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@healthcare.com'
  },
  
  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/jpg,image/png').split(','),
    allowedDocumentTypes: (process.env.ALLOWED_DOCUMENT_TYPES || 'application/pdf,image/jpeg,image/png').split(',')
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug'
  },
  
  // Security
  security: {
    sessionSecret: process.env.SESSION_SECRET,
    passwordResetExpire: parseInt(process.env.PASSWORD_RESET_EXPIRE, 10) || 1 // hours
  },
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Redis (Optional)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || null,
    enabled: process.env.REDIS_ENABLED === 'true'
  },
  
  // SMS/Twilio (Optional)
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    enabled: process.env.TWILIO_ENABLED === 'true'
  },
  
  // Deployment
  deployment: {
    databaseUrl: process.env.DATABASE_URL, // For Heroku/cloud deployment
    herokuUrl: process.env.HEROKU_URL
  },
  
  // Feature Flags
  features: {
    emailEnabled: process.env.EMAIL_ENABLED === 'true',
    smsEnabled: process.env.SMS_ENABLED === 'true',
    fileUploadEnabled: process.env.FILE_UPLOAD_ENABLED !== 'false', // Default true
    redisEnabled: process.env.REDIS_ENABLED === 'true'
  },
  
  // Helper methods
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isProduction: () => process.env.NODE_ENV === 'production',
  isTest: () => process.env.NODE_ENV === 'test'
};

/**
 * Logs the current environment configuration (safe values only)
 */
env.logConfig = () => {
  console.log('='.repeat(50));
  console.log('Environment Configuration');
  console.log('='.repeat(50));
  console.log(`Environment: ${env.nodeEnv}`);
  console.log(`Port: ${env.port}`);
  console.log(`Database: ${env.database.name}@${env.database.host}:${env.database.port}`);
  console.log(`CORS Origin: ${Array.isArray(env.cors.origin) ? env.cors.origin.join(', ') : env.cors.origin}`);
  console.log(`Rate Limit: ${env.rateLimit.maxRequests} requests per ${env.rateLimit.windowMs / 60000} minutes`);
  console.log(`Upload Path: ${env.upload.uploadPath}`);
  console.log(`Max File Size: ${(env.upload.maxFileSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('Features:');
  console.log(`  - Email: ${env.features.emailEnabled ? 'Enabled' : 'Disabled'}`);
  console.log(`  - SMS: ${env.features.smsEnabled ? 'Enabled' : 'Disabled'}`);
  console.log(`  - File Upload: ${env.features.fileUploadEnabled ? 'Enabled' : 'Disabled'}`);
  console.log(`  - Redis: ${env.features.redisEnabled ? 'Enabled' : 'Disabled'}`);
  console.log('='.repeat(50));
};

module.exports = env;