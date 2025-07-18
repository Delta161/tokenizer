import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { requireAuth } from '../../auth/requireAuth';
import { requireRole } from '../../auth/requireRole';

const router = Router();
const auditController = new AuditController();

// Get audit logs with filtering options
router.get('/', requireAuth, requireRole(['ADMIN']), auditController.getAuditLogs);

// Get audit log by ID
router.get('/:id', requireAuth, requireRole(['ADMIN']), auditController.getAuditLogById);

export const auditRoutes = router;