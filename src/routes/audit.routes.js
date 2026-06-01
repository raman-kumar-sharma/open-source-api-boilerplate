import { Router } from 'express';
import requirePermission from '../middlewares/requirePermission.js';
import { PERMISSIONS } from '../utils/permissions.js';

const createAuditRoutes = (auditController, authenticate) => {
  const router = Router();

  router.use(authenticate);
  router.get(
    '/',
    requirePermission(PERMISSIONS.AUDIT_READ),
    auditController.getAuditLogs
  );

  return router;
};

export default createAuditRoutes;
