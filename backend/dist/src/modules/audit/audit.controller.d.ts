import { Request, Response } from 'express';
import { AuditService } from './audit.service';
export declare class AuditController {
    private auditService;
    constructor(auditService?: AuditService);
    /**
     * Get audit logs with optional filtering
     */
    getAuditLogs: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Get audit log by ID
     */
    getAuditLogById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=audit.controller.d.ts.map