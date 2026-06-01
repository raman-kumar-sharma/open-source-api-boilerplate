import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'MONGODB_URI',
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

validateEnv();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/open-source-api-boilerplate',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'test-access-secret-min-32-characters-long',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-min-32-characters-long',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cookie: {
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    accountLockDurationMs:
      parseInt(process.env.ACCOUNT_LOCK_DURATION_MS, 10) || 15 * 60 * 1000,
  },
  features: {
    metricsEnabled: process.env.METRICS_ENABLED !== 'false',
    auditLogEnabled: process.env.AUDIT_LOG_ENABLED !== 'false',
    accountLockoutEnabled: process.env.ACCOUNT_LOCKOUT_ENABLED !== 'false',
  },
  metrics: {
    path: process.env.METRICS_PATH || '/metrics',
    token: process.env.METRICS_TOKEN || '',
  },
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

export default config;
