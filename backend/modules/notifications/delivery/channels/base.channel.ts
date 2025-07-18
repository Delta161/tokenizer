import { NotificationDto } from '../../types/notifications.types';
import { UserPublicDTO } from '../../../user/user.types';

/**
 * Base interface for notification delivery channels
 * All channel implementations must implement this interface
 */
export interface NotificationChannel {
  /**
   * Channel identifier
   */
  readonly channelId: string;
  
  /**
   * Send a notification through this channel
   * @param user - User to send notification to
   * @param notification - Notification to send
   * @returns Promise resolving when delivery is complete
   */
  send(user: UserPublicDTO, notification: NotificationDto): Promise<void>;
  
  /**
   * Check if this channel is available for the given user and notification
   * @param user - User to check
   * @param notification - Notification to check
   * @returns True if channel is available
   */
  isAvailableFor(user: UserPublicDTO, notification: NotificationDto): boolean;
}

/**
 * Abstract base class for notification channels
 * Provides common functionality for all channel implementations
 */
export abstract class BaseNotificationChannel implements NotificationChannel {
  /**
   * Channel identifier
   */
  abstract readonly channelId: string;
  
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
  isAvailableFor(user: UserPublicDTO, notification: NotificationDto): boolean {
    return true;
  }
  
  /**
   * Format notification title for delivery
   * @param notification - Notification to format
   * @returns Formatted title
   */
  protected formatTitle(notification: NotificationDto): string {
    return notification.title;
  }
  
  /**
   * Format notification message for delivery
   * @param notification - Notification to format
   * @returns Formatted message
   */
  protected formatMessage(notification: NotificationDto): string {
    return notification.message;
  }
}