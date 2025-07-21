import { PrismaClient } from '@prisma/client';
import { AuditLogFilter, AuditLogEntry } from './analytics.audit.types.js';

export class AnalyticsAuditService {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Create a new audit log entry
   * @param data - The audit log data
   * @returns The created audit log entry
   */
  async createAuditLog(data: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<AuditLogEntry> {
    const auditLog = await this.prisma.auditLogEntry.create({
      data,
      include: {
        user: true
      }
    });

    return this.mapAuditLogToDto(auditLog);
  }

  /**
   * Get audit logs with optional filtering
   * @param filter - The filter criteria
   * @returns Array of audit log entries
   */
  async getAuditLogs(filter: AuditLogFilter): Promise<AuditLogEntry[]> {
    const { userId, actionType, entityType, entityId, fromDate, toDate, limit, offset } = filter;

    const where: any = {};

    if (userId) where.userId = userId;
    if (actionType) where.actionType = actionType;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const auditLogs = await this.prisma.auditLogEntry.findMany({
      where,
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset || 0,
      take: limit || 50
    });

    return auditLogs.map(log => this.mapAuditLogToDto(log));
  }

  /**
   * Get audit log by ID
   * @param id - The audit log ID
   * @returns The audit log entry or null if not found
   */
  async getAuditLogById(id: string): Promise<AuditLogEntry | null> {
    const auditLog = await this.prisma.auditLogEntry.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!auditLog) return null;

    return this.mapAuditLogToDto(auditLog);
  }

  /**
   * Maps a Prisma AuditLogEntry to the DTO format
   * @param auditLog - The Prisma audit log entry with user
   * @returns The mapped audit log entry
   */
  private mapAuditLogToDto(auditLog: any): AuditLogEntry {
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
}