import { logger } from '../../../utils/logger.js';
import { UserRole, PropertyStatus } from '@prisma/client';
import { KycStatus } from '../../accounts/types/kyc.types.js';

/**
 * Logger for admin module actions
 */
export class AdminLogger {
  private readonly module = 'AdminModule';

  constructor() {}

  /**
   * Log user role update
   */
  logUserRoleUpdate(userId: string, adminId: string, oldRole: UserRole, newRole: UserRole): void {
    logger.info(
      `Admin ${adminId} updated user ${userId} role from ${oldRole} to ${newRole}`,
      {
        action: 'USER_ROLE_UPDATE',
        module: this.module,
        userId,
        adminId,
        oldRole,
        newRole,
      }
    );
  }

  /**
   * Log user status update
   */
  logUserStatusUpdate(userId: string, adminId: string, oldStatus: boolean, newStatus: boolean): void {
    logger.info(
      `Admin ${adminId} updated user ${userId} status from ${oldStatus ? 'active' : 'inactive'} to ${newStatus ? 'active' : 'inactive'}`,
      {
        action: 'USER_STATUS_UPDATE',
        module: this.module,
        userId,
        adminId,
        oldStatus,
        newStatus,
      }
    );
  }

  /**
   * Log property moderation
   */
  logPropertyModeration(
    propertyId: string,
    adminId: string,
    oldStatus: PropertyStatus,
    newStatus: PropertyStatus,
    comment: string
  ): void {
    logger.info(
      `Admin ${adminId} moderated property ${propertyId} from ${oldStatus} to ${newStatus}`,
      {
        action: 'PROPERTY_MODERATION',
        module: this.module,
        propertyId,
        adminId,
        oldStatus,
        newStatus,
        comment,
      }
    );
  }

  /**
   * Log broadcast notification
   */
  logBroadcastNotification(
    adminId: string,
    title: string,
    targetRole: UserRole | null,
    userCount: number
  ): void {
    logger.info(
      `Admin ${adminId} sent broadcast notification "${title}" to ${targetRole || 'all users'} (${userCount} recipients)`,
      {
        action: 'BROADCAST_NOTIFICATION',
        module: this.module,
        adminId,
        title,
        targetRole,
        userCount,
      }
    );
  }

  /**
   * Log general admin action
   */
  info(message: string, meta: Record<string, any> = {}): void {
    logger.info(message, {
      ...meta,
      module: this.module,
    });
  }

  /**
   * Log admin error
   */
  error(message: string, meta: Record<string, any> = {}): void {
    logger.error(message, {
      ...meta,
      module: this.module,
    });
  }

  /**
   * Log admin warning
   */
  warn(message: string, meta: Record<string, any> = {}): void {
    logger.warn(message, {
      ...meta,
      module: this.module,
    });
  }
}

// Create and export a singleton instance
export const adminLogger = new AdminLogger();