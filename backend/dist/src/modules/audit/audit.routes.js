import { Router } from 'express';
import { AuditController } from './audit.controller';
import { requireAuth } from '../auth/auth.middleware';
import { requireRole } from '../auth/auth.middleware';
export const auditRoutes = Router();
const auditController = new AuditController();
// Get audit logs with filtering options
auditRoutes.get('/', requireAuth, requireRole(['ADMIN']), auditController.getAuditLogs);
// Get audit log by ID
auditRoutes.get('/:id', requireAuth, requireRole(['ADMIN']), auditController.getAuditLogById);
//# sourceMappingURL=audit.routes.js.map