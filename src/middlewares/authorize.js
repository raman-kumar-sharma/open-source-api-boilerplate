import ApiError from '../utils/ApiError.js';

const authorize = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  }

  next();
};

export default authorize;
