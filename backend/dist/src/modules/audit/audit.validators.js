import { z } from 'zod';
import { ActionType } from '@prisma/client';
// Convert ActionType enum to a Zod enum
const actionTypeValues = Object.values(ActionType);
const ActionTypeEnum = z.enum(actionTypeValues);
// Schema for filtering audit logs
export const AuditLogFilterSchema = z.object({
    userId: z.string().optional(),
    actionType: ActionTypeEnum.optional(),
    entityType: z.string().optional(),
    entityId: z.string().optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
    limit: z.coerce.number().min(1).max(100).default(50).optional(),
    offset: z.coerce.number().min(0).default(0).optional(),
});
// Schema for creating an audit log entry
export const CreateAuditLogSchema = z.object({
    userId: z.string().nullable().optional(),
    actionType: ActionTypeEnum,
    entityType: z.string(),
    entityId: z.string().nullable().optional(),
    metadata: z.record(z.any()).nullable().optional(),
});
//# sourceMappingURL=audit.validators.js.map