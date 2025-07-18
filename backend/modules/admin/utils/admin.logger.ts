import { Logger } from '../../../utils/logger.js';

/**
 * Logger for admin-related operations
 */
export class AdminLogger extends Logger {
  constructor() {
    super('AdminService');
  }

  /**
   * Log user role update
   */
  userRoleUpdate(data: {
    userId: string;
    oldRole: string;
    newRole: string;
    adminId: string;
  }) {
    this.info('User role updated', data);
  }

  /**
   * Log user status update
   */
  userStatusUpdate(data: {
    userId: string;
    oldStatus: boolean;
    newStatus: boolean;
    adminId: string;
  }) {
    this.info('User status updated', data);
  }

  /**
   * Log property moderation
   */
  propertyModeration(data: {
    propertyId: string;
    status: string;
    comment?: string;
    adminId: string;
  }) {
    this.info('Property moderated', data);
  }

  /**
   * Log broadcast notification
   */
  broadcastNotification(data: {
    title: string;
    targetRoles: string[];
    recipientCount: number;
    adminId: string;
  }) {
    this.info('Broadcast notification sent', data);
  }

  /**
   * Log KYC record view
   */
  kycRecordView(data: {
    kycId: string;
    adminId: string;
  }) {
    this.info('KYC record viewed', data);
  }

  /**
   * Log token inspection
   */
  tokenInspection(data: {
    tokenId: string;
    adminId: string;
  }) {
    this.info('Token inspected', data);
  }
}

// Export a singleton instance
export const adminLogger = new AdminLogger();