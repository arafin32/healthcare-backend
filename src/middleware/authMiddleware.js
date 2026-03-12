const { verifyToken } = require('../utils/jwtHelper');
const ResponseHelper = require('../utils/responseHelper');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return ResponseHelper.unauthorized(res, 'No token provided');
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return ResponseHelper.unauthorized(res, 'Invalid or expired token');
    }

    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      return ResponseHelper.unauthorized(res, 'User not found or inactive');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    return ResponseHelper.error(res, 'Authentication failed', 401);
  }
};

module.exports = authMiddleware;