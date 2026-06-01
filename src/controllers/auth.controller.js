import config from '../config/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth',
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: '/api/v1/auth',
  });
};

const getRefreshTokenFromRequest = (req) => {
  return req.body.refreshToken || req.cookies[REFRESH_TOKEN_COOKIE];
};

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = asyncHandler(async (req, res) => {
    const result = await this.authService.register(req.body);
    setRefreshTokenCookie(res, result.tokens.refreshToken);
    sendSuccess(res, HTTP_STATUS.CREATED, 'Registration successful', result);
  });

  login = asyncHandler(async (req, res) => {
    const meta = {
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    };
    const result = await this.authService.login(req.body, meta);
    setRefreshTokenCookie(res, result.tokens.refreshToken);
    sendSuccess(res, HTTP_STATUS.OK, 'Login successful', result);
  });

  refreshToken = asyncHandler(async (req, res) => {
    const refreshTokenValue = getRefreshTokenFromRequest(req);
    const meta = { userAgent: req.get('user-agent'), ipAddress: req.ip };
    const result = await this.authService.refreshAccessToken(refreshTokenValue, meta);
    sendSuccess(res, HTTP_STATUS.OK, 'Token refreshed', result);
  });

  logout = asyncHandler(async (req, res) => {
    const refreshTokenValue = getRefreshTokenFromRequest(req);
    const meta = { userAgent: req.get('user-agent'), ipAddress: req.ip };
    const result = await this.authService.logout(refreshTokenValue, meta);
    clearRefreshTokenCookie(res);
    sendSuccess(res, HTTP_STATUS.OK, result.message);
  });

  forgotPassword = asyncHandler(async (req, res) => {
    const result = await this.authService.forgotPassword(req.body.email);
    sendSuccess(res, HTTP_STATUS.OK, result.message);
  });

  resetPassword = asyncHandler(async (req, res) => {
    const meta = { userAgent: req.get('user-agent'), ipAddress: req.ip };
    const result = await this.authService.resetPassword(req.body, meta);
    sendSuccess(res, HTTP_STATUS.OK, result.message);
  });

  verifyEmail = asyncHandler(async (req, res) => {
    const token = req.body.token || req.query.token;
    const result = await this.authService.verifyEmail(token);
    sendSuccess(res, HTTP_STATUS.OK, result.message);
  });
}

export default AuthController;
