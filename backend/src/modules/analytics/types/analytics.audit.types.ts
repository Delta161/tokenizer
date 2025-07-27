import { ActionType } from '@prisma/client';

/**
 * Audit log entry data transfer object
 */
export interface AuditLogEntry {
  id: string;
  userId: string | null;
  actionType: ActionType;
  entityType: string;
  entityId: string | null;
  metadata: any | null;
  createdAt: Date;
  user?: {
    fullName: string;
  };
}

/**
 * Parameters for querying audit logs
 */
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

/**
 * Parameters for creating a new audit log entry
 */
export interface CreateAuditLogParams {
  userId?: string | null;
  actionType: ActionType;
  entityType: string;
  entityId?: string | null;
  metadata?: any | null;
}

/**
 * Response format for audit log API endpoints
 */
export interface AuditLogResponse {
  success: boolean;
  data?: {
    logs?: AuditLogEntry[];
    log?: AuditLogEntry;
    total?: number;
  };
  error?: string;
}