import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { buildProblemDetails } from '../utils/problemDetails.js';
import { getRequestContext } from '../lib/requestContext.js';

const handleZodError = () => ApiError.badRequest('Validation failed');

const handleMongoValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return ApiError.badRequest('Validation failed', errors);
};

const handleMongoDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  return ApiError.conflict(`${field} already exists`);
};

const handleMongoCastError = () => ApiError.badRequest('Invalid ID format');

const handleJwtError = () => ApiError.unauthorized('Invalid token');

const handleJwtExpiredError = () => ApiError.unauthorized('Token expired');

const errorHandler = (err, req, res, _next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    if (error.name === 'ZodError') {
      error = handleZodError();
    } else if (error instanceof mongoose.Error.ValidationError) {
      error = handleMongoValidationError(error);
    } else if (error.code === 11000) {
      error = handleMongoDuplicateKeyError(error);
    } else if (error instanceof mongoose.Error.CastError) {
      error = handleMongoCastError();
    } else if (error.name === 'TokenExpiredError') {
      error = handleJwtExpiredError();
    } else if (error.name === 'JsonWebTokenError') {
      error = handleJwtError();
    } else {
      const { requestId } = getRequestContext();
      logger.error(`${req.method} ${req.originalUrl} - ${error.message}`, {
        stack: error.stack,
        correlationId: requestId,
      });
      error = ApiError.internal(error.message);
    }
  }

  if (error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${error.message}`, {
      stack: error.stack,
      correlationId: getRequestContext().requestId,
    });
  } else if (error.statusCode >= 400) {
    logger.warn(`${req.method} ${req.originalUrl} - ${error.message}`, {
      correlationId: getRequestContext().requestId,
    });
  }

  if (config.isProduction && !error.isOperational) {
    error = ApiError.internal('Internal server error');
  }

  const problem = buildProblemDetails(error, req);
  res.status(error.statusCode).json(problem);
};

export default errorHandler;
