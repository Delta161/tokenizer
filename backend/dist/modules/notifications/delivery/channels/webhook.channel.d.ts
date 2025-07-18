import { NotificationDto } from '../../types/notifications.types';
import { UserPublicDTO } from '../../../user/user.types';
import { BaseNotificationChannel } from './base.channel';
/**
 * Webhook notification channel
 * This is a stub implementation for future webhook delivery
 */
export declare class WebhookNotificationChannel extends BaseNotificationChannel {
    /**
     * Channel identifier
     */
    readonly channelId: string;
    /**
     * Send a notification through the webhook channel
     * Currently just logs that it would send a webhook (stub implementation)
     * @param user - User to send notification to
     * @param notification - Notification to send
     */
    send(user: UserPublicDTO, notification: NotificationDto): Promise<void>;
    /**
     * Check if this channel is available for the given user
     * Webhook notifications would be available if the user has registered webhook endpoints
     * @returns Currently always false as webhooks are not implemented
     */
    isAvailableFor(): boolean;
    /**
     * Format webhook payload from notification
     * @param notification - Notification to format
     * @returns Webhook payload as JSON string
     */
    protected formatWebhookPayload(notification: NotificationDto): string;
}
//# sourceMappingURL=webhook.channel.d.ts.map