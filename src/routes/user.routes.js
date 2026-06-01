import { Router } from 'express';
import requirePermission from '../middlewares/requirePermission.js';
import validate from '../middlewares/validate.js';
import {
  listUsersSchema,
  getUserSchema,
  updateUserSchema,
  deleteUserSchema,
  updateProfileSchema,
} from '../validators/user.validator.js';
import { PERMISSIONS } from '../utils/permissions.js';

const createUserRoutes = (userController, authenticate) => {
  const router = Router();

  router.use(authenticate);

  router.patch(
    '/profile',
    requirePermission(PERMISSIONS.PROFILE_WRITE),
    validate(updateProfileSchema),
    userController.updateProfile
  );

  router.get(
    '/',
    requirePermission(PERMISSIONS.USERS_LIST),
    validate(listUsersSchema),
    userController.getUsers
  );

  router.get(
    '/:id',
    requirePermission(PERMISSIONS.USERS_READ),
    validate(getUserSchema),
    userController.getUserById
  );

  router.put(
    '/:id',
    requirePermission(PERMISSIONS.USERS_WRITE),
    validate(updateUserSchema),
    userController.updateUser
  );

  router.delete(
    '/:id',
    requirePermission(PERMISSIONS.USERS_DELETE),
    validate(deleteUserSchema),
    userController.deleteUser
  );

  return router;
};

export default createUserRoutes;
