import { ActionType } from '@prisma/client';
import { prisma } from '../utils/prisma.js';
import { AuditLogEntry, AuditLogFilter, CreateAuditLogParams } from '../types/analytics.audit.types.js';

/**
 * Service for managing audit logs
 */
export class AnalyticsAuditService {
  /**
   * Creates a new instance of AnalyticsAuditService
   */
  constructor() {}

  /**
   * Creates a new audit log entry
   * @param params - The audit log creation parameters
   * @returns The created audit log
   */
  async createAuditLog(params: CreateAuditLogParams): Promise<AuditLogEntry> {
    return prisma.auditLogEntry.create({
      data: {
        userId: params.userId || null,
        actionType: params.actionType as ActionType,
        entityType: params.entityType,
        entityId: params.entityId || null,
        metadata: params.metadata || null,
      },
    });
  }

  /**
   * Gets audit logs with optional filtering
   * @param filter - The filter parameters
   * @returns The filtered audit logs
   */
  async getAuditLogs(filter: AuditLogFilter): Promise<AuditLogEntry[]> {
    const {
      userId,
      actionType,
      entityType,
      entityId,
      fromDate,
      toDate,
      limit = 50,
      offset = 0,
    } = filter;

    // Build the where clause based on filter parameters
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (actionType) {
      where.actionType = actionType;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    // Date range filtering
    if (fromDate || toDate) {
      where.createdAt = {};

      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }

      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    // Query the database with filters
    const auditLogs = await prisma.auditLogEntry.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    // Map the results to DTOs
    return auditLogs.map(this.mapAuditLogToDto);
  }

  /**
   * Gets a single audit log by ID
   * @param id - The audit log ID
   * @returns The audit log or null if not found
   */
  async getAuditLogById(id: string): Promise<AuditLogEntry | null> {
    const auditLog = await prisma.auditLogEntry.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!auditLog) {
      return null;
    }

    return this.mapAuditLogToDto(auditLog);
  }

  /**
   * Maps a Prisma audit log result to a DTO
   * @param auditLog - The audit log from Prisma
   * @returns The mapped audit log DTO
   */
  private mapAuditLogToDto(auditLog: any): AuditLogEntry {
    return {
      id: auditLog.id,
      userId: auditLog.userId,
      actionType: auditLog.actionType,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      metadata: auditLog.metadata,
      createdAt: auditLog.createdAt,
      user: auditLog.user
        ? {
            fullName: auditLog.user.fullName,
          }
        : undefined,
    };
  }
}