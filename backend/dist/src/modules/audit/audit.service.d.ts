import { PrismaClient } from '@prisma/client';
import { AuditLogFilter, AuditLogEntry } from './audit.types';
export declare class AuditService {
    private prisma;
    constructor(prisma?: PrismaClient);
    /**
     * Create a new audit log entry
     */
    createAuditLog(data: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<AuditLogEntry>;
    /**
     * Get audit logs with optional filtering
     */
    getAuditLogs(filter: AuditLogFilter): Promise<AuditLogEntry[]>;
    /**
     * Get audit log by ID
     */
    getAuditLogById(id: string): Promise<AuditLogEntry | null>;
}
//# sourceMappingURL=audit.service.d.ts.map