import { NotificationDto } from '../../types/notification.types';
import { UserPublicDTO } from '../../../accounts/types/user.types';
import { notificationLogger } from '../../utils/notification.logger';

/**
 * Base class for notification channels
 */
export abstract class BaseNotificationChannel {
  /**
   * Unique identifier for the channel
   */
  readonly channelId: string;

  /**
   * Create a new notification channel
   * @param channelId - Unique identifier for the channel
   */
  constructor(channelId: string) {
    this.channelId = channelId;
  }

  /**
   * Send a notification through this channel
   * @param user - User to send notification to
   * @param notification - Notification to send
   */
  abstract send(user: UserPublicDTO, notification: NotificationDto): Promise<void>;

  /**
   * Check if this channel is available for the given user and notification
   * @param user - User to check
   * @param notification - Notification to check
   * @returns True if channel is available
   */
  abstract isAvailableFor(user: UserPublicDTO, notification?: NotificationDto): boolean;

  /**
   * Format notification title
   * @param notification - Notification to format
   * @returns Formatted title
   */
  protected formatTitle(notification: NotificationDto): string {
    return notification.title;
  }

  /**
   * Format notification message
   * @param notification - Notification to format
   * @returns Formatted message
   */
  protected formatMessage(notification: NotificationDto): string {
    return notification.message;
  }

  /**
   * Log delivery attempt
   * @param user - User receiving notification
   * @param notification - Notification being sent
   * @param status - Delivery status
   * @param error - Error if any
   */
  protected logDeliveryAttempt(
    user: UserPublicDTO,
    notification: NotificationDto,
    status: string,
    error?: Error | string
  ): void {
    const context: Record<string, any> = {};
    
    if (error) {
      context.error = error instanceof Error ? error.message : error;
    }
    
    notificationLogger.deliveryAttempt(
      notification.id,
      user.id,
      this.channelId,
      status,
      context
    );
  }
}