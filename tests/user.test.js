import request from 'supertest';
import { app, registerUser, createUserWithRole, authHeader, ROLES } from './helpers.js';

describe('User Routes', () => {
  let adminToken;
  let userToken;
  let regularUserId;

  beforeEach(async () => {
    const admin = await createUserWithRole(ROLES.ADMIN);
    adminToken = admin.accessToken;

    const { response } = await registerUser({ email: 'regular@example.com' });
    userToken = response.body.data.tokens.accessToken;
    regularUserId = response.body.data.user.id;
  });

  describe('GET /api/v1/users', () => {
    it('should allow manager to list users', async () => {
      const manager = await createUserWithRole(ROLES.MANAGER);

      const response = await request(app)
        .get('/api/v1/users?page=1&limit=10')
        .set(authHeader(manager.accessToken));

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.page).toBe(1);
    });

    it('should deny regular user from listing users', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set(authHeader(userToken));

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should allow user to view own profile', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${regularUserId}`)
        .set(authHeader(userToken));

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe('regular@example.com');
    });
  });

  describe('PATCH /api/v1/users/profile', () => {
    it('should update own profile', async () => {
      const response = await request(app)
        .patch('/api/v1/users/profile')
        .set(authHeader(userToken))
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated Name');
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should allow admin to update user', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${regularUserId}`)
        .set(authHeader(adminToken))
        .send({ role: ROLES.MANAGER });

      expect(response.status).toBe(200);
      expect(response.body.data.role).toBe(ROLES.MANAGER);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should allow admin to delete user', async () => {
      const { response: regRes } = await registerUser({ email: 'todelete@example.com' });
      const userId = regRes.body.data.user.id;

      const response = await request(app)
        .delete(`/api/v1/users/${userId}`)
        .set(authHeader(adminToken));

      expect(response.status).toBe(200);
    });
  });
});
