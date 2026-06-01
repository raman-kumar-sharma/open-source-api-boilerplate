import ApiError from '../utils/ApiError.js';
import { ROLES, TOKEN_TYPES } from '../utils/constants.js';
import { AUDIT_ACTIONS } from './audit.service.js';
import { authLoginAttempts } from '../observability/metrics.js';

const getTokenExpiryHours = (hours = 24) => {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

const formatAuthResponse = (user, accessToken, refreshToken) => ({
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  },
  tokens: {
    accessToken,
    refreshToken,
  },
});

class AuthService {
  constructor({
    config,
    userRepository,
    refreshTokenRepository,
    tokenRepository,
    emailService,
    tokenUtils,
    auditService,
  }) {
    this.config = config;
    this.userRepository = userRepository;
    this.refreshTokenRepository = refreshTokenRepository;
    this.tokenRepository = tokenRepository;
    this.emailService = emailService;
    this.tokenUtils = tokenUtils;
    this.auditService = auditService;
  }

  _getRefreshTokenExpiry() {
    return this.tokenUtils.parseExpiryToDate(this.config.jwt.refreshExpiresIn);
  }

  _auditMeta(meta) {
    return {
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    };
  }

  async register({ name, email, password }, meta = {}) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const user = await this.userRepository.create({
      name,
      email,
      password,
      role: ROLES.USER,
    });

    await this._sendEmailVerification(user);

    const accessToken = this.tokenUtils.generateAccessToken(
      user._id.toString(),
      user.role
    );
    const refreshToken = await this._createRefreshToken(user._id, meta);

    await this.auditService?.record({
      action: AUDIT_ACTIONS.REGISTER,
      resource: 'user',
      resourceId: user._id.toString(),
      actor: user._id,
      status: 'success',
      metadata: { email: user.email },
      ...this._auditMeta(meta),
    });

    return formatAuthResponse(user, accessToken, refreshToken);
  }

  async login({ email, password }, meta = {}) {
    const user = await this.userRepository.findByEmail(email, true);

    if (user?.isLocked?.()) {
      throw ApiError.locked(
        'Account temporarily locked due to multiple failed login attempts'
      );
    }

    if (!user || !(await user.comparePassword(password))) {
      if (user && this.config.features.accountLockoutEnabled) {
        await user.incrementLoginAttempts();
      }

      authLoginAttempts.inc({ status: 'failure' });

      await this.auditService?.record({
        action: AUDIT_ACTIONS.LOGIN_FAILED,
        resource: 'auth',
        actor: user?._id ?? null,
        status: 'failure',
        metadata: { email },
        ...this._auditMeta(meta),
      });

      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account has been deactivated');
    }

    if (this.config.features.accountLockoutEnabled) {
      await user.resetLoginAttempts();
    }

    const accessToken = this.tokenUtils.generateAccessToken(
      user._id.toString(),
      user.role
    );
    const refreshToken = await this._createRefreshToken(user._id, meta);

    authLoginAttempts.inc({ status: 'success' });

    await this.auditService?.record({
      action: AUDIT_ACTIONS.LOGIN,
      resource: 'auth',
      resourceId: user._id.toString(),
      actor: user._id,
      status: 'success',
      metadata: { email: user.email },
      ...this._auditMeta(meta),
    });

    return formatAuthResponse(user, accessToken, refreshToken);
  }

  async refreshAccessToken(refreshTokenValue, meta = {}) {
    if (!refreshTokenValue) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    try {
      this.tokenUtils.verifyRefreshToken(refreshTokenValue);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const storedToken = await this.refreshTokenRepository.findByToken(refreshTokenValue);
    if (!storedToken || storedToken.isRevoked) {
      throw ApiError.unauthorized('Refresh token has been revoked');
    }

    const user = storedToken.user;
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User not found or inactive');
    }

    const accessToken = this.tokenUtils.generateAccessToken(
      user._id.toString(),
      user.role
    );

    await this.auditService?.record({
      action: AUDIT_ACTIONS.TOKEN_REFRESH,
      resource: 'auth',
      resourceId: user._id.toString(),
      actor: user._id,
      status: 'success',
      ...this._auditMeta(meta),
    });

    return {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(refreshTokenValue, meta = {}) {
    let actor = null;

    if (refreshTokenValue) {
      const stored = await this.refreshTokenRepository.findByToken(refreshTokenValue);
      actor = stored?.user?._id ?? null;
      await this.refreshTokenRepository.revokeByToken(refreshTokenValue);
    }

    await this.auditService?.record({
      action: AUDIT_ACTIONS.LOGOUT,
      resource: 'auth',
      actor,
      status: 'success',
      ...this._auditMeta(meta),
    });

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    const rawToken = this.tokenUtils.generateRandomToken();
    const hashedToken = this.tokenUtils.hashToken(rawToken);

    await this.tokenRepository.deleteByUserAndType(user._id, TOKEN_TYPES.PASSWORD_RESET);
    await this.tokenRepository.create({
      user: user._id,
      token: hashedToken,
      type: TOKEN_TYPES.PASSWORD_RESET,
      expiresAt: getTokenExpiryHours(1),
    });

    await this.emailService.sendPasswordResetEmail(user.email, rawToken);

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPassword({ token, password }, meta = {}) {
    const hashedToken = this.tokenUtils.hashToken(token);
    const tokenDoc = await this.tokenRepository.findValidToken(
      hashedToken,
      TOKEN_TYPES.PASSWORD_RESET
    );

    if (!tokenDoc) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    const user = await this.userRepository.findById(tokenDoc.user._id, true);
    user.password = password;
    await user.save();

    await this.tokenRepository.markAsUsed(tokenDoc._id);
    await this.refreshTokenRepository.revokeAllForUser(user._id);

    await this.auditService?.record({
      action: AUDIT_ACTIONS.PASSWORD_RESET,
      resource: 'user',
      resourceId: user._id.toString(),
      actor: user._id,
      status: 'success',
      ...this._auditMeta(meta),
    });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token) {
    const hashedToken = this.tokenUtils.hashToken(token);
    const tokenDoc = await this.tokenRepository.findValidToken(
      hashedToken,
      TOKEN_TYPES.EMAIL_VERIFICATION
    );

    if (!tokenDoc) {
      throw ApiError.badRequest('Invalid or expired verification token');
    }

    await this.userRepository.updateById(tokenDoc.user._id, { isEmailVerified: true });
    await this.tokenRepository.markAsUsed(tokenDoc._id);

    return { message: 'Email verified successfully' };
  }

  async _sendEmailVerification(user) {
    const rawToken = this.tokenUtils.generateRandomToken();
    const hashedToken = this.tokenUtils.hashToken(rawToken);

    await this.tokenRepository.deleteByUserAndType(user._id, TOKEN_TYPES.EMAIL_VERIFICATION);
    await this.tokenRepository.create({
      user: user._id,
      token: hashedToken,
      type: TOKEN_TYPES.EMAIL_VERIFICATION,
      expiresAt: getTokenExpiryHours(24),
    });

    await this.emailService.sendVerificationEmail(user.email, rawToken);
  }

  async _createRefreshToken(userId, { userAgent, ipAddress } = {}) {
    const refreshToken = this.tokenUtils.generateRefreshToken(userId.toString());

    await this.refreshTokenRepository.create({
      user: userId,
      token: refreshToken,
      expiresAt: this._getRefreshTokenExpiry(),
      userAgent,
      ipAddress,
    });

    return refreshToken;
  }
}

export default AuthService;
