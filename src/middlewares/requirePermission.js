import ApiError from '../utils/ApiError.js';
import { roleHasPermission } from '../utils/permissions.js';

const requirePermission = (...requiredPermissions) => (req, _res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  const hasAll = requiredPermissions.every((permission) =>
    roleHasPermission(req.user.role, permission)
  );

  if (!hasAll) {
    return next(ApiError.forbidden('Insufficient permissions for this operation'));
  }

  next();
};

export default requirePermission;
