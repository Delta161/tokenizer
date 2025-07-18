import { PrismaClient } from '@prisma/client';
import { AuditLogFilter, AuditLogEntry } from '../types/audit.types';
import { mapAuditLogToDto } from '../utils/audit.mapper';

export class AuditService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Create a new audit log entry
   */
  async createAuditLog(data: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<AuditLogEntry> {
    const auditLog = await this.prisma.auditLogEntry.create({
      data,
      include: {
        user: true
      }
    });

    return mapAuditLogToDto(auditLog);
  }

  /**
   * Get audit logs with optional filtering
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

    return auditLogs.map(mapAuditLogToDto);
  }

  /**
   * Get audit log by ID
   */
  async getAuditLogById(id: string): Promise<AuditLogEntry | null> {
    const auditLog = await this.prisma.auditLogEntry.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!auditLog) return null;

    return mapAuditLogToDto(auditLog);
  }
}