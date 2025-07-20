import { Router } from 'express';
import { auditRoutes } from './audit.routes';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { createAuditLog } from './createAuditLog';
export function initAuditModule(prisma) {
    const auditService = new AuditService(prisma);
    const auditController = new AuditController(auditService);
    return {
        auditService,
        auditController
    };
}
const auditRouter = Router();
auditRouter.use('/audit', auditRoutes);
export { auditRouter, createAuditLog, AuditService, AuditController };
// Re-export types
export * from './audit.types';
//# sourceMappingURL=index.js.map