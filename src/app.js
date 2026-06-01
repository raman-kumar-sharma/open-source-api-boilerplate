import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import createRoutes from './routes/index.js';
import swaggerSpec from './config/swagger.js';
import config from './config/index.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';
import requestLogger from './middlewares/requestLogger.js';
import requestContextMiddleware from './middlewares/requestContext.js';
import metricsMiddleware from './middlewares/metricsMiddleware.js';
import metricsAuth from './middlewares/metricsAuth.js';
import { getMetrics, getMetricsContentType } from './observability/metrics.js';
import {
  helmet,
  cors,
  corsOptions,
  compression,
  rateLimiter,
  mongoSanitize,
  xss,
} from './middlewares/security.js';

const createApp = (container) => {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(requestContextMiddleware);
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(rateLimiter);
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(xss());
  app.use(metricsMiddleware);
  app.use(requestLogger);

  app.get(config.metrics.path, metricsAuth, async (_req, res, next) => {
    try {
      res.set('Content-Type', getMetricsContentType());
      res.end(await getMetrics());
    } catch (error) {
      next(error);
    }
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'API Documentation',
  }));

  app.get('/api-docs.json', (_req, res) => {
    res.json(swaggerSpec);
  });

  app.use('/api/v1', createRoutes(container));

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
