import { Logger } from '../../utils/logger.js';
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
    logUserRoleUpdate(userId, adminId, oldRole, newRole) {
        this.info(`Admin ${adminId} updated user ${userId} role from ${oldRole} to ${newRole}`, {
            action: 'USER_ROLE_UPDATE',
            adminId,
            userId,
            oldRole,
            newRole,
        });
    }
    /**
     * Log user status update
     */
    logUserStatusUpdate(userId, adminId, oldStatus, newStatus) {
        this.info(`Admin ${adminId} updated user ${userId} status from ${oldStatus ? 'active' : 'inactive'} to ${newStatus ? 'active' : 'inactive'}`, {
            action: 'USER_STATUS_UPDATE',
            adminId,
            userId,
            oldStatus,
            newStatus,
        });
    }
    /**
     * Log property moderation
     */
    logPropertyModeration(propertyId, adminId, status, comment) {
        this.info(`Admin ${adminId} moderated property ${propertyId} with status ${status}`, {
            action: 'PROPERTY_MODERATION',
            adminId,
            propertyId,
            status,
            comment,
        });
    }
    /**
     * Log broadcast notification
     */
    logBroadcastNotification(adminId, title, targetRoles, recipientCount) {
        this.info(`Admin ${adminId} sent broadcast notification "${title}" to ${recipientCount} users with roles ${targetRoles.join(', ')}`, {
            action: 'BROADCAST_NOTIFICATION',
            adminId,
            title,
            targetRoles,
            recipientCount,
        });
    }
    /**
     * Log KYC record view
     */
    logKycRecordView(kycId, adminId) {
        this.info(`Admin ${adminId} viewed KYC record ${kycId}`, {
            action: 'KYC_RECORD_VIEW',
            adminId,
            kycId,
        });
    }
    /**
     * Log token inspection
     */
    logTokenInspection(tokenId, adminId) {
        this.info(`Admin ${adminId} inspected token ${tokenId}`, {
            action: 'TOKEN_INSPECTION',
            adminId,
            tokenId,
        });
    }
}
// Export a singleton instance
export const adminLogger = new AdminLogger();
//# sourceMappingURL=admin.logger.js.map