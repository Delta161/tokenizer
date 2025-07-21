import { Logger } from '../../utils/logger.js';
import { UserRole, PropertyStatus, KycStatus } from '@prisma/client';

/**
 * Logger for admin module actions
 */
export class AdminLogger extends Logger {
  constructor() {
    super('AdminModule');
  }

  /**
   * Log user role update
   */
  logUserRoleUpdate(userId: string, adminId: string, oldRole: UserRole, newRole: UserRole): void {
    this.info(
      `Admin ${adminId} updated user ${userId} role from ${oldRole} to ${newRole}`,
      {
        action: 'USER_ROLE_UPDATE',
        adminId,
        userId,
        oldRole,
        newRole,
      }
    );
  }

  /**
   * Log user status update
   */
  logUserStatusUpdate(userId: string, adminId: string, oldStatus: boolean, newStatus: boolean): void {
    this.info(
      `Admin ${adminId} updated user ${userId} status from ${oldStatus ? 'active' : 'inactive'} to ${newStatus ? 'active' : 'inactive'}`,
      {
        action: 'USER_STATUS_UPDATE',
        adminId,
        userId,
        oldStatus,
        newStatus,
      }
    );
  }

  /**
   * Log property moderation
   */
  logPropertyModeration(propertyId: string, adminId: string, status: PropertyStatus, comment: string): void {
    this.info(
      `Admin ${adminId} moderated property ${propertyId} with status ${status}`,
      {
        action: 'PROPERTY_MODERATION',
        adminId,
        propertyId,
        status,
        comment,
      }
    );
  }

  /**
   * Log broadcast notification
   */
  logBroadcastNotification(adminId: string, title: string, targetRoles: UserRole[], recipientCount: number): void {
    this.info(
      `Admin ${adminId} sent broadcast notification "${title}" to ${recipientCount} users with roles ${targetRoles.join(', ')}`,
      {
        action: 'BROADCAST_NOTIFICATION',
        adminId,
        title,
        targetRoles,
        recipientCount,
      }
    );
  }

  /**
   * Log KYC record view
   */
  logKycRecordView(kycId: string, adminId: string): void {
    this.info(
      `Admin ${adminId} viewed KYC record ${kycId}`,
      {
        action: 'KYC_RECORD_VIEW',
        adminId,
        kycId,
      }
    );
  }

  /**
   * Log token inspection
   */
  logTokenInspection(tokenId: string, adminId: string): void {
    this.info(
      `Admin ${adminId} inspected token ${tokenId}`,
      {
        action: 'TOKEN_INSPECTION',
        adminId,
        tokenId,
      }
    );
  }
}

// Export a singleton instance
export const adminLogger = new AdminLogger();