import { Router } from 'express';
import mongoose from 'mongoose';
import config from '../config/index.js';
import { sendSuccess } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { getRequestContext } from '../lib/requestContext.js';

const createHealthRoutes = () => {
  const router = Router();

  const buildHealthPayload = (status, checks = {}) => {
    const { requestId } = getRequestContext();
    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env,
      version: process.env.npm_package_version || '1.0.0',
      checks,
      ...(requestId && { correlationId: requestId }),
    };
  };

  router.get('/', (_req, res) => {
    sendSuccess(
      res,
      HTTP_STATUS.OK,
      'API is operational',
      buildHealthPayload('healthy')
    );
  });

  router.get('/live', (_req, res) => {
    sendSuccess(res, HTTP_STATUS.OK, 'Liveness probe passed', {
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/ready', async (_req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbReady = dbState === 1;

    const checks = {
      database: dbReady ? 'up' : 'down',
    };

    if (!dbReady) {
      return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Service not ready',
        data: buildHealthPayload('unhealthy', checks),
      });
    }

    try {
      await mongoose.connection.db.admin().ping();
      checks.database = 'up';
    } catch {
      checks.database = 'down';
      return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Service not ready',
        data: buildHealthPayload('unhealthy', checks),
      });
    }

    return sendSuccess(
      res,
      HTTP_STATUS.OK,
      'Readiness probe passed',
      buildHealthPayload('ready', checks)
    );
  });

  return router;
};

export default createHealthRoutes;
