import { NotificationDto } from '../../types/notifications.types';
import { UserPublicDTO } from '../../../user/user.types';
import { BaseNotificationChannel } from './base.channel';
import { notificationLogger } from '../../utils/notifications.logger';

/**
 * Webhook notification channel
 * This is a stub implementation for future webhook delivery
 */
export class WebhookNotificationChannel extends BaseNotificationChannel {
  /**
   * Channel identifier
   */
  readonly channelId: string = 'webhook';
  
  /**
   * Send a notification through the webhook channel
   * Currently just logs that it would send a webhook (stub implementation)
   * @param user - User to send notification to
   * @param notification - Notification to send
   */
  async send(user: UserPublicDTO, notification: NotificationDto): Promise<void> {
    try {
      // Log the delivery attempt
      notificationLogger.deliveryAttempt(
        notification.id,
        user.id,
        this.channelId,
        'pending'
      );
      
      // TODO: Implement actual webhook sending logic
      // This would make HTTP requests to registered webhook endpoints
      
      // Log that this is a stub implementation
      notificationLogger.notificationEvent('Webhook delivery not implemented yet', {
        notificationId: notification.id,
        userId: user.id,
        channel: this.channelId,
        status: 'skipped'
      });
      
    } catch (error) {
      // Log delivery failure
      notificationLogger.deliveryFailure(
        notification.id,
        user.id,
        this.channelId,
        error instanceof Error ? error : new Error(String(error))
      );
      
      // Re-throw the error for the dispatcher to handle
      throw error;
    }
  }
  
  /**
   * Check if this channel is available for the given user
   * Webhook notifications would be available if the user has registered webhook endpoints
   * @returns Currently always false as webhooks are not implemented
   */
  isAvailableFor(): boolean {
    // TODO: Check if user has registered webhook endpoints
    return false;
  }
  
  /**
   * Format webhook payload from notification
   * @param notification - Notification to format
   * @returns Webhook payload as JSON string
   */
  protected formatWebhookPayload(notification: NotificationDto): string {
    return JSON.stringify({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      timestamp: notification.createdAt.toISOString()
    });
  }
}