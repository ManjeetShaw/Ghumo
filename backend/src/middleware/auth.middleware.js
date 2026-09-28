const { verifyToken } = require('../utils/jwt');
const User = require('../models/user.model');
const { errorResponse } = require('../utils/apiResponse');

async function protect(req, res, next) {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Access denied. No token provided.', 401, 'UNAUTHORIZED');
    }

    const decoded = verifyToken(token);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return errorResponse(
        res,
        'The user belonging to this token no longer exists.',
        401,
        'UNAUTHORIZED'
      );
    }

    if (!currentUser.isActive) {
      return errorResponse(res, 'This user account has been deactivated.', 403, 'FORBIDDEN');
    }

    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Invalid or expired authentication token.', 401, 'UNAUTHORIZED');
    }
    next(err);
  }
}

function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        'You do not have permission to perform this action.',
        403,
        'FORBIDDEN'
      );
    }
    next();
  };
}

async function optionalAuth(req, res, next) {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      const currentUser = await User.findById(decoded.id);
      if (currentUser && currentUser.isActive) {
        req.user = currentUser;
      }
    }
    next();
  } catch (err) {
    // If token is invalid or expired in optionalAuth, proceed as unauthenticated guest
    next();
  }
}

module.exports = {
  protect,
  restrictTo,
  optionalAuth,
};
