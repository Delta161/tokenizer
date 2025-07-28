import { PrismaClient, Notification, Prisma } from '@prisma/client';
import { NotificationDto, CreateNotificationDto } from '../types/notification.types';
import { UserPublicDTO } from '../../accounts/types/user.types';
import { mapUserToPublicDTO } from '../../accounts/utils/user.utils';
import { logger } from '@utils/logger';
import { mapNotificationToDto } from '../utils/notification.mapper';

/**
 * Service for managing notifications
 */
export class NotificationService {
  private prisma: PrismaClient;

  /**
   * Create a new notification service
   * @param prisma - Prisma client instance
   */
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Send a notification to a user
   * @param userId - ID of the user to notify
   * @param type - Notification type
   * @param title - Notification title
   * @param message - Notification message
   * @param metadata - Optional additional data
   * @returns Created notification as DTO
   */
  async sendNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<NotificationDto> {
    try {
      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Create notification
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          isRead: false,
        },
      });

      // Log notification creation
      logger.info(`Notification created for user ${userId}`, {
        notificationId: notification.id,
        userId,
        type,
        module: 'NotificationService',
      });

      // Return mapped DTO
      return mapNotificationToDto(notification);
    } catch (error) {
      logger.error('Error creating notification', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        type,
        module: 'NotificationService',
      });
      throw error;
    }
  }

  /**
   * Send a broadcast notification to multiple users
   * @param userIds - IDs of users to notify
   * @param type - Notification type
   * @param title - Notification title
   * @param message - Notification message
   * @param metadata - Optional additional data
   * @returns Array of created notifications as DTOs
   */
  async sendBroadcastNotification(
    userIds: string[],
    type: string,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<NotificationDto[]> {
    try {
      // Verify users exist
      const users = await this.prisma.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          id: true,
        },
      });

      const foundUserIds = users.map((user) => user.id);
      const missingUserIds = userIds.filter((id) => !foundUserIds.includes(id));

      if (missingUserIds.length > 0) {
        logger.warn(`Some users not found for broadcast notification`, {
          missingUserIds,
          module: 'NotificationService',
        });
      }

      // Create notifications for found users
      const notifications = await Promise.all(
        foundUserIds.map(async (userId) => {
          return this.sendNotification(userId, type, title, message, metadata);
        })
      );

      // Log broadcast
      logger.info(`Broadcast notification sent to ${notifications.length} users`, {
        userCount: notifications.length,
        type,
        module: 'NotificationService',
      });

      return notifications;
    } catch (error) {
      logger.error('Error sending broadcast notification', {
        error: error instanceof Error ? error.message : String(error),
        userCount: userIds.length,
        type,
        module: 'NotificationService',
      });
      throw error;
    }
  }

  /**
   * Get notifications for a user with filtering and pagination
   * @param userId - User ID
   * @param options - Filter and pagination options
   * @returns Array of notification DTOs
   */
  async getUserNotifications(
    userId: string,
    options?: {
      read?: boolean;
      type?: string;
      skip?: number;
      take?: number;
    }
  ): Promise<NotificationDto[]> {
    try {
      // Build where clause
      const where: Prisma.NotificationWhereInput = {
        userId,
      };

      // Add read filter if provided
      if (options?.read !== undefined) {
        where.isRead = options.read;
      }

      // Add type filter if provided
      if (options?.type) {
        where.type = options.type;
      }

      // Get notifications with pagination
      const notifications = await this.prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: options?.skip,
        take: options?.take || 10,
      });

      // Map to DTOs
      return notifications.map(mapNotificationToDto);
    } catch (error) {
      logger.error('Error getting user notifications', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        module: 'NotificationService',
      });
      throw error;
    }
  }

  /**
   * Get count of unread notifications for a user
   * @param userId - User ID
   * @returns Count of unread notifications
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      // Count unread notifications
      const count = await this.prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      logger.error('Error getting unread notification count', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        module: 'NotificationService',
      });
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param notificationId - Notification ID
   * @param userId - User ID (for ownership verification)
   * @returns Updated notification as DTO or null if not found
   */
  async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<NotificationDto | null> {
    try {
      // Find and update notification
      const notification = await this.prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        return null;
      }

      // Only update if not already read
      if (!notification.isRead) {
        const updatedNotification = await this.prisma.notification.update({
          where: {
            id: notificationId,
          },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });

        return mapNotificationToDto(updatedNotification);
      }

      // Already read, just return current state
      return mapNotificationToDto(notification);
    } catch (error) {
      logger.error('Error marking notification as read', {
        error: error instanceof Error ? error.message : String(error),
        notificationId,
        userId,
        module: 'NotificationService',
      });
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param userId - User ID
   * @returns Count of notifications marked as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      // Update all unread notifications for user
      const result = await this.prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return result.count;
    } catch (error) {
      logger.error('Error marking all notifications as read', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        module: 'NotificationService',
      });
      throw error;
    }
  }

  /**
   * Delete a notification
   * @param notificationId - Notification ID
   * @param userId - User ID (for ownership verification)
   * @returns True if deleted, false if not found
   */
  async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Find notification to verify ownership
      const notification = await this.prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        return false;
      }

      // Delete notification
      await this.prisma.notification.delete({
        where: {
          id: notificationId,
        },
      });

      return true;
    } catch (error) {
      logger.error('Error deleting notification', {
        error: error instanceof Error ? error.message : String(error),
        notificationId,
        userId,
        module: 'NotificationService',
      });
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   * @param userId - User ID
   * @returns Count of deleted notifications
   */
  async deleteAllNotifications(userId: string): Promise<number> {
    try {
      // Delete all notifications for user
      const result = await this.prisma.notification.deleteMany({
        where: {
          userId,
        },
      });

      return result.count;
    } catch (error) {
      logger.error('Error deleting all notifications', {
        error: error instanceof Error ? error.message : String(error),
        userId,
        module: 'NotificationService',
      });
      throw error;
    }
  }
}