import { NotificationService } from './notifications.service';
import { createNotificationDispatcher } from './delivery';
import { Logger } from '../../utils/logger';
/**
 * Class that handles triggering notifications
 * Creates notifications in the database and dispatches them through available channels
 */
export class NotificationTrigger {
    notificationService;
    dispatcher;
    logger;
    /**
     * Create a new notification trigger
     * @param notificationService - Service for creating and managing notifications
     * @param dispatcher - Service for dispatching notifications to channels
     */
    constructor(notificationService, dispatcher) {
        this.notificationService = notificationService;
        this.dispatcher = dispatcher;
        this.logger = new Logger('NotificationTrigger');
    }
    /**
     * Trigger a notification for a single user
     * @param notificationData - Data for the notification
     * @returns The created notification or null if creation failed
     */
    async triggerNotification(notificationData) {
        try {
            const { userId, type, title, message, metadata } = notificationData;
            // Create notification in database
            const notification = await this.notificationService.sendNotification(userId, type, title, message, metadata);
            // Get user details for notification delivery
            const user = await this.notificationService.getUserForNotification(userId);
            if (!user) {
                this.logger.error(`User not found for notification delivery: ${userId}`, {
                    userId,
                    notificationId: notification.id,
                    module: 'notifications',
                    eventType: 'notification_delivery_failure'
                });
                return notification;
            }
            // Dispatch notification to available channels
            await this.dispatcher.dispatchNotification(user, notification);
            return notification;
        }
        catch (error) {
            this.logger.error(`Failed to trigger notification: ${error instanceof Error ? error.message : String(error)}`, {
                userId: notificationData.userId,
                type: notificationData.type,
                title: notificationData.title,
                error: error instanceof Error ? error.message : String(error),
                module: 'notifications',
                eventType: 'notification_delivery_failure'
            });
            return null;
        }
    }
    /**
     * Trigger a broadcast notification for multiple users
     * @param userIds - IDs of users to send notification to
     * @param notificationData - Data for the notification (without userId)
     * @returns Array of created notifications
     */
    async triggerBroadcast(userIds, notificationData) {
        try {
            const { type, title, message, metadata } = notificationData;
            // Create notifications in database
            const notifications = await this.notificationService.sendBroadcast(userIds, type, title, message, metadata);
            // Process users in batches to avoid overwhelming the system
            const batchSize = 10;
            const batches = [];
            // Create batches of user IDs
            for (let i = 0; i < userIds.length; i += batchSize) {
                batches.push(userIds.slice(i, i + batchSize));
            }
            // Process each batch
            for (const batchUserIds of batches) {
                // Get user details for each user in batch
                const userPromises = batchUserIds.map(userId => this.notificationService.getUserForNotification(userId));
                const users = await Promise.all(userPromises);
                const validUsers = users.filter(Boolean);
                // Get notification for each user
                const notificationPromises = validUsers.map(user => this.notificationService.getNotificationById(user.id, type, title, message));
                const batchNotifications = await Promise.all(notificationPromises);
                // Dispatch notifications
                const dispatchPromises = validUsers.map((user, index) => {
                    const notification = batchNotifications[index];
                    if (!notification)
                        return Promise.resolve();
                    return this.dispatcher.dispatchNotification(user, notification)
                        .catch(error => {
                        this.logger.error(`Failed to dispatch broadcast notification: ${error instanceof Error ? error.message : String(error)}`, {
                            userId: user.id,
                            notificationId: notification.id,
                            error: error instanceof Error ? error.message : String(error),
                            module: 'notifications',
                            eventType: 'notification_delivery_failure'
                        });
                        return null;
                    });
                });
                await Promise.all(dispatchPromises);
            }
            return notifications;
        }
        catch (error) {
            this.logger.error(`Failed to trigger broadcast notification: ${error instanceof Error ? error.message : String(error)}`, {
                userCount: userIds.length,
                type: notificationData.type,
                title: notificationData.title,
                error: error instanceof Error ? error.message : String(error),
                module: 'notifications',
                eventType: 'notification_delivery_failure'
            });
            return [];
        }
    }
}
/**
 * Create a notification trigger with the given configuration
 * @param prisma - Prisma client instance
 * @param config - Notification configuration
 * @returns Initialized notification trigger
 */
export const createNotificationTrigger = (prisma, config) => {
    // Create notification service
    const notificationService = new NotificationService(prisma);
    // Create notification dispatcher
    const dispatcher = createNotificationDispatcher(config);
    // Create and return notification trigger
    return new NotificationTrigger(notificationService, dispatcher);
};
//# sourceMappingURL=triggerNotification.js.map