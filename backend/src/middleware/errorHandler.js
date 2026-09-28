const logger = require('../utils/logger');
const { errorResponse } = require('../utils/apiResponse');

function errorHandler(err, req, res, next) {
  logger.error(`Unhandled Error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return errorResponse(res, 'Validation Error', 400, 'VALIDATION_ERROR', errors);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    return errorResponse(res, `Duplicate field value entered for: ${field}`, 400, 'DUPLICATE_ERROR');
  }

  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401, 'UNAUTHORIZED');
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401, 'TOKEN_EXPIRED');
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errorCode = err.errorCode || 'INTERNAL_ERROR';

  return errorResponse(res, message, statusCode, errorCode);
}

module.exports = errorHandler;
