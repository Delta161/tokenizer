import { CreateAuditLogParams } from './audit.types';
/**
 * Utility function to create audit log entries from any module
 *
 * @example
 * // In a service or controller
 * await createAuditLog({
 *   userId: req.user.id,
 *   actionType: ActionType.PROPERTY_APPROVED,
 *   entityType: 'Property',
 *   entityId: property.id,
 *   metadata: { reason: 'All documents verified' }
 * });
 */
export declare function createAuditLog(params: CreateAuditLogParams): Promise<{
    id: string;
    userId: string | null;
    createdAt: Date;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    actionType: import(".prisma/client").$Enums.ActionType;
    entityType: string;
    entityId: string | null;
} | null>;
//# sourceMappingURL=createAuditLog.d.ts.map