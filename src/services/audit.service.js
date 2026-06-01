import { getRequestContext } from '../lib/requestContext.js';
import config from '../config/index.js';

export const AUDIT_ACTIONS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  LOGIN_FAILED: 'auth.login_failed',
  LOGOUT: 'auth.logout',
  PASSWORD_RESET: 'auth.password_reset',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  TOKEN_REFRESH: 'auth.token_refresh',
};

class AuditService {
  constructor({ auditLogRepository }) {
    this.auditLogRepository = auditLogRepository;
  }

  async record({
    action,
    resource,
    resourceId = null,
    actor = null,
    status = 'success',
    metadata = {},
    ipAddress,
    userAgent,
  }) {
    if (!config.features.auditLogEnabled) {
      return null;
    }

    const { requestId } = getRequestContext();

    return this.auditLogRepository.create({
      action,
      resource,
      resourceId,
      actor,
      status,
      metadata,
      correlationId: requestId,
      ipAddress,
      userAgent,
    });
  }

  async getAuditLogs(query) {
    const result = await this.auditLogRepository.findPaginated(query);
    return {
      logs: result.logs,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }
}

export default AuditService;
