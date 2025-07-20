import { logger } from '../../utils/logger.js';
/**
 * Logger class for notification events
 */
class NotificationLogger {
    /**
     * Log notification creation
     * @param userId - User ID
     * @param type - Notification type
     * @param notificationId - Notification ID
     */
    notificationCreated(userId, type, notificationId) {
        logger.info('Notification created', {
            userId,
            type,
            notificationId,
            module: 'notifications',
            eventType: 'notification_created'
        });
    }
    /**
     * Log notification delivery attempt
     * @param notificationId - Notification ID
     * @param userId - User ID
     * @param channel - Delivery channel
     * @param status - Delivery status
     * @param context - Additional context
     */
    deliveryAttempt(notificationId, userId, channel, status, context) {
        logger.info(`Notification delivery ${status}`, {
            notificationId,
            userId,
            channel,
            status,
            ...context,
            module: 'notifications',
            eventType: 'notification_delivery'
        });
    }
    /**
     * Log notification delivery failure
     * @param notificationId - Notification ID
     * @param userId - User ID
     * @param channel - Delivery channel
     * @param error - Error message or object
     * @param context - Additional context
     */
    deliveryFailure(notificationId, userId, channel, error, context) {
        const errorMessage = error instanceof Error ? error.message : error;
        const errorObj = error instanceof Error ? error : new Error(error);
        logger.error(`Notification delivery failed: ${errorMessage}`, {
            notificationId,
            userId,
            channel,
            status: 'failed',
            error: errorMessage,
            ...context,
            module: 'notifications',
            eventType: 'notification_delivery_failure'
        }, errorObj);
    }
    /**
     * Log notification read event
     * @param notificationId - Notification ID
     * @param userId - User ID
     */
    notificationRead(notificationId, userId) {
        logger.info('Notification marked as read', {
            notificationId,
            userId,
            module: 'notifications',
            eventType: 'notification_read'
        });
    }
    /**
     * Log general notification event
     * @param event - Event description
     * @param context - Log context
     */
    notificationEvent(event, context) {
        logger.info(`Notification event: ${event}`, {
            ...context,
            module: 'notifications',
            eventType: 'notification_event'
        });
    }
}
// Create and export a singleton instance
const notificationLogger = new NotificationLogger();
export { notificationLogger };
//# sourceMappingURL=notifications.logger.js.map