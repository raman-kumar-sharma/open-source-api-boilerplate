import request from 'supertest';
import { app, authHeader } from './helpers.js';

describe('Error Handling', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/v1/unknown-route');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('should return standardized error format', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'missing@example.com', password: 'WrongPass1' });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      message: expect.any(String),
      status: 401,
      correlationId: expect.any(String),
    });
  });

  it('should handle JWT errors for invalid token', async () => {
    const response = await request(app)
      .get('/api/v1/users')
      .set(authHeader('invalid.jwt.token'));

    expect(response.status).toBe(401);
  });

  it('should return health check', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
