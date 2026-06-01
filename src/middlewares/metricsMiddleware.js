import config from '../config/index.js';
import {
  httpRequestDuration,
  httpRequestTotal,
} from '../observability/metrics.js';

const normalizeRoute = (req) => {
  if (req.route?.path) {
    const base = req.baseUrl || '';
    return `${base}${req.route.path}`;
  }
  return req.path || 'unknown';
};

const metricsMiddleware = (req, res, next) => {
  if (!config.features.metricsEnabled) {
    return next();
  }

  const end = httpRequestDuration.startTimer();

  res.on('finish', () => {
    const route = normalizeRoute(req);
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };
    end(labels);
    httpRequestTotal.inc(labels);
  });

  next();
};

export default metricsMiddleware;
