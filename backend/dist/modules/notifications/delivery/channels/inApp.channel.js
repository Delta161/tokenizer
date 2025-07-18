import { BaseNotificationChannel } from './base.channel';
import { notificationLogger } from '../../utils/notifications.logger';
/**
 * In-app notification channel
 * This channel is used for delivering notifications within the application
 * Currently, it only logs the notification delivery (no-op implementation)
 */
export class InAppNotificationChannel extends BaseNotificationChannel {
    /**
     * Channel identifier
     */
    channelId = 'in-app';
    /**
     * Send a notification through the in-app channel
     * Currently just logs the notification (no-op implementation)
     * @param user - User to send notification to
     * @param notification - Notification to send
     */
    async send(user, notification) {
        try {
            // Log the delivery attempt
            notificationLogger.deliveryAttempt(notification.id, user.id, this.channelId, 'pending');
            // In a real implementation, this would trigger a push to the user's
            // connected clients or store the notification for retrieval
            // For now, we just log that it was "delivered"
            // Simulate a small delay to mimic actual delivery
            await new Promise(resolve => setTimeout(resolve, 50));
            // Log successful delivery
            notificationLogger.deliveryAttempt(notification.id, user.id, this.channelId, 'delivered', { message: 'Notification ready for in-app display' });
        }
        catch (error) {
            // Log delivery failure
            notificationLogger.deliveryFailure(notification.id, user.id, this.channelId, error instanceof Error ? error : new Error(String(error)));
            // Re-throw the error for the dispatcher to handle
            throw error;
        }
    }
    /**
     * Check if this channel is available for the given user and notification
     * In-app notifications are always available
     * @returns Always true
     */
    isAvailableFor() {
        return true;
    }
}
//# sourceMappingURL=inApp.channel.js.map