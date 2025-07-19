import { NotificationDto } from '../../notifications.types';
import { UserPublicDTO } from '../../../user/user.types';
import { BaseNotificationChannel } from './base.channel';

/**
 * Email notification channel
 * This is a stub implementation for future email delivery
 */
export class EmailNotificationChannel extends BaseNotificationChannel {
  /**
   * Channel identifier
   */
  readonly channelId: string = 'email';
  
  /**
   * Send a notification through the email channel
   * Currently just logs that it would send an email (stub implementation)
   * @param user - User to send notification to
   * @param notification - Notification to send
   */
  async send(user: UserPublicDTO, notification: NotificationDto): Promise<void> {
    try {
      this.logger.info(`Attempting to deliver notification ${notification.id} to user ${user.id} via email channel`);
      
      // TODO: Implement actual email sending logic
      // This would integrate with an email service provider
      
      // Log that this is a stub implementation
      this.logger.info(`Email delivery not implemented yet for notification ${notification.id}`);
      
      // Mark as successful since we're just simulating
      this.logDeliveryAttempt(user, notification, true);
    } catch (error) {
      // Log delivery failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logDeliveryAttempt(user, notification, false, errorMessage);
      
      // Re-throw the error for the dispatcher to handle
      throw error;
    }
  }
  
  /**
   * Check if this channel is available for the given user
   * Email notifications are available if the user has an email address
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
  formatTitle(notification: NotificationDto): string {
    return `[Tokenizer] ${notification.title}`;
  }
}