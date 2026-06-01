import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

const storage = new AsyncLocalStorage();

export const runWithContext = (context, callback) => storage.run(context, callback);

export const getRequestContext = () => storage.getStore() ?? {};

export const setContextValue = (key, value) => {
  const store = storage.getStore();
  if (store) {
    store[key] = value;
  }
};

export const createRequestContext = (requestId = randomUUID()) => ({
  requestId,
  startTime: Date.now(),
});

export default storage;
