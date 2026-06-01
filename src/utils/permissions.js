import { ROLES } from './constants.js';

export const PERMISSIONS = {
  USERS_LIST: 'users:list',
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  PROFILE_WRITE: 'profile:write',
  AUDIT_READ: 'audit:read',
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MANAGER]: [
    PERMISSIONS.USERS_LIST,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.PROFILE_WRITE,
  ],
  [ROLES.USER]: [PERMISSIONS.USERS_READ, PERMISSIONS.PROFILE_WRITE],
};

export const roleHasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role] ?? [];
  return permissions.includes(permission);
};

export const getPermissionsForRole = (role) => ROLE_PERMISSIONS[role] ?? [];

export default ROLE_PERMISSIONS;
