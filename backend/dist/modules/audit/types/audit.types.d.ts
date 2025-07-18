import { ActionType } from '@prisma/client';
export interface AuditLogEntry {
    id: string;
    userId: string | null;
    actionType: ActionType;
    entityType: string;
    entityId: string | null;
    metadata: Record<string, any> | null;
    createdAt: Date;
    user?: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
    } | null;
}
export interface AuditLogFilter {
    userId?: string;
    actionType?: ActionType;
    entityType?: string;
    entityId?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    offset?: number;
}
export interface CreateAuditLogParams {
    userId?: string | null;
    actionType: ActionType;
    entityType: string;
    entityId?: string | null;
    metadata?: Record<string, any> | null;
}
//# sourceMappingURL=audit.types.d.ts.map