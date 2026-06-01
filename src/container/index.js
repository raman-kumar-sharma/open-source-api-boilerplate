import config from '../config/index.js';
import UserRepository from '../repositories/user.repository.js';
import TokenRepository from '../repositories/token.repository.js';
import RefreshTokenRepository from '../repositories/refreshToken.repository.js';
import AuditLogRepository from '../repositories/auditLog.repository.js';
import EmailService from '../services/email.service.js';
import AuditService from '../services/audit.service.js';
import AuthService from '../services/auth.service.js';
import UserService from '../services/user.service.js';
import AuthController from '../controllers/auth.controller.js';
import UserController from '../controllers/user.controller.js';
import AuditController from '../controllers/audit.controller.js';
import * as tokenUtils from '../utils/token.js';

class Container {
  constructor() {
    this.registrations = new Map();
  }

  register(name, factory, { singleton = true } = {}) {
    this.registrations.set(name, { factory, singleton, instance: undefined });
    return this;
  }

  resolve(name) {
    const registration = this.registrations.get(name);

    if (!registration) {
      throw new Error(`Dependency not registered: ${name}`);
    }

    if (!registration.singleton) {
      return registration.factory(this);
    }

    if (registration.instance === undefined) {
      registration.instance = registration.factory(this);
    }

    return registration.instance;
  }
}

export const createContainer = () => {
  const container = new Container();

  container.register('config', () => config);
  container.register('tokenUtils', () => tokenUtils);
  container.register('userRepository', () => new UserRepository());
  container.register('tokenRepository', () => new TokenRepository());
  container.register('refreshTokenRepository', () => new RefreshTokenRepository());
  container.register('auditLogRepository', () => new AuditLogRepository());
  container.register('emailService', () => new EmailService());

  container.register('auditService', (c) =>
    new AuditService({ auditLogRepository: c.resolve('auditLogRepository') })
  );

  container.register('authService', (c) =>
    new AuthService({
      config: c.resolve('config'),
      userRepository: c.resolve('userRepository'),
      refreshTokenRepository: c.resolve('refreshTokenRepository'),
      tokenRepository: c.resolve('tokenRepository'),
      emailService: c.resolve('emailService'),
      tokenUtils: c.resolve('tokenUtils'),
      auditService: c.resolve('auditService'),
    })
  );

  container.register('userService', (c) =>
    new UserService({
      userRepository: c.resolve('userRepository'),
      auditService: c.resolve('auditService'),
    })
  );

  container.register('authController', (c) =>
    new AuthController(c.resolve('authService'))
  );

  container.register('userController', (c) =>
    new UserController(c.resolve('userService'))
  );

  container.register('auditController', (c) =>
    new AuditController(c.resolve('auditService'))
  );

  return container;
};

export default createContainer();
