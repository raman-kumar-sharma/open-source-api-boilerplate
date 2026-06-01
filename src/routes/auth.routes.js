import { Router } from 'express';
import validate from '../middlewares/validate.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/auth.validator.js';
import { authRateLimiter } from '../middlewares/security.js';

const createAuthRoutes = (authController) => {
  const router = Router();

  router.use(authRateLimiter);

  router.post('/register', validate(registerSchema), authController.register);
  router.post('/login', validate(loginSchema), authController.login);
  router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
  router.post('/logout', authController.logout);
  router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
  router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
  router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

  return router;
};

export default createAuthRoutes;
