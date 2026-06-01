import config from '../config/index.js';
import { getRequestContext } from '../lib/requestContext.js';

const PROBLEM_BASE = `${config.appUrl}/problems`;

export const PROBLEM_TYPES = {
  VALIDATION: `${PROBLEM_BASE}/validation-error`,
  UNAUTHORIZED: `${PROBLEM_BASE}/unauthorized`,
  FORBIDDEN: `${PROBLEM_BASE}/forbidden`,
  NOT_FOUND: `${PROBLEM_BASE}/not-found`,
  CONFLICT: `${PROBLEM_BASE}/conflict`,
  LOCKED: `${PROBLEM_BASE}/account-locked`,
  RATE_LIMIT: `${PROBLEM_BASE}/rate-limit`,
  INTERNAL: `${PROBLEM_BASE}/internal-error`,
};

const statusToType = (statusCode) => {
  const map = {
    400: PROBLEM_TYPES.VALIDATION,
    401: PROBLEM_TYPES.UNAUTHORIZED,
    403: PROBLEM_TYPES.FORBIDDEN,
    404: PROBLEM_TYPES.NOT_FOUND,
    409: PROBLEM_TYPES.CONFLICT,
    423: PROBLEM_TYPES.LOCKED,
    429: PROBLEM_TYPES.RATE_LIMIT,
    500: PROBLEM_TYPES.INTERNAL,
  };
  return map[statusCode] || `${PROBLEM_BASE}/error`;
};

export const buildProblemDetails = (err, req) => {
  const { requestId } = getRequestContext();
  const statusCode = err.statusCode || 500;
  const title = err.message || 'An error occurred';

  const problem = {
    type: statusToType(statusCode),
    title,
    status: statusCode,
    instance: req.originalUrl,
    success: false,
    message: title,
    ...(requestId && { correlationId: requestId }),
  };

  if (err.errors) {
    problem.errors = err.errors;
  }

  if (config.env === 'development' && err.stack) {
    problem.stack = err.stack;
  }

  return problem;
};
