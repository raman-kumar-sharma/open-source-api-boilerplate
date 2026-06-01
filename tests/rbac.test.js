import request from 'supertest';
import { app, registerUser, createUserWithRole, authHeader, ROLES } from './helpers.js';

describe('Role Based Access Control', () => {
  let adminToken;
  let managerToken;
  let userToken;
  let targetUserId;

  beforeEach(async () => {
    const admin = await createUserWithRole(ROLES.ADMIN, 'a');
    adminToken = admin.accessToken;

    const manager = await createUserWithRole(ROLES.MANAGER, 'm');
    managerToken = manager.accessToken;

    const { response } = await registerUser({ email: 'rbacuser@example.com' });
    userToken = response.body.data.tokens.accessToken;
    targetUserId = response.body.data.user.id;
  });

  it('only admin can delete users', async () => {
    const managerDelete = await request(app)
      .delete(`/api/v1/users/${targetUserId}`)
      .set(authHeader(managerToken));

    expect(managerDelete.status).toBe(403);

    const userDelete = await request(app)
      .delete(`/api/v1/users/${targetUserId}`)
      .set(authHeader(userToken));

    expect(userDelete.status).toBe(403);

    const { response: regRes } = await registerUser({ email: 'deleteme@example.com' });
    const deleteId = regRes.body.data.user.id;

    const adminDelete = await request(app)
      .delete(`/api/v1/users/${deleteId}`)
      .set(authHeader(adminToken));

    expect(adminDelete.status).toBe(200);
  });

  it('manager can view users list', async () => {
    const response = await request(app)
      .get('/api/v1/users')
      .set(authHeader(managerToken));

    expect(response.status).toBe(200);
  });

  it('user can only view own profile when accessing another user', async () => {
    const admin = await createUserWithRole(ROLES.ADMIN, 'view');
    const otherUserId = admin.user._id.toString();

    const response = await request(app)
      .get(`/api/v1/users/${otherUserId}`)
      .set(authHeader(userToken));

    expect(response.status).toBe(403);
  });

  it('user can view own profile', async () => {
    const response = await request(app)
      .get(`/api/v1/users/${targetUserId}`)
      .set(authHeader(userToken));

    expect(response.status).toBe(200);
  });

  it('requires authentication for protected routes', async () => {
    const response = await request(app).get('/api/v1/users');
    expect(response.status).toBe(401);
  });
});
