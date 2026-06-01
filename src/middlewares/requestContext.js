import { randomUUID } from 'node:crypto';
import {
  createRequestContext,
  runWithContext,
} from '../lib/requestContext.js';

const REQUEST_ID_HEADER = 'x-request-id';

const requestContextMiddleware = (req, res, next) => {
  const requestId =
    req.get(REQUEST_ID_HEADER) ||
    req.get('x-correlation-id') ||
    randomUUID();

  res.setHeader(REQUEST_ID_HEADER, requestId);

  const context = createRequestContext(requestId);
  context.method = req.method;
  context.path = req.originalUrl;
  context.ip = req.ip;

  runWithContext(context, () => next());
};

export { REQUEST_ID_HEADER };
export default requestContextMiddleware;
