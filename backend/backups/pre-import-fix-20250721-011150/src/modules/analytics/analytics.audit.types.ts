import { ActionType } from '@prisma/client';

/**
 * Represents an audit log entry in the system
 */
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

/**
 * Filter parameters for querying audit logs
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
  metadata?: Record<string, any> | null;
}

/**
 * Response format for audit log API endpoints
 */
export interface AuditLogResponse {
  success: boolean;
  data?: AuditLogEntry | AuditLogEntry[];
  error?: string;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
}