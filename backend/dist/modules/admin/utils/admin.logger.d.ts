import { Logger } from '../../../utils/logger.js';
/**
 * Logger for admin-related operations
 */
export declare class AdminLogger extends Logger {
    constructor();
    /**
     * Log user role update
     */
    userRoleUpdate(data: {
        userId: string;
        oldRole: string;
        newRole: string;
        adminId: string;
    }): void;
    /**
     * Log user status update
     */
    userStatusUpdate(data: {
        userId: string;
        oldStatus: boolean;
        newStatus: boolean;
        adminId: string;
    }): void;
    /**
     * Log property moderation
     */
    propertyModeration(data: {
        propertyId: string;
        status: string;
        comment?: string;
        adminId: string;
    }): void;
    /**
     * Log broadcast notification
     */
    broadcastNotification(data: {
        title: string;
        targetRoles: string[];
        recipientCount: number;
        adminId: string;
    }): void;
    /**
     * Log KYC record view
     */
    kycRecordView(data: {
        kycId: string;
        adminId: string;
    }): void;
    /**
     * Log token inspection
     */
    tokenInspection(data: {
        tokenId: string;
        adminId: string;
    }): void;
}
export declare const adminLogger: AdminLogger;
//# sourceMappingURL=admin.logger.d.ts.map