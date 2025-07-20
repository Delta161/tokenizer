import { BaseNotificationChannel } from './base.channel';
/**
 * Webhook notification channel
 * This is a stub implementation for future webhook-based delivery
 */
export class WebhookNotificationChannel extends BaseNotificationChannel {
    /**
     * Channel identifier
     */
    channelId = 'webhook';
    /**
     * Send a notification through the webhook channel
     * Currently just logs that it would send via webhook (stub implementation)
     * @param user - User to send notification to
     * @param notification - Notification to send
     */
    async send(user, notification) {
        try {
            this.logger.info(`Attempting to deliver notification ${notification.id} to user ${user.id} via webhook channel`);
            // TODO: Implement actual webhook sending logic
            // This would make HTTP requests to configured webhook endpoints
            // Format the payload that would be sent
            const payload = this.formatWebhookPayload(notification);
            // Log that this is a stub implementation
            this.logger.info(`Webhook delivery not implemented yet for notification ${notification.id}`);
            this.logger.debug(`Would have sent payload: ${payload}`);
            // Mark as successful since we're just simulating
            this.logDeliveryAttempt(user, notification, true);
        }
        catch (error) {
            // Log delivery failure
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logDeliveryAttempt(user, notification, false, errorMessage);
            // Re-throw the error for the dispatcher to handle
            throw error;
        }
    }
    /**
     * Check if this channel is available for the given user
     * Webhook notifications are currently disabled
     * @returns Always false as webhook delivery is not implemented
     */
    isAvailableFor() {
        // Currently disabled as webhook delivery is not implemented
        return false;
    }
    /**
     * Format a notification into a webhook payload
     * @param notification - Notification to format
     * @returns JSON string of the webhook payload
     */
    formatWebhookPayload(notification) {
        const payload = {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            createdAt: notification.createdAt,
            metadata: notification.metadata || {}
        };
        return JSON.stringify(payload);
    }
}
//# sourceMappingURL=webhook.channel.js.map