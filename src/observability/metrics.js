import client from 'prom-client';
import config from '../config/index.js';

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: 'api_',
});

export const httpRequestDuration = new client.Histogram({
  name: 'api_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

export const httpRequestTotal = new client.Counter({
  name: 'api_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const authLoginAttempts = new client.Counter({
  name: 'api_auth_login_attempts_total',
  help: 'Authentication login attempts',
  labelNames: ['status'],
  registers: [register],
});

export const getMetrics = async () => {
  if (!config.features.metricsEnabled) {
    return '# Metrics disabled\n';
  }
  return register.metrics();
};

export const getMetricsContentType = () => register.contentType;

export { register };
