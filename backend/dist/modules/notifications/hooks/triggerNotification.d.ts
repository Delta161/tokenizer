import { PrismaClient } from '@prisma/client';
import { NotificationType } from '../types/notifications.types';
import { NotificationConfig } from '../config/notification.config';
/**
 * Notification trigger utility
 * Provides a simple interface for other modules to trigger notifications
 */
export declare class NotificationTrigger {
    private notificationService;
    private dispatcherService;
    /**
     * Create a new NotificationTrigger
     * @param prisma - Prisma client instance
     * @param config - Optional notification configuration
     */
    constructor(prisma: PrismaClient, config?: Partial<NotificationConfig>);
    /**
     * Trigger a notification for a user
     * This will create the notification in the database and dispatch it through available channels
     * @param userId - ID of the user to notify
     * @param type - Type of notification
     * @param title - Notification title
     * @param message - Notification message
     * @param metadata - Additional metadata for the notification
     * @returns Promise resolving to the created notification ID
     */
    triggerNotification(userId: string, type: NotificationType, title: string, message: string, metadata?: Record<string, unknown>): Promise<string>;
    /**
   * Trigger a broadcast notification for all users
   * This will create the notification in the database for each user and dispatch it through available channels
   * @param adminId - ID of the admin triggering the broadcast
   * @param type - Type of notification
   * @param title - Notification title
   * @param message - Notification message
   * @param metadata - Additional metadata for the notification
   * @returns Promise resolving to an object containing the count of created notifications and their IDs
   */
    triggerBroadcast(adminId: string, type: NotificationType, title: string, message: string, metadata?: Record<string, unknown>): Promise<{
        count: number;
        notificationIds: string[];
    }>;
}
/**
 * Create a notification trigger instance
 * @param prisma - Prisma client instance
 * @param config - Optional notification configuration
 * @returns NotificationTrigger instance
 */
export declare function createNotificationTrigger(prisma: PrismaClient, config?: Partial<NotificationConfig>): NotificationTrigger;
//# sourceMappingURL=triggerNotification.d.ts.map