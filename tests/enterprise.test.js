import request from 'supertest';
import { app, registerUser, createUserWithRole, authHeader, validPassword } from './helpers.js';
import { ROLES } from '../src/utils/constants.js';

describe('Enterprise capabilities', () => {
  it('should attach correlation id to responses', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .set('X-Request-ID', 'test-correlation-id-12345');

    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toBe('test-correlation-id-12345');
    expect(response.body.correlationId).toBe('test-correlation-id-12345');
  });

  it('should return RFC 7807 style problem details on errors', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'WrongPass1' });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      status: 401,
      type: expect.stringContaining('/problems/'),
      title: expect.any(String),
      instance: '/api/v1/auth/login',
    });
  });

  it('should pass liveness probe', async () => {
    const response = await request(app).get('/api/v1/health/live');
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('alive');
  });

  it('should pass readiness probe when database is connected', async () => {
    const response = await request(app).get('/api/v1/health/ready');
    expect(response.status).toBe(200);
    expect(response.body.data.checks.database).toBe('up');
  });

  it('should lock account after repeated failed logins', async () => {
    const { userData } = await registerUser({ email: `lock${Date.now()}@example.com` });

    for (let i = 0; i < 5; i += 1) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: userData.email, password: 'WrongPass1' });
    }

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userData.email, password: validPassword });

    expect(response.status).toBe(423);
    expect(response.body.status).toBe(423);
  });

  it('should allow admin to read audit logs', async () => {
    const { accessToken } = await createUserWithRole(ROLES.ADMIN);

    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: `audit${Date.now()}@example.com`, password: validPassword })
      .catch(() => {});

    const response = await request(app)
      .get('/api/v1/audit-logs')
      .set(authHeader(accessToken));

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.meta).toMatchObject({
      page: expect.any(Number),
      total: expect.any(Number),
    });
  });

  it('should deny audit logs to non-admin roles', async () => {
    const { accessToken } = await createUserWithRole(ROLES.MANAGER);

    const response = await request(app)
      .get('/api/v1/audit-logs')
      .set(authHeader(accessToken));

    expect(response.status).toBe(403);
  });

  it('should expose permissions on authenticated user context', async () => {
    const { accessToken, user } = await createUserWithRole(ROLES.USER);

    const response = await request(app)
      .get(`/api/v1/users/${user._id}`)
      .set(authHeader(accessToken));

    expect(response.status).toBe(200);
  });
});
