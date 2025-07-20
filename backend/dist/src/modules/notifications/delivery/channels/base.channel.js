import { Logger } from '../../../../utils/logger';
/**
 * Abstract base class for notification channels
 * Provides common functionality for all channel implementations
 */
export class BaseNotificationChannel {
    logger;
    constructor() {
        this.logger = new Logger(`NotificationChannel:${this.constructor.name}`);
    }
    /**
     * Check if this channel is available for the given user and notification
     * Default implementation returns true
     * Override in subclasses to implement specific availability logic
     * @param user - User to check
     * @param notification - Notification to check
     * @returns True if channel is available
     */
    isAvailableFor(user, notification) {
        return true;
    }
    /**
     * Format notification title for delivery
     * @param notification - Notification to format
     * @returns Formatted title
     */
    formatTitle(notification) {
        return notification.title;
    }
    /**
     * Format notification message for delivery
     * @param notification - Notification to format
     * @returns Formatted message
     */
    formatMessage(notification) {
        return notification.message;
    }
    /**
     * Log a delivery attempt
     * @param user - User the notification is being sent to
     * @param notification - The notification being sent
     * @param success - Whether the delivery was successful
     * @param error - Error message if delivery failed
     */
    logDeliveryAttempt(user, notification, success, error) {
        if (success) {
            this.logger.info(`Successfully delivered notification ${notification.id} to user ${user.id} via ${this.channelId}`);
        }
        else {
            this.logger.error(`Failed to deliver notification ${notification.id} to user ${user.id} via ${this.channelId}: ${error}`);
        }
    }
}
//# sourceMappingURL=base.channel.js.map