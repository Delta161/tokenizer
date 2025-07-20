import { Logger } from '../../utils/logger.js';
import { UserRole, PropertyStatus } from '@prisma/client';
/**
 * Logger for admin module actions
 */
export declare class AdminLogger extends Logger {
    constructor();
    /**
     * Log user role update
     */
    logUserRoleUpdate(userId: string, adminId: string, oldRole: UserRole, newRole: UserRole): void;
    /**
     * Log user status update
     */
    logUserStatusUpdate(userId: string, adminId: string, oldStatus: boolean, newStatus: boolean): void;
    /**
     * Log property moderation
     */
    logPropertyModeration(propertyId: string, adminId: string, status: PropertyStatus, comment: string): void;
    /**
     * Log broadcast notification
     */
    logBroadcastNotification(adminId: string, title: string, targetRoles: UserRole[], recipientCount: number): void;
    /**
     * Log KYC record view
     */
    logKycRecordView(kycId: string, adminId: string): void;
    /**
     * Log token inspection
     */
    logTokenInspection(tokenId: string, adminId: string): void;
}
export declare const adminLogger: AdminLogger;
//# sourceMappingURL=admin.logger.d.ts.map