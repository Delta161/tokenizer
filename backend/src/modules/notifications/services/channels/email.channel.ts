import { NotificationDto } from '../../types/notification.types';
import { UserPublicDTO } from '../../../accounts/types/user.types';
import { BaseNotificationChannel } from './base.channel';

/**
 * Email notification channel
 */
export class EmailNotificationChannel extends BaseNotificationChannel {
  /**
   * Create a new email notification channel
   */
  constructor() {
    super('email');
  }

  /**
   * Send a notification via email
   * @param user - User to send notification to
   * @param notification - Notification to send
   */
  async send(user: UserPublicDTO, notification: NotificationDto): Promise<void> {
    if (!this.isAvailableFor(user, notification)) {
      this.logDeliveryAttempt(user, notification, 'skipped', 'User has no email address');
      return;
    }

    try {
      // In a real implementation, this would send an actual email
      // For now, we just log the attempt
      console.log(`[EMAIL] Delivering notification to ${user.email}: ${notification.title}`);
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.logDeliveryAttempt(user, notification, 'success');
    } catch (error) {
      this.logDeliveryAttempt(user, notification, 'failed', error);
      throw error;
    }
  }

  /**
   * Check if email channel is available for the given user
   * @param user - User to check
   * @returns True if user has an email address
   */
  isAvailableFor(user: UserPublicDTO): boolean {
    return Boolean(user.email);
  }

  /**
   * Format email subject from notification title
   * @param notification - Notification to format
   * @returns Formatted email subject
   */
  protected formatTitle(notification: NotificationDto): string {
    return `[Tokenizer] ${notification.title}`;
  }
}