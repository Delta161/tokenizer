import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notifications.service';
import { NotificationDispatcherService, createNotificationDispatcher } from './delivery';
import { NotificationConfig } from './notifications.config';
import { UserPublicDTO } from '../user/user.types';
import { Logger } from '../../utils/logger';
import { CreateNotificationDto, NotificationDto } from './notifications.types';

/**
 * Interface for notification trigger functionality
 */
export interface NotificationTriggerInterface {
  /**
   * Trigger a notification for a single user
   * @param notificationData - Data for the notification
   * @returns The created notification or null if creation failed
   */
  triggerNotification(notificationData: CreateNotificationDto): Promise<NotificationDto | null>;
  
  /**
   * Trigger a broadcast notification for multiple users
   * @param userIds - IDs of users to send notification to
   * @param notificationData - Data for the notification (without userId)
   * @returns Array of created notifications
   */
  triggerBroadcast(
    userIds: string[],
    notificationData: Omit<CreateNotificationDto, 'userId'>
  ): Promise<NotificationDto[]>;
}

/**
 * Class that handles triggering notifications
 * Creates notifications in the database and dispatches them through available channels
 */
export class NotificationTrigger implements NotificationTriggerInterface {
  private notificationService: NotificationService;
  private dispatcher: NotificationDispatcherService;
  private logger: Logger;
  
  /**
   * Create a new notification trigger
   * @param notificationService - Service for creating and managing notifications
   * @param dispatcher - Service for dispatching notifications to channels
   */
  constructor(
    notificationService: NotificationService,
    dispatcher: NotificationDispatcherService
  ) {
    this.notificationService = notificationService;
    this.dispatcher = dispatcher;
    this.logger = new Logger('NotificationTrigger');
  }
  
  /**
   * Trigger a notification for a single user
   * @param notificationData - Data for the notification
   * @returns The created notification or null if creation failed
   */
  async triggerNotification(
    notificationData: CreateNotificationDto
  ): Promise<NotificationDto | null> {
    try {
      const { userId, type, title, message, metadata } = notificationData;
      
      // Create notification in database
      const notification = await this.notificationService.sendNotification(
        userId,
        type,
        title,
        message,
        metadata
      );
      
      // Get user details for notification delivery
      const user = await this.notificationService.getUserForNotification(userId);
      
      if (!user) {
        this.logger.error(`User not found for notification delivery: ${userId}`, {
          userId,
          notificationId: notification.id,
          module: 'notifications',
          eventType: 'notification_delivery_failure'
        });
        return notification;
      }
      
      // Dispatch notification to available channels
      await this.dispatcher.dispatchNotification(user, notification);
      
      return notification;
    } catch (error) {
      this.logger.error(`Failed to trigger notification: ${error instanceof Error ? error.message : String(error)}`, {
        userId: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        error: error instanceof Error ? error.message : String(error),
        module: 'notifications',
        eventType: 'notification_delivery_failure'
      });
      return null;
    }
  }
  
  /**
   * Trigger a broadcast notification for multiple users
   * @param userIds - IDs of users to send notification to
   * @param notificationData - Data for the notification (without userId)
   * @returns Array of created notifications
   */
  async triggerBroadcast(
    userIds: string[],
    notificationData: Omit<CreateNotificationDto, 'userId'>
  ): Promise<NotificationDto[]> {
    try {
      const { type, title, message, metadata } = notificationData;
      
      // Create notifications in database
      const notifications = await this.notificationService.sendBroadcast(
        userIds,
        type,
        title,
        message,
        metadata
      );
      
      // Process users in batches to avoid overwhelming the system
      const batchSize = 10;
      const batches = [];
      
      // Create batches of user IDs
      for (let i = 0; i < userIds.length; i += batchSize) {
        batches.push(userIds.slice(i, i + batchSize));
      }
      
      // Process each batch
      for (const batchUserIds of batches) {
        // Get user details for each user in batch
        const userPromises = batchUserIds.map(userId => 
          this.notificationService.getUserForNotification(userId)
        );
        
        const users = await Promise.all(userPromises);
        const validUsers = users.filter(Boolean) as UserPublicDTO[];
        
        // Get notification for each user
        const notificationPromises = validUsers.map(user => 
          this.notificationService.getNotificationById(user.id, type, title, message)
        );
        
        const batchNotifications = await Promise.all(notificationPromises);
        
        // Dispatch notifications
        const dispatchPromises = validUsers.map((user, index) => {
          const notification = batchNotifications[index];
          if (!notification) return Promise.resolve();
          
          return this.dispatcher.dispatchNotification(user, notification)
            .catch(error => {
              this.logger.error(`Failed to dispatch broadcast notification: ${error instanceof Error ? error.message : String(error)}`, {
                userId: user.id,
                notificationId: notification.id,
                error: error instanceof Error ? error.message : String(error),
                module: 'notifications',
                eventType: 'notification_delivery_failure'
              });
              return null;
            });
        });
        
        await Promise.all(dispatchPromises);
      }
      
      return notifications;
    } catch (error) {
      this.logger.error(`Failed to trigger broadcast notification: ${error instanceof Error ? error.message : String(error)}`, {
        userCount: userIds.length,
        type: notificationData.type,
        title: notificationData.title,
        error: error instanceof Error ? error.message : String(error),
        module: 'notifications',
        eventType: 'notification_delivery_failure'
      });
      return [];
    }
  }
}

/**
 * Create a notification trigger with the given configuration
 * @param prisma - Prisma client instance
 * @param config - Notification configuration
 * @returns Initialized notification trigger
 */
export const createNotificationTrigger = (
  prisma: PrismaClient,
  config: NotificationConfig
): NotificationTriggerInterface => {
  // Create notification service
  const notificationService = new NotificationService(prisma);
  
  // Create notification dispatcher
  const dispatcher = createNotificationDispatcher(config);
  
  // Create and return notification trigger
  return new NotificationTrigger(notificationService, dispatcher);
};