import { NotificationDto } from '../../types/notifications.types';
import { UserPublicDTO } from '../../../user/user.types';
import { BaseNotificationChannel } from './base.channel';
import { notificationLogger } from '../../utils/notifications.logger';

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
      // Log the delivery attempt
      notificationLogger.deliveryAttempt(
        notification.id,
        user.id,
        this.channelId,
        'pending'
      );
      
      // TODO: Implement actual email sending logic
      // This would integrate with an email service provider
      
      // Log that this is a stub implementation
      notificationLogger.notificationEvent('Email delivery not implemented yet', {
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
  protected formatTitle(notification: NotificationDto): string {
    return `[Tokenizer] ${notification.title}`;
  }
}