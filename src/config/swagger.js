import config from './index.js';

const bearerSecurity = [{ bearerAuth: [] }];

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Open Source API Boilerplate',
    version: '1.0.0',
    description: 'REST API with JWT auth, RBAC, and MongoDB',
  },
  servers: [{ url: config.appUrl }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin', 'manager', 'user'] },
          isEmailVerified: { type: 'boolean' },
          isActive: { type: 'boolean' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
        },
      },
    },
  },
  tags: [{ name: 'Auth' }, { name: 'Users' }],
  paths: {
    '/api/v1/health': {
      get: { tags: ['Auth'], summary: 'Health check', responses: { 200: { description: 'OK' } } },
    },
    '/api/v1/auth/register': {
      post: { tags: ['Auth'], summary: 'Register', responses: { 201: { description: 'Created' } } },
    },
    '/api/v1/auth/login': {
      post: { tags: ['Auth'], summary: 'Login', responses: { 200: { description: 'OK' } } },
    },
    '/api/v1/auth/refresh-token': {
      post: { tags: ['Auth'], summary: 'Refresh token', responses: { 200: { description: 'OK' } } },
    },
    '/api/v1/auth/logout': {
      post: { tags: ['Auth'], summary: 'Logout', responses: { 200: { description: 'OK' } } },
    },
    '/api/v1/auth/forgot-password': {
      post: { tags: ['Auth'], summary: 'Forgot password', responses: { 200: { description: 'OK' } } },
    },
    '/api/v1/auth/reset-password': {
      post: { tags: ['Auth'], summary: 'Reset password', responses: { 200: { description: 'OK' } } },
    },
    '/api/v1/auth/verify-email': {
      post: { tags: ['Auth'], summary: 'Verify email', responses: { 200: { description: 'OK' } } },
    },
    '/api/v1/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        security: bearerSecurity,
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/v1/users/profile': {
      patch: {
        tags: ['Users'],
        summary: 'Update profile',
        security: bearerSecurity,
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/v1/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user',
        security: bearerSecurity,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user',
        security: bearerSecurity,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user',
        security: bearerSecurity,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
  },
};

export default swaggerSpec;
