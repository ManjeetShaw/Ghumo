/**
 * Standardized API Response Helpers
 */

function successResponse(res, data = {}, message = 'Operation completed successfully', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function errorResponse(res, message = 'An error occurred', statusCode = 500, errorCode = 'INTERNAL_ERROR', errors = null) {
  const payload = {
    success: false,
    error: {
      code: errorCode,
      message,
    },
  };

  if (errors) {
    payload.error.details = errors;
  }

  return res.status(statusCode).json(payload);
}

module.exports = {
  successResponse,
  errorResponse,
};
