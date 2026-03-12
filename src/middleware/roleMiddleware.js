const ResponseHelper = require('../utils/responseHelper');

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ResponseHelper.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

module.exports = roleMiddleware;