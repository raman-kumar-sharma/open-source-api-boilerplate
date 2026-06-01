import request from 'supertest';
import { app } from './helpers.js';

describe('Validation', () => {
  describe('Auth validation', () => {
    it('should reject invalid register payload', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'A',
          email: 'invalid-email',
          password: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid login payload', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email' });

      expect(response.status).toBe(400);
    });

    it('should reject invalid forgot password payload', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'bad' });

      expect(response.status).toBe(400);
    });

    it('should reject weak reset password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ token: 'sometoken', password: 'short' });

      expect(response.status).toBe(400);
    });
  });

  describe('User validation', () => {
    it('should reject invalid user ID', async () => {
      const response = await request(app)
        .get('/api/v1/users/invalid-id')
        .set({ Authorization: 'Bearer invalid' });

      expect([400, 401]).toContain(response.status);
    });
  });
});
