import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';

class AuditController {
  constructor(auditService) {
    this.auditService = auditService;
  }

  getAuditLogs = asyncHandler(async (req, res) => {
    const result = await this.auditService.getAuditLogs(req.query);
    sendSuccess(
      res,
      HTTP_STATUS.OK,
      'Audit logs retrieved successfully',
      result.logs,
      result.meta
    );
  });
}

export default AuditController;
