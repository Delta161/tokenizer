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
    userRoleUpdate(data) {
        this.info('User role updated', data);
    }
    /**
     * Log user status update
     */
    userStatusUpdate(data) {
        this.info('User status updated', data);
    }
    /**
     * Log property moderation
     */
    propertyModeration(data) {
        this.info('Property moderated', data);
    }
    /**
     * Log broadcast notification
     */
    broadcastNotification(data) {
        this.info('Broadcast notification sent', data);
    }
    /**
     * Log KYC record view
     */
    kycRecordView(data) {
        this.info('KYC record viewed', data);
    }
    /**
     * Log token inspection
     */
    tokenInspection(data) {
        this.info('Token inspected', data);
    }
}
// Export a singleton instance
export const adminLogger = new AdminLogger();
//# sourceMappingURL=admin.logger.js.map