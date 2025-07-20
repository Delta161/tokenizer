import { NotificationDto } from '../../notifications.types';
import { UserPublicDTO } from '../../../accounts/types/user.types';
import { BaseNotificationChannel } from './base.channel';
/**
 * Webhook notification channel
 * This is a stub implementation for future webhook-based delivery
 */
export declare class WebhookNotificationChannel extends BaseNotificationChannel {
    /**
     * Channel identifier
     */
    readonly channelId: string;
    /**
     * Send a notification through the webhook channel
     * Currently just logs that it would send via webhook (stub implementation)
     * @param user - User to send notification to
     * @param notification - Notification to send
     */
    send(user: UserPublicDTO, notification: NotificationDto): Promise<void>;
    /**
     * Check if this channel is available for the given user
     * Webhook notifications are currently disabled
     * @returns Always false as webhook delivery is not implemented
     */
    isAvailableFor(): boolean;
    /**
     * Format a notification into a webhook payload
     * @param notification - Notification to format
     * @returns JSON string of the webhook payload
     */
    private formatWebhookPayload;
}
//# sourceMappingURL=webhook.channel.d.ts.map