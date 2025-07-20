import { PrismaClient } from '@prisma/client';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { createAuditLog } from './createAuditLog';
export declare function initAuditModule(prisma: PrismaClient): {
    auditService: AuditService;
    auditController: AuditController;
};
declare const auditRouter: import("express-serve-static-core").Router;
export { auditRouter, createAuditLog, AuditService, AuditController };
export * from './audit.types';
//# sourceMappingURL=index.d.ts.map