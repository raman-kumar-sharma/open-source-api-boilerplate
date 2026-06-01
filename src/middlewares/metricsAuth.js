import config from '../config/index.js';
import ApiError from '../utils/ApiError.js';

const metricsAuth = (req, _res, next) => {
  if (!config.features.metricsEnabled) {
    return next(ApiError.notFound('Metrics endpoint is disabled'));
  }

  if (config.metrics.token) {
    const header = req.get('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

    if (token !== config.metrics.token) {
      return next(ApiError.unauthorized('Invalid metrics credentials'));
    }
  }

  next();
};

export default metricsAuth;
