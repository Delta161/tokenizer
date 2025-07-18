import { PrismaClient } from '@prisma/client';
import { NotificationType } from '../types/notifications.types';
import { NotificationService } from '../services/notifications.service';
import { NotificationDispatcherService, createNotificationDispatcher } from '../delivery';
import { NotificationConfig } from '../config/notification.config';
import { notificationLogger } from '../utils/notifications.logger';

/**
 * Notification trigger utility
 * Provides a simple interface for other modules to trigger notifications
 */
export class NotificationTrigger {
  private notificationService: NotificationService;
  private dispatcherService: NotificationDispatcherService;
  
  /**
   * Create a new NotificationTrigger
   * @param prisma - Prisma client instance
   * @param config - Optional notification configuration
   */
  constructor(prisma: PrismaClient, config?: Partial<NotificationConfig>) {
    this.notificationService = new NotificationService(prisma);
    this.dispatcherService = createNotificationDispatcher(config);
    
    notificationLogger.info('Notification trigger initialized');
  }
  
  /**
   * Trigger a notification for a user
   * This will create the notification in the database and dispatch it through available channels
   * @param userId - ID of the user to notify
   * @param type - Type of notification
   * @param title - Notification title
   * @param message - Notification message
   * @param metadata - Additional metadata for the notification
   * @returns Promise resolving to the created notification ID
   */
  async triggerNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<string> {
    try {
      // Create the notification in the database
      const notification = await this.notificationService.sendNotification({
        userId,
        type,
        title,
        message,
        metadata
      });
      
      // Get the user for delivery
      const user = await this.notificationService.getUserForNotification(userId);
      
      if (!user) {
        notificationLogger.warn('User not found for notification delivery', {
          userId,
          notificationId: notification.id
        });
        return notification.id;
      }
      
      // Dispatch the notification asynchronously
      // We don't await this to avoid blocking the caller
      this.dispatcherService.dispatchNotification(user, notification)
        .catch(error => {
          notificationLogger.error('Failed to dispatch notification', {
            notificationId: notification.id,
            userId,
            error: error instanceof Error ? error.message : String(error)
          });
        });
      
      return notification.id;
    } catch (error) {
      notificationLogger.error('Failed to trigger notification', {
        userId,
        type,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw error;
    }
  }
  
  /**
 * Trigger a broadcast notification for all users
 * This will create the notification in the database for each user and dispatch it through available channels
 * @param adminId - ID of the admin triggering the broadcast
 * @param type - Type of notification
 * @param title - Notification title
 * @param message - Notification message
 * @param metadata - Additional metadata for the notification
 * @returns Promise resolving to an object containing the count of created notifications and their IDs
 */
async triggerBroadcast(
  adminId: string,
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Record<string, unknown>
): Promise<{ count: number; notificationIds: string[] }> {
  try {
    // Create the broadcast notifications in the database
    const result = await this.notificationService.sendBroadcast({
      adminId,
      type,
      title,
      message,
      metadata
    });
    
    notificationLogger.info('Broadcast notification triggered', {
      adminId,
      type,
      notificationsCount: result.count,
      notificationIds: result.notificationIds
    });
    
    // Dispatch each notification asynchronously
    // We don't await this to avoid blocking the caller
    if (result.notificationIds.length > 0) {
      // Process notifications in batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < result.notificationIds.length; i += batchSize) {
        const batch = result.notificationIds.slice(i, i + batchSize);
        
        // Process each notification in the batch
        await Promise.all(batch.map(async (notificationId) => {
          try {
            // Get the notification from the database
            const notification = await this.notificationService.getNotificationById(notificationId);
            if (!notification) return;
            
            // Get the user for delivery
            const user = await this.notificationService.getUserForNotification(notification.userId);
            if (!user) return;
            
            // Dispatch the notification
            await this.dispatcherService.dispatchNotification(user, notification);
          } catch (error) {
            notificationLogger.error('Failed to dispatch broadcast notification', {
              notificationId,
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }));
      }
    }
    
    return result;
  } catch (error) {
    notificationLogger.error('Failed to trigger broadcast notification', {
      adminId,
      type,
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw error;
  }
  }
}

/**
 * Create a notification trigger instance
 * @param prisma - Prisma client instance
 * @param config - Optional notification configuration
 * @returns NotificationTrigger instance
 */
export function createNotificationTrigger(
  prisma: PrismaClient,
  config?: Partial<NotificationConfig>
): NotificationTrigger {
  return new NotificationTrigger(prisma, config);
}