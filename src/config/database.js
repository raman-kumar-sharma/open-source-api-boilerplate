import mongoose from 'mongoose';
import config from './index.js';
import logger from '../utils/logger.js';

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

const disconnectDatabase = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB error: ${err.message}`);
});

export { connectDatabase, disconnectDatabase };
