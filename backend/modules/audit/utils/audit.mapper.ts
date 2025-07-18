import { AuditLogEntry as PrismaAuditLogEntry } from '@prisma/client';
import { AuditLogEntry } from '../types/audit.types';

type AuditLogWithUser = PrismaAuditLogEntry & {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

/**
 * Maps a Prisma AuditLogEntry to the DTO format
 */
export function mapAuditLogToDto(auditLog: AuditLogWithUser): AuditLogEntry {
  return {
    id: auditLog.id,
    userId: auditLog.userId,
    actionType: auditLog.actionType,
    entityType: auditLog.entityType,
    entityId: auditLog.entityId,
    metadata: auditLog.metadata as Record<string, any> | null,
    createdAt: auditLog.createdAt,
    user: auditLog.user ? {
      id: auditLog.user.id,
      email: auditLog.user.email,
      firstName: auditLog.user.firstName,
      lastName: auditLog.user.lastName
    } : null
  };
}