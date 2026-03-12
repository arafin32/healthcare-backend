/**
 * Database Configuration
 * 
 * Configures Sequelize ORM connection to PostgreSQL database
 * Uses environment variables from env.js
 */

const { Sequelize } = require('sequelize');
const env = require('./env');

/**
 * Initialize Sequelize with database configuration
 * Supports both individual connection parameters and DATABASE_URL (for cloud deployment)
 */
let sequelize;

if (env.deployment.databaseUrl) {
  // Use DATABASE_URL for cloud deployment (Heroku, Railway, etc.)
  sequelize = new Sequelize(env.deployment.databaseUrl, {
    dialect: 'postgres',
    logging: env.database.logging ? console.log : false,
    pool: env.database.pool,
    dialectOptions: {
      ssl: env.isProduction() ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  });
} else {
  // Use individual connection parameters for local development
  sequelize = new Sequelize(
    env.database.name,
    env.database.user,
    env.database.password,
    {
      host: env.database.host,
      port: env.database.port,
      dialect: env.database.dialect,
      logging: env.database.logging ? console.log : false,
      pool: env.database.pool,
      
      // Define table naming conventions
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true
      },
      
      // Timezone configuration
      timezone: '+00:00',
      
      // Query options
      query: {
        raw: false
      }
    }
  );
}

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful
 */
sequelize.testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error.message);
    return false;
  }
};

/**
 * Sync database models
 * @param {Object} options - Sequelize sync options
 * @returns {Promise<void>}
 */
sequelize.syncDatabase = async (options = {}) => {
  try {
    const defaultOptions = {
      alter: env.isDevelopment(), // Auto-alter tables in development
      force: false // Never force in production
    };
    
    const syncOptions = { ...defaultOptions, ...options };
    
    // Prevent force sync in production
    if (env.isProduction() && syncOptions.force) {
      console.warn('⚠ Force sync is disabled in production');
      syncOptions.force = false;
    }
    
    await sequelize.sync(syncOptions);
    console.log('✓ Database synchronized successfully');
  } catch (error) {
    console.error('✗ Error synchronizing database:', error.message);
    throw error;
  }
};

/**
 * Close database connection
 * @returns {Promise<void>}
 */
sequelize.closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('✓ Database connection closed');
  } catch (error) {
    console.error('✗ Error closing database connection:', error.message);
  }
};

// Export sequelize instance
module.exports = sequelize;