import { z } from 'zod';
import { ActionType } from '@prisma/client';

// Convert ActionType enum to a Zod enum
const actionTypeValues = Object.values(ActionType) as [string, ...string[]];
const ActionTypeEnum = z.enum(actionTypeValues);

/**
 * Schema for filtering audit logs
 */
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

/**
 * Schema for creating an audit log entry
 */
export const CreateAuditLogSchema = z.object({
  userId: z.string().nullable().optional(),
  actionType: ActionTypeEnum,
  entityType: z.string(),
  entityId: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
});

/**
 * Schema for validating audit log ID parameter
 */
export const AuditLogIdSchema = z.object({
  id: z.string().uuid({
    message: 'Audit log ID must be a valid UUID',
  }),
});

/**
 * Type for the validated audit log filter
 */
export type AuditLogFilterInput = z.infer<typeof AuditLogFilterSchema>;

/**
 * Type for the validated audit log creation data
 */
export type CreateAuditLogInput = z.infer<typeof CreateAuditLogSchema>;

/**
 * Type for the validated audit log ID parameter
 */
export type AuditLogIdInput = z.infer<typeof AuditLogIdSchema>;

/**
 * Validates the audit log filter query parameters
 * @param data - The data to validate
 * @returns The validation result
 */
export const validateAuditLogFilter = (data: unknown) => {
  return AuditLogFilterSchema.safeParse(data);
};

/**
 * Validates the audit log ID parameter
 * @param data - The data to validate
 * @returns The validation result
 */
export const validateAuditLogId = (data: unknown) => {
  return AuditLogIdSchema.safeParse(data);
};