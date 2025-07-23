import { logger } from '@utils/logger';
import { UserRole, PropertyStatus, KycStatus } from '@prisma/client';

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
        adminId,
        userId,
        oldRole,
        newRole,
        module: this.module,
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
        adminId,
        userId,
        oldStatus,
        newStatus,
        module: this.module,
      }
    );
  }

  /**
   * Log property moderation
   */
  logPropertyModeration(propertyId: string, adminId: string, status: PropertyStatus, comment: string): void {
    logger.info(
      `Admin ${adminId} moderated property ${propertyId} with status ${status}`,
      {
        action: 'PROPERTY_MODERATION',
        adminId,
        propertyId,
        status,
        comment,
        module: this.module,
      }
    );
  }

  /**
   * Log broadcast notification
   */
  logBroadcastNotification(adminId: string, title: string, targetRoles: UserRole[], recipientCount: number): void {
    logger.info(
      `Admin ${adminId} sent broadcast notification "${title}" to ${recipientCount} users with roles ${targetRoles.join(', ')}`,
      {
        action: 'BROADCAST_NOTIFICATION',
        adminId,
        title,
        targetRoles,
        recipientCount,
        module: this.module,
      }
    );
  }

  /**
   * Log KYC record view
   */
  logKycRecordView(kycId: string, adminId: string): void {
    logger.info(
      `Admin ${adminId} viewed KYC record ${kycId}`,
      {
        action: 'KYC_RECORD_VIEW',
        adminId,
        kycId,
        module: this.module,
      }
    );
  }

  /**
   * Log token inspection
   */
  logTokenInspection(tokenId: string, adminId: string): void {
    logger.info(
      `Admin ${adminId} inspected token ${tokenId}`,
      {
        action: 'TOKEN_INSPECTION',
        adminId,
        tokenId,
        module: this.module,
      }
    );
  }
}

// Export a singleton instance
export const adminLogger = new AdminLogger();