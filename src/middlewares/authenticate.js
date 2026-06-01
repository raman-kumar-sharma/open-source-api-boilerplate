import { verifyAccessToken } from '../utils/token.js';
import ApiError from '../utils/ApiError.js';
import { TOKEN_TYPES } from '../utils/constants.js';
import asyncHandler from '../utils/asyncHandler.js';
import { setContextValue } from '../lib/requestContext.js';
import { getPermissionsForRole } from '../utils/permissions.js';

const createAuthenticate = (userRepository) =>
  asyncHandler(async (req, _res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired access token');
    }

    if (decoded.type !== TOKEN_TYPES.ACCESS) {
      throw ApiError.unauthorized('Invalid token type');
    }

    const user = await userRepository.findById(decoded.sub);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User not found or inactive');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      permissions: getPermissionsForRole(user.role),
    };

    setContextValue('userId', req.user.id);

    next();
  });

export default createAuthenticate;
