export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
};

export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  LOCKED: 423,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const MAX_LOGIN_ATTEMPTS = 5;
export const ACCOUNT_LOCK_DURATION_MS = 15 * 60 * 1000;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
