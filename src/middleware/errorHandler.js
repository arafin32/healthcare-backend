const logger = require('../utils/logger');
const ResponseHelper = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return ResponseHelper.validationError(res, errors);
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return ResponseHelper.error(res, 'Duplicate entry found', 409);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ResponseHelper.unauthorized(res, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseHelper.unauthorized(res, 'Token expired');
  }

  // Default error
  return ResponseHelper.error(
    res,
    err.message || 'Internal server error',
    err.statusCode || 500
  );
};

module.exports = errorHandler;