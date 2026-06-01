import { HTTP_STATUS } from './constants.js';

class ApiError extends Error {
  constructor(statusCode, message, errors = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors = null) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message) {
    return new ApiError(HTTP_STATUS.CONFLICT, message);
  }

  static locked(message = 'Account temporarily locked') {
    return new ApiError(HTTP_STATUS.LOCKED, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, null, false);
  }
}

export default ApiError;
