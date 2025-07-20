import { Router } from 'express';
import { AuditController } from './audit.controller';
import { requireAuth } from '../accounts/middleware/auth.middleware';
import { requireRole } from '../accounts/middleware/auth.middleware';

export const auditRoutes = Router();
const auditController = new AuditController();

// Get audit logs with filtering options
auditRoutes.get('/', requireAuth, requireRole(['ADMIN']), auditController.getAuditLogs);

// Get audit log by ID
auditRoutes.get('/:id', requireAuth, requireRole(['ADMIN']), auditController.getAuditLogById);
