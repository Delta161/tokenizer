/**
 * Abstract base class for notification channels
 * Provides common functionality for all channel implementations
 */
export class BaseNotificationChannel {
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
}
//# sourceMappingURL=base.channel.js.map