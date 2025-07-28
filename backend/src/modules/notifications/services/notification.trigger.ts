import { NotificationService } from './notification.service';
import { NotificationDispatcherService } from './dispatcher.service';
import { CreateNotificationDto, NotificationType } from '../types/notification.types';
import { notificationLogger } from '../utils/notification.logger';

/**
 * Interface for notification trigger
 */
export interface NotificationTriggerInterface {
  /**
   * Trigger a notification for a single user
   * @param userId - User ID
   * @param type - Notification type
   * @param title - Notification title
   * @param message - Notification message
   * @param metadata - Additional metadata
   * @returns Promise resolving to the created notification ID
   */
  triggerNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<string>;

  /**
   * Trigger a notification for multiple users
   * @param userIds - Array of user IDs
   * @param type - Notification type
   * @param title - Notification title
   * @param message - Notification message
   * @param metadata - Additional metadata
   * @returns Promise resolving to an array of created notification IDs
   */
  triggerBroadcastNotification(
    userIds: string[],
    type: string,
    title: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<string[]>;
}

/**
 * Service for triggering notifications
 */
export class NotificationTrigger implements NotificationTriggerInterface {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationDispatcher: NotificationDispatcherService
  ) {}

  /**
   * Trigger a notification for a single user
   * @param userId - User ID
   * @param type - Notification type
   * @param title - Notification title
   * @param message - Notification message
   * @param metadata - Additional metadata
   * @returns Promise resolving to the created notification ID
   */
  async triggerNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<string> {
    try {
      // Create notification in database
      const notificationData: CreateNotificationDto = {
        userId,
        type,
        title,
        message,
        metadata,
      };

      const notification = await this.notificationService.createNotification(notificationData);

      // Dispatch notification to channels
      await this.notificationDispatcher.dispatchNotification(notification);

      return notification.id;
    } catch (error) {
      notificationLogger.error(
        'triggerNotification',
        error instanceof Error ? error : String(error),
        { userId, type }
      );
      throw error;
    }
  }

  /**
   * Trigger a notification for multiple users
   * @param userIds - Array of user IDs
   * @param type - Notification type
   * @param title - Notification title
   * @param message - Notification message
   * @param metadata - Additional metadata
   * @returns Promise resolving to an array of created notification IDs
   */
  async triggerBroadcastNotification(
    userIds: string[],
    type: string,
    title: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<string[]> {
    try {
      const notificationIds: string[] = [];

      // Create notifications for each user
      for (const userId of userIds) {
        const notificationId = await this.triggerNotification(
          userId,
          type,
          title,
          message,
          metadata
        );
        notificationIds.push(notificationId);
      }

      notificationLogger.broadcastSent(userIds.length, type);

      return notificationIds;
    } catch (error) {
      notificationLogger.error(
        'triggerBroadcastNotification',
        error instanceof Error ? error : String(error),
        { userCount: userIds.length, type }
      );
      throw error;
    }
  }
}

/**
 * Create a notification trigger service
 * @param notificationService - Notification service
 * @param notificationDispatcher - Notification dispatcher service
 * @returns NotificationTrigger instance
 */
export const createNotificationTrigger = (
  notificationService: NotificationService,
  notificationDispatcher: NotificationDispatcherService
): NotificationTrigger => {
  return new NotificationTrigger(notificationService, notificationDispatcher);
};