/**
 * Interface for notification log context
 */
interface NotificationLogContext {
    userId?: string;
    notificationId?: string;
    type?: string;
    channel?: string;
    status?: string;
    error?: string;
    [key: string]: any;
}
/**
 * Logger class for notification events
 */
declare class NotificationLogger {
    /**
     * Log notification creation
     * @param userId - User ID
     * @param type - Notification type
     * @param notificationId - Notification ID
     */
    notificationCreated(userId: string, type: string, notificationId: string): void;
    /**
     * Log notification delivery attempt
     * @param notificationId - Notification ID
     * @param userId - User ID
     * @param channel - Delivery channel
     * @param status - Delivery status
     * @param context - Additional context
     */
    deliveryAttempt(notificationId: string, userId: string, channel: string, status: string, context?: NotificationLogContext): void;
    /**
     * Log notification delivery failure
     * @param notificationId - Notification ID
     * @param userId - User ID
     * @param channel - Delivery channel
     * @param error - Error message or object
     * @param context - Additional context
     */
    deliveryFailure(notificationId: string, userId: string, channel: string, error: Error | string, context?: NotificationLogContext): void;
    /**
     * Log notification read event
     * @param notificationId - Notification ID
     * @param userId - User ID
     */
    notificationRead(notificationId: string, userId: string): void;
    /**
     * Log general notification event
     * @param event - Event description
     * @param context - Log context
     */
    notificationEvent(event: string, context: NotificationLogContext): void;
}
declare const notificationLogger: NotificationLogger;
export { notificationLogger };
//# sourceMappingURL=notifications.logger.d.ts.map