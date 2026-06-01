import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { TOKEN_TYPES } from './constants.js';

const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { sub: userId, role, type: TOKEN_TYPES.ACCESS },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      sub: userId,
      type: TOKEN_TYPES.REFRESH,
      jti: crypto.randomUUID(),
    },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const parseExpiryToDate = (expiry) => {
  if (expiry instanceof Date) return expiry;
  if (typeof expiry === 'number') return new Date(Date.now() + expiry);

  const match = String(expiry).match(/^(\d+)([smhd])$/);
  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const value = parseInt(match[1], 10);
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return new Date(Date.now() + value * multipliers[match[2]]);
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateRandomToken,
  hashToken,
  parseExpiryToDate,
};
