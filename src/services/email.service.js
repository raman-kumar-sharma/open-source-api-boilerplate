import config from '../config/index.js';
import logger from '../utils/logger.js';

class EmailService {
  async sendVerificationEmail(email, token) {
    const verificationUrl = `${config.appUrl}/api/v1/auth/verify-email?token=${token}`;
    logger.info(`[Email] Verification email for ${email}: ${verificationUrl}`);
    return { sent: true, verificationUrl };
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${config.appUrl}/reset-password?token=${token}`;
    logger.info(`[Email] Password reset email for ${email}: ${resetUrl}`);
    return { sent: true, resetUrl };
  }
}

export default EmailService;
