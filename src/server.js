import createApp from './app.js';
import container from './container/index.js';
import config from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import logger from './utils/logger.js';

const SHUTDOWN_TIMEOUT_MS = 10000;

const startServer = async () => {
  try {
    await connectDatabase();

    const app = createApp(container);

    const server = app.listen(config.port, () => {
      logger.info('Server started', {
        port: config.port,
        environment: config.env,
        docsUrl: `${config.appUrl}/api-docs`,
        metricsEnabled: config.features.metricsEnabled,
        auditLogEnabled: config.features.auditLogEnabled,
      });
    });

    let isShuttingDown = false;

    const gracefulShutdown = async (signal) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.info('Graceful shutdown initiated', { signal });

      const forceExitTimer = setTimeout(() => {
        logger.error('Graceful shutdown timed out; forcing exit');
        process.exit(1);
      }, SHUTDOWN_TIMEOUT_MS);

      server.close(async () => {
        logger.info('HTTP server closed');
        try {
          await disconnectDatabase();
          clearTimeout(forceExitTimer);
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', { error: error.message });
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled promise rejection', { reason });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { error: error.message, stack: error.stack });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer();
