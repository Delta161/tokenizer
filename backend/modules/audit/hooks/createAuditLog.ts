import { PrismaClient, ActionType } from '@prisma/client';
import { CreateAuditLogParams } from '../types/audit.types';

const prisma = new PrismaClient();

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
export async function createAuditLog(params: CreateAuditLogParams) {
  const { userId, actionType, entityType, entityId, metadata } = params;
  
  try {
    return await prisma.auditLogEntry.create({
      data: {
        userId,
        actionType,
        entityType,
        entityId,
        metadata
      }
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break main functionality
    return null;
  }
}