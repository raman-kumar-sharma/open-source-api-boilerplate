import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getRequestContext } from '../lib/requestContext.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.resolve(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const injectContext = winston.format((info) => {
  const ctx = getRequestContext();
  if (ctx.requestId) info.correlationId = ctx.requestId;
  if (ctx.method) info.method = ctx.method;
  if (ctx.path) info.path = ctx.path;
  if (ctx.userId) info.userId = ctx.userId;
  return info;
});

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  injectContext(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  injectContext(),
  winston.format.printf(({ level, message, timestamp, correlationId, ...meta }) => {
    const cid = correlationId ? ` [${correlationId.slice(0, 8)}]` : '';
    const metaKeys = Object.keys(meta).filter(
      (k) => !['service', 'splat', 'timestamp'].includes(k)
    );
    const metaStr = metaKeys.length ? ` ${JSON.stringify(
      Object.fromEntries(metaKeys.map((k) => [k, meta[k]]))
    )}` : '';
    return `${timestamp}${cid} [${level}]: ${message}${metaStr}`;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'open-source-api-boilerplate' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
} else {
  logger.add(
    new winston.transports.Console({
      format: logFormat,
    })
  );
}

export default logger;
