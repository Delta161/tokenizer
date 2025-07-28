import { NotificationDto } from '../../types/notification.types';
import { UserPublicDTO } from '../../../accounts/types/user.types';
import { BaseNotificationChannel } from './base.channel';

/**
 * Webhook notification channel
 */
export class WebhookNotificationChannel extends BaseNotificationChannel {
  /**
   * Create a new webhook notification channel
   */
  constructor() {
    super('webhook');
  }

  /**
   * Send a notification via webhook
   * @param user - User to send notification to
   * @param notification - Notification to send
   */
  async send(user: UserPublicDTO, notification: NotificationDto): Promise<void> {
    if (!this.isAvailableFor(user, notification)) {
      this.logDeliveryAttempt(user, notification, 'skipped', 'User has no webhook URL configured');
      return;
    }

    try {
      // In a real implementation, this would send an HTTP request to the webhook URL
      // For now, we just log the attempt
      console.log(`[WEBHOOK] Delivering notification to user ${user.id}: ${notification.title}`);
      
      // TODO: Implement actual webhook delivery
      // This would typically involve making an HTTP POST request to the user's webhook URL
      
      this.logDeliveryAttempt(user, notification, 'success');
    } catch (error) {
      this.logDeliveryAttempt(user, notification, 'failed', error);
      throw error;
    }
  }

  /**
   * Check if webhook channel is available for the given user
   * @param user - User to check
   * @returns True if user has a webhook URL configured
   */
  isAvailableFor(user: UserPublicDTO): boolean {
    // In a real implementation, this would check if the user has a webhook URL configured
    // For now, we always return false as webhook delivery is not yet implemented
    return false;
  }
}