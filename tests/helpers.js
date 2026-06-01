import request from 'supertest';
import createApp from '../src/app.js';
import { createContainer } from '../src/container/index.js';
import User from '../src/models/user.model.js';
import { ROLES } from '../src/utils/constants.js';

const app = createApp(createContainer());

const validPassword = 'Password1';

const registerUser = async (overrides = {}) => {
  const userData = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: validPassword,
    ...overrides,
  };

  const response = await request(app)
    .post('/api/v1/auth/register')
    .send(userData);

  return { response, userData };
};

const createUserWithRole = async (role, emailSuffix = '') => {
  const email = `${role}${emailSuffix}${Date.now()}@example.com`;
  const user = await User.create({
    name: `${role} User`,
    email,
    password: validPassword,
    role,
    isEmailVerified: true,
  });

  const loginResponse = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: validPassword });

  return {
    user,
    accessToken: loginResponse.body.data.tokens.accessToken,
    refreshToken: loginResponse.body.data.tokens.refreshToken,
  };
};

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export { app, validPassword, registerUser, createUserWithRole, authHeader, ROLES };
