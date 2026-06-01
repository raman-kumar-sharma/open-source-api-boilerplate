import request from 'supertest';
import { app, validPassword, registerUser } from './helpers.js';
import Token from '../src/models/token.model.js';
import { TOKEN_TYPES } from '../src/utils/constants.js';
import { hashToken } from '../src/utils/token.js';

describe('Auth Routes', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const { response } = await registerUser({
        email: 'newuser@example.com',
        name: 'New User',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      await registerUser({ email: 'duplicate@example.com' });
      const { response } = await registerUser({ email: 'duplicate@example.com' });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const email = 'login@example.com';
      await registerUser({ email });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: validPassword });

      expect(response.status).toBe(200);
      expect(response.body.data.tokens.accessToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'wrong@example.com', password: 'WrongPass1' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    it('should refresh access token', async () => {
      const { response: registerRes } = await registerUser();
      const refreshToken = registerRes.body.data.tokens.refreshToken;

      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.data.accessToken).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const { response: registerRes } = await registerUser();
      const refreshToken = registerRes.body.data.tokens.refreshToken;

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should accept forgot password request', async () => {
      const email = 'forgot@example.com';
      await registerUser({ email });

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const email = 'reset@example.com';
      const { response: registerRes } = await registerUser({ email });
      const userId = registerRes.body.data.user.id;

      const rawToken = 'test-reset-token-123456789012345678901234';
      await Token.create({
        user: userId,
        token: hashToken(rawToken),
        type: TOKEN_TYPES.PASSWORD_RESET,
        expiresAt: new Date(Date.now() + 3600000),
      });

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ token: rawToken, password: 'NewPassword1' });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/v1/auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      const { response: registerRes } = await registerUser();
      const userId = registerRes.body.data.user.id;

      const rawToken = 'test-verify-token-12345678901234567890123';
      await Token.create({
        user: userId,
        token: hashToken(rawToken),
        type: TOKEN_TYPES.EMAIL_VERIFICATION,
        expiresAt: new Date(Date.now() + 3600000),
      });

      const response = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: rawToken });

      expect(response.status).toBe(200);
    });
  });
});
