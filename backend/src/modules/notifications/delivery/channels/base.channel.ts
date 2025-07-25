import { NotificationChannel, NotificationDto } from '../../notifications.types';
import { UserPublicDTO } from '../../../accounts/types/user.types';
import { logger } from '@utils/logger';

/**
 * Abstract base class for notification channels
 * Provides common functionality for all channel implementations
 */
export abstract class BaseNotificationChannel implements NotificationChannel {
  protected readonly module: string;

  /**
   * Channel identifier
   */
  abstract readonly channelId: string;
  
  constructor() {
    this.module = `NotificationChannel:${this.constructor.name}`;
  }

  /**
   * Send a notification through this channel
   * @param user - User to send notification to
   * @param notification - Notification to send
   */
  abstract send(user: UserPublicDTO, notification: NotificationDto): Promise<void>;
  
  /**
   * Check if this channel is available for the given user and notification
   * Default implementation returns true
   * Override in subclasses to implement specific availability logic
   * @param user - User to check
   * @param notification - Notification to check
   * @returns True if channel is available
   */
  isAvailableFor(user: UserPublicDTO, notification?: NotificationDto): boolean {
    return true;
  }
  
  /**
   * Format notification title for delivery
   * @param notification - Notification to format
   * @returns Formatted title
   */
  formatTitle(notification: NotificationDto): string {
    return notification.title;
  }
  
  /**
   * Format notification message for delivery
   * @param notification - Notification to format
   * @returns Formatted message
   */
  formatMessage(notification: NotificationDto): string {
    return notification.message;
  }

  /**
   * Log a delivery attempt
   * @param user - User the notification is being sent to
   * @param notification - The notification being sent
   * @param success - Whether the delivery was successful
   * @param error - Error message if delivery failed
   */
  protected logDeliveryAttempt(
    user: UserPublicDTO,
    notification: NotificationDto,
    success: boolean,
    error?: string
  ): void {
    if (success) {
      logger.info(
        `Successfully delivered notification ${notification.id} to user ${user.id} via ${this.channelId}`,
        {
          module: this.module,
          notificationId: notification.id,
          userId: user.id,
          channel: this.channelId,
          eventType: 'notification_delivery_success'
        }
      );
    } else {
      logger.error(
        `Failed to deliver notification ${notification.id} to user ${user.id} via ${this.channelId}: ${error}`,
        {
          module: this.module,
          notificationId: notification.id,
          userId: user.id,
          channel: this.channelId,
          error,
          eventType: 'notification_delivery_failure'
        }
      );
    }
  }
}