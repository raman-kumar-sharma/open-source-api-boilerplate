import { Router } from 'express';
import createAuthRoutes from './auth.routes.js';
import createUserRoutes from './user.routes.js';
import createAuditRoutes from './audit.routes.js';
import createHealthRoutes from './health.routes.js';
import createAuthenticate from '../middlewares/authenticate.js';

const createRoutes = (container) => {
  const router = Router();

  const authController = container.resolve('authController');
  const userController = container.resolve('userController');
  const auditController = container.resolve('auditController');
  const authenticate = createAuthenticate(container.resolve('userRepository'));

  router.use('/health', createHealthRoutes());
  router.use('/auth', createAuthRoutes(authController));
  router.use('/users', createUserRoutes(userController, authenticate));
  router.use('/audit-logs', createAuditRoutes(auditController, authenticate));

  return router;
};

export default createRoutes;
