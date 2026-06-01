import logger from '../utils/logger.js';
import { getRequestContext } from '../lib/requestContext.js';

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { requestId } = getRequestContext();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logPayload = {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      correlationId: requestId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    if (res.statusCode >= 500) {
      logger.error('HTTP request completed', logPayload);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP request completed', logPayload);
    } else {
      logger.info('HTTP request completed', logPayload);
    }
  });

  next();
};

export default requestLogger;
