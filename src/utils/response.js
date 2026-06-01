import { getRequestContext } from '../lib/requestContext.js';

const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const { requestId } = getRequestContext();

  const response = {
    success: true,
    message,
    ...(requestId && { correlationId: requestId }),
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export { sendSuccess };
